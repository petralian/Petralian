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
FILE_CRON="$(read_env_key "$ENV_FILE" CRON_SECRET)"
if [[ -z "$FILE_CRON" && -n "$ENV_FILE" ]]; then
  for key in DIGEST_SECRET SITEMONITOR_SECRET ADMIN_TOKEN; do
    FILE_CRON="$(read_env_key "$ENV_FILE" "$key")"
    [[ -n "$FILE_CRON" ]] && break
  done
fi

if [[ -z "$FILE_CRON" && -n "$ENV_FILE" ]]; then
  FILE_CRON="$(generate_cron_secret)"
  log "CRON_SECRET missing in sitemonitor .env — generating and persisting (digest API + internal cron)"
  set_env_key "$ENV_FILE" "CRON_SECRET" "$FILE_CRON"
  NEED_RECREATE=1
elif [[ -n "$FILE_CRON" && -n "$CONTAINER_CRON" && "$FILE_CRON" != "$CONTAINER_CRON" ]]; then
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
      fetch(url, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + process.env.TRIGGER_SECRET },
      })
        .then(async (r) => console.log(r.status, (await r.text()).slice(0, 500)))
        .catch((e) => console.error(e.message));
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
