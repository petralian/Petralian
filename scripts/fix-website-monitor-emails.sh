#!/usr/bin/env bash
# Restore SiteMonitor (mon.petralian.com) daily digest emails on VPS.
# SiteMonitor runs in Docker (container: sitemonitor, host port 3010).
set -euo pipefail

log() { echo "[monitor-fix] $*"; }
warn() { echo "[monitor-fix] WARN: $*" >&2; }

set_env_key() {
  local file="$1" key="$2" value="$3"
  [[ -z "$file" || -z "$value" ]] && return 0
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

read_env_key() {
  local file="$1" key="$2"
  [[ -f "$file" ]] && grep -E "^${key}=" "$file" | cut -d= -f2- | head -1 || true
}

read_trigger_secret() {
  local from_container="$1"
  if [[ -n "$ENV_FILE" ]]; then
    local from_env_file=""
    for key in CRON_SECRET DIGEST_SECRET SITEMONITOR_SECRET ADMIN_TOKEN; do
      from_env_file="$(read_env_key "$ENV_FILE" "$key")"
      [[ -n "$from_env_file" ]] && echo "$from_env_file" && return 0
    done
  fi
  [[ -n "$from_container" ]] && echo "$from_container" && return 0
  return 1
}

container_env_key() {
  local key="$1"
  docker exec sitemonitor printenv "$key" 2>/dev/null || true
}

sitemonitor_app_port() {
  local p
  p="$(container_env_key PORT)"
  [[ -n "$p" ]] && echo "$p" && return 0
  p="$(docker inspect sitemonitor --format '{{range $k, $v := .Config.Env}}{{if eq $k "PORT"}}{{$v}}{{end}}{{end}}' 2>/dev/null || true)"
  [[ -n "$p" ]] && echo "$p" && return 0
  echo "3000"
}

generate_cron_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 24
  else
    head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n'
  fi
}

read_host_monitor_cron_secret() {
  local d secret
  for d in /www/wwwroot/mon.petralian.com /www/wwwroot/sitemonitor /www/wwwroot/website-monitor; do
    [[ ! -d "$d" ]] && continue
    for secret in \
      "$(read_env_key "$d/.env" CRON_SECRET)" \
      "$(read_env_key "$d/.env" DIGEST_SECRET)" \
      "$(read_env_key "$d/.env.production" CRON_SECRET)"; do
      [[ -n "$secret" ]] && echo "$secret" && return 0
    done
    if [[ -f "$d/data/config.json" ]]; then
      secret="$(node -e "
        const fs = require('fs');
        const pick = (o) => {
          if (!o || typeof o !== 'object') return '';
          return o.cronSecret || (o.digest && o.digest.cronSecret) || (o.cron && o.cron.secret) || '';
        };
        try { const s = pick(JSON.parse(fs.readFileSync('$d/data/config.json', 'utf8'))); if (s) console.log(s); } catch {}
      " 2>/dev/null || true)"
      [[ -n "$secret" ]] && echo "$secret" && return 0
    fi
  done
  return 1
}

read_sitemonitor_config_cron_secret() {
  docker exec sitemonitor node -e "
    const fs = require('fs');
    const paths = ['data/config.json', '/app/data/config.json', 'config.json'];
    const pick = (o) => {
      if (!o || typeof o !== 'object') return '';
      return (
        o.cronSecret ||
        o.CRON_SECRET ||
        (o.cron && (o.cron.secret || o.cron.cronSecret)) ||
        (o.digest && (o.digest.cronSecret || o.digest.secret)) ||
        (o.auth && (o.auth.cronSecret || o.auth.adminToken)) ||
        ''
      );
    };
    for (const p of paths) {
      try {
        const s = pick(JSON.parse(fs.readFileSync(p, 'utf8')));
        if (s) {
          console.log(s);
          process.exit(0);
        }
      } catch {}
    }
  " 2>/dev/null || true
}

write_sitemonitor_config_cron_secret() {
  local secret="$1"
  [[ -z "$secret" ]] && return 0
  docker exec -e SYNC_SECRET="$secret" sitemonitor node -e "
    const fs = require('fs');
    const path = require('path');
    const secret = process.env.SYNC_SECRET;
    const paths = ['data/config.json', '/app/data/config.json'];
    let updated = false;
    for (const p of paths) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const o = JSON.parse(raw);
        if (o.cronSecret === secret) continue;
        o.cronSecret = secret;
        if (o.digest && typeof o.digest === 'object') o.digest.cronSecret = secret;
        if (o.cron && typeof o.cron === 'object') o.cron.secret = secret;
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, JSON.stringify(o, null, 2));
        console.log('config-sync', p);
        updated = true;
      } catch {}
    }
    if (!updated) console.log('config-sync-skip');
  " 2>/dev/null || true
}

# ── Resolve compose dir from container labels ────────────────────────────────
COMPOSE_DIR=""
ENV_FILE=""
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  COMPOSE_DIR="$(docker inspect sitemonitor --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' 2>/dev/null || true)"
fi
if [[ -z "$COMPOSE_DIR" || ! -d "$COMPOSE_DIR" ]]; then
  for d in /opt/sitemonitor /www/wwwroot/mon.petralian.com /www/wwwroot/sitemonitor /www/wwwroot/website-monitor /root/sitemonitor; do
    [[ -f "$d/docker-compose.yml" || -f "$d/compose.yml" ]] && COMPOSE_DIR="$d" && break
  done
fi

if [[ -n "$COMPOSE_DIR" ]]; then
  for f in "$COMPOSE_DIR/.env" "$COMPOSE_DIR/.env.production"; do
    [[ -f "$f" ]] && ENV_FILE="$f" && break
  done
  if [[ -z "$ENV_FILE" ]]; then
    ENV_FILE="$COMPOSE_DIR/.env"
    touch "$ENV_FILE"
    log "Created compose env file at $ENV_FILE"
  fi
fi

log "compose_dir=${COMPOSE_DIR:-not_found}"
if [[ -n "$ENV_FILE" ]]; then
  log "env_file=$ENV_FILE keys=$(grep -E '^[A-Z_]+=' "$ENV_FILE" | cut -d= -f1 | tr '\n' ',' | sed 's/,$//')"
else
  warn "No compose .env found — Brevo/cron fixes may not persist across recreate"
fi

# ── Source of truth: petralian production .env (Brevo only) ─────────────────
PETRALIAN_ENV="/www/wwwroot/petralian/.env"
PETRALIAN_BREVO=""
if [[ -f "$PETRALIAN_ENV" ]]; then
  PETRALIAN_BREVO="$(grep -E '^BREVO_API_KEY=' "$PETRALIAN_ENV" | cut -d= -f2- || true)"
fi

CONTAINER_BREVO=""
CONTAINER_CRON=""
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  CONTAINER_BREVO="$(container_env_key BREVO_API_KEY)"
  CONTAINER_CRON="$(container_env_key CRON_SECRET)"
fi

BREVO_BROKEN=0
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  if docker logs sitemonitor --since 48h 2>&1 | grep -q 'Key not found'; then
    BREVO_BROKEN=1
    log "Detected invalid Brevo API key in recent container logs"
  fi
fi

NEED_RECREATE=0
if [[ -n "$PETRALIAN_BREVO" && ( "$BREVO_BROKEN" == "1" || -z "$CONTAINER_BREVO" || "$CONTAINER_BREVO" != "$PETRALIAN_BREVO" ) ]]; then
  log "Syncing BREVO_API_KEY from petralian .env into sitemonitor compose env"
  NEED_RECREATE=1
  set_env_key "$ENV_FILE" "BREVO_API_KEY" "$PETRALIAN_BREVO"
fi

# Do NOT sync CRON_SECRET from petralian — SiteMonitor uses its own digest auth secret.
CONFIG_CRON="$(read_host_monitor_cron_secret || true)"
if [[ -z "$CONFIG_CRON" ]] && docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  CONFIG_CRON="$(read_sitemonitor_config_cron_secret)"
fi

FILE_CRON="$(read_env_key "$ENV_FILE" CRON_SECRET)"
if [[ -z "$FILE_CRON" && -n "$ENV_FILE" ]]; then
  for key in DIGEST_SECRET SITEMONITOR_SECRET ADMIN_TOKEN; do
    FILE_CRON="$(read_env_key "$ENV_FILE" "$key")"
    [[ -n "$FILE_CRON" ]] && break
  done
fi

if [[ -n "$CONFIG_CRON" ]]; then
  if [[ "$FILE_CRON" != "$CONFIG_CRON" ]]; then
    log "Aligning compose .env CRON_SECRET with app data/config.json (SSOT)"
    FILE_CRON="$CONFIG_CRON"
    set_env_key "$ENV_FILE" "CRON_SECRET" "$FILE_CRON"
    NEED_RECREATE=1
  fi
elif [[ -z "$FILE_CRON" && -n "$ENV_FILE" ]]; then
  FILE_CRON="$(generate_cron_secret)"
  log "CRON_SECRET missing — generating, persisting to .env and app config"
  set_env_key "$ENV_FILE" "CRON_SECRET" "$FILE_CRON"
  write_sitemonitor_config_cron_secret "$FILE_CRON"
  NEED_RECREATE=1
else
  [[ -n "$FILE_CRON" ]] && write_sitemonitor_config_cron_secret "$FILE_CRON"
fi

if [[ -n "$FILE_CRON" && -n "$CONTAINER_CRON" && "$FILE_CRON" != "$CONTAINER_CRON" ]]; then
  log "Container CRON_SECRET out of sync with compose .env — recreating"
  NEED_RECREATE=1
elif [[ -n "$FILE_CRON" && -z "$CONTAINER_CRON" ]]; then
  log "CRON_SECRET in .env but not in container — recreating"
  NEED_RECREATE=1
fi

CRON_SECRET="$(read_trigger_secret "$CONTAINER_CRON" || true)"
[[ -z "$CRON_SECRET" && -n "$FILE_CRON" ]] && CRON_SECRET="$FILE_CRON"

# ── Recreate container when env changed ──────────────────────────────────────
if [[ "$NEED_RECREATE" == "1" ]]; then
  if [[ -n "$COMPOSE_DIR" && -f "$COMPOSE_DIR/docker-compose.yml" ]]; then
    log "Recreating sitemonitor via docker compose"
    (cd "$COMPOSE_DIR" && docker compose up -d --force-recreate) || docker restart sitemonitor || true
  else
    warn "No compose dir — attempting docker restart (env may need manual update)"
    docker restart sitemonitor || true
  fi
  sleep 5
  CONTAINER_BREVO="$(container_env_key BREVO_API_KEY)"
  CONTAINER_CRON="$(container_env_key CRON_SECRET)"
  CRON_SECRET="$(read_trigger_secret "$CONTAINER_CRON" || true)"
fi

if ! docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  warn "sitemonitor container not running — starting"
  if [[ -n "$COMPOSE_DIR" ]]; then
    (cd "$COMPOSE_DIR" && docker compose up -d) || docker start sitemonitor || true
  else
    docker start sitemonitor 2>/dev/null || true
  fi
  sleep 3
  CONTAINER_CRON="$(container_env_key CRON_SECRET)"
  CRON_SECRET="$(read_trigger_secret "$CONTAINER_CRON" || true)"
fi

log "container env after fix: BREVO=${CONTAINER_BREVO:+set} CRON=${CRON_SECRET:+set}"

log "Recent container logs:"
docker logs sitemonitor --tail 40 2>&1 | grep -iE 'brevo|cron|digest|email|error|fail|notify|listening' | tail -20 || true

# Internal digest cron (0 7 * * * Asia/Singapore) — remove bad external cron if added earlier.
CRON_FILE="/var/spool/cron/crontabs/root"
if [[ -f "$CRON_FILE" ]] && grep -q 'sitemonitor-digest' "$CRON_FILE" 2>/dev/null; then
  sed -i '/sitemonitor-digest/d' "$CRON_FILE"
  log "Removed obsolete external sitemonitor-digest crontab (app has internal cron)"
fi

# ── Trigger digest now (catch-up) ────────────────────────────────────────────
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  TRIGGER_SECRET="$(read_trigger_secret "$(container_env_key CRON_SECRET)" || true)"
  APP_PORT="$(sitemonitor_app_port)"
  log "Triggering catch-up digest on :${APP_PORT} (secret=${TRIGGER_SECRET:+present})"
  if [[ -n "$TRIGGER_SECRET" ]]; then
    docker exec \
      -e TRIGGER_SECRET="$TRIGGER_SECRET" \
      -e APP_PORT="$APP_PORT" \
      sitemonitor node -e "
      const port = process.env.APP_PORT || '3000';
      const url = 'http://127.0.0.1:' + port + '/api/digest/run?send=1';
      const secret = process.env.TRIGGER_SECRET;
      const tryAuth = (headers) =>
        fetch(url, { method: 'POST', headers })
          .then(async (r) => ({ status: r.status, body: (await r.text()).slice(0, 500), headers }));
      (async () => {
        for (const headers of [
          { Authorization: 'Bearer ' + secret },
          { 'x-cron-secret': secret },
          { 'x-api-key': secret },
        ]) {
          const res = await tryAuth(headers).catch((e) => ({ status: 0, body: e.message, headers }));
          console.log(res.status, JSON.stringify(headers), res.body);
          if (res.status >= 200 && res.status < 300) break;
        }
      })();
    " 2>/dev/null || true
  else
    warn "No cron secret for HTTP catch-up — internal digest cron still runs at 07:00 Asia/Singapore if Brevo is set"
    docker exec -e APP_PORT="$APP_PORT" sitemonitor node -e "
      const port = process.env.APP_PORT || '3000';
      fetch('http://127.0.0.1:' + port + '/api/digest/run?send=1', { method: 'POST' })
        .then(async (r) => console.log('no-auth', r.status, (await r.text()).slice(0, 300)))
        .catch((e) => console.error(e.message));
    " 2>/dev/null || true
  fi
  sleep 8
  docker logs sitemonitor --tail 30 2>&1 | grep -iE 'brevo|digest|email|sent|error|queued|Key not found|401' | tail -15 || true
fi

log "Done"
