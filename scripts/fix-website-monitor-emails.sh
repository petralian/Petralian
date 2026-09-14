#!/usr/bin/env bash
# Restore SiteMonitor (mon.petralian.com) daily digest emails on VPS.
# SiteMonitor runs in Docker (container: sitemonitor, host port 3010).
set -euo pipefail

log() { echo "[monitor-fix] $*"; }
warn() { echo "[monitor-fix] WARN: $*" >&2; }

brevo_key_suffix() {
  local k="$1"
  [[ ${#k} -ge 6 ]] && echo "${k: -6}" || echo "(short-or-empty)"
}

normalize_brevo_key() {
  local k="$1"
  echo "$k" | tr -d '\r"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

brevo_account_ok() {
  local key="$1"
  key="$(normalize_brevo_key "$key")"
  [[ -z "$key" ]] && return 1
  local code
  code="$(
    curl -sS -o /dev/null -w '%{http_code}' \
      -H "api-key: ${key}" \
      -H 'accept: application/json' \
      https://api.brevo.com/v3/account 2>/dev/null || echo 000
  )"
  [[ "$code" == "200" ]]
}

# /v3/account can pass while /v3/smtp/email returns "Key not found" if the app uses a stale config.json key.
brevo_smtp_auth_ok() {
  local key="$1"
  key="$(normalize_brevo_key "$key")"
  [[ -z "$key" ]] && return 1
  local body code
  body="$(
    curl -sS -w '\n%{http_code}' -X POST \
      -H "api-key: ${key}" \
      -H 'content-type: application/json' \
      -H 'accept: application/json' \
      -d '{}' \
      https://api.brevo.com/v3/smtp/email 2>/dev/null || echo $'\n000'
  )"
  code="$(echo "$body" | tail -1)"
  body="$(echo "$body" | sed '$d')"
  if echo "$body" | grep -q 'Key not found'; then
    return 1
  fi
  [[ "$code" != "401" ]]
}

log_brevo_smtp_check() {
  local label="$1" key="$2"
  key="$(normalize_brevo_key "$key")"
  [[ -z "$key" ]] && return 0
  if brevo_smtp_auth_ok "$key"; then
    log "BREVO ${label}: suffix=...$(brevo_key_suffix "$key") smtp_auth=yes"
  else
    warn "BREVO ${label}: suffix=...$(brevo_key_suffix "$key") smtp_auth=no — rotate key in Brevo or fix config.json xkeysib-* drift"
  fi
}

log_brevo_key_check() {
  local label="$1" key="$2"
  if [[ -z "$key" ]]; then
    log "BREVO ${label}: (not set)"
    return
  fi
  if brevo_account_ok "$key"; then
    log "BREVO ${label}: suffix=...$(brevo_key_suffix "$key") valid=yes (Brevo /v3/account)"
  else
    warn "BREVO ${label}: suffix=...$(brevo_key_suffix "$key") valid=no — use active key named petralian.com in Brevo (not revoked)"
  fi
}

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

read_volume_cron_secret() {
  local mount_dir secret
  mount_dir="$(docker inspect sitemonitor --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
  [[ -z "$mount_dir" ]] && mount_dir="$(docker inspect sitemonitor --format '{{range .Mounts}}{{if eq .Destination "/data"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
  [[ -z "$mount_dir" || ! -d "$mount_dir" ]] && return 1
  for secret in \
    "$(read_env_key "$mount_dir/.env" CRON_SECRET)" \
    "$(read_env_key "$mount_dir/.env" DIGEST_SECRET)"; do
    [[ -n "$secret" ]] && echo "$secret" && return 0
  done
  if [[ -f "$mount_dir/config.json" ]]; then
    secret="$(node -e "
      const fs = require('fs');
      const pick = (o) => {
        if (!o || typeof o !== 'object') return '';
        return o.cronSecret || (o.digest && o.digest.cronSecret) || (o.cron && o.cron.secret) || '';
      };
      try { const s = pick(JSON.parse(fs.readFileSync('$mount_dir/config.json', 'utf8'))); if (s) console.log(s); } catch {}
    " 2>/dev/null || true)"
    [[ -n "$secret" ]] && echo "$secret" && return 0
  fi
  return 1
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

replace_xkeysib_in_json_file() {
  local file="$1" new_key="$2"
  [[ -f "$file" ]] || return 0
  BREVO_SYNC_KEY="$new_key" BREVO_SYNC_FILE="$file" node -e "
    const fs = require('fs');
    const file = process.env.BREVO_SYNC_FILE;
    const newKey = (process.env.BREVO_SYNC_KEY || '').trim();
    if (!newKey) process.exit(0);
    let o;
    try { o = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { process.exit(0); }
    let n = 0;
    const walk = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && v.startsWith('xkeysib-') && v !== newKey) {
          obj[k] = newKey;
          n++;
        } else if (v && typeof v === 'object') walk(v);
      }
    };
    walk(o);
    if (n > 0) {
      fs.writeFileSync(file, JSON.stringify(o, null, 2));
      console.log('brevo-config-sync', file, 'replaced', n);
    }
  " 2>/dev/null || true
}

strip_empty_brevo_env_overrides() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  if grep -qE '^BREVO_API_KEY=$|^BREVO_KEY=$' "$f" 2>/dev/null; then
    sed -i '/^BREVO_API_KEY=$/d;/^BREVO_KEY=$/d' "$f"
    log "Removed empty BREVO_* lines from $f (dotenv was shadowing Docker env)"
  fi
}

sync_brevo_to_volume_configs() {
  local key="$1"
  key="$(normalize_brevo_key "$key")"
  [[ -z "$key" ]] && return 0
  local mount_dir
  mount_dir="$(docker inspect sitemonitor --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
  [[ -z "$mount_dir" ]] && mount_dir="$(docker inspect sitemonitor --format '{{range .Mounts}}{{if eq .Destination "/data"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
  if [[ -n "$mount_dir" && -d "$mount_dir" ]]; then
    strip_empty_brevo_env_overrides "$mount_dir/.env"
    replace_xkeysib_in_json_file "$mount_dir/config.json" "$key"
    for f in "$mount_dir"/settings.json "$mount_dir"/digest-config.json; do
      replace_xkeysib_in_json_file "$f" "$key"
    done
  fi
  docker exec sitemonitor sh -c 'for f in data/.env /app/data/.env .env; do [ -f "$f" ] && grep -qE "^BREVO_API_KEY=$|^BREVO_KEY=$" "$f" && sed -i "/^BREVO_API_KEY=$/d;/^BREVO_KEY=$/d" "$f" && echo stripped-empty-brevo "$f"; done' 2>/dev/null || true
}

write_sitemonitor_config_brevo_key() {
  local key="$1"
  key="$(normalize_brevo_key "$key")"
  [[ -z "$key" ]] && return 0
  docker exec -e SYNC_BREVO="$key" sitemonitor node -e "
    const fs = require('fs');
    const path = require('path');
    const newKey = (process.env.SYNC_BREVO || '').trim();
    const paths = ['data/config.json', '/app/data/config.json'];
    const walk = (obj) => {
      if (!obj || typeof obj !== 'object') return 0;
      let n = 0;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && v.startsWith('xkeysib-') && v !== newKey) {
          obj[k] = newKey;
          n++;
        } else if (v && typeof v === 'object') n += walk(v);
      }
      return n;
    };
    let total = 0;
    for (const p of paths) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const o = JSON.parse(raw);
        const n = walk(o);
        if (n > 0) {
          fs.mkdirSync(path.dirname(p), { recursive: true });
          fs.writeFileSync(p, JSON.stringify(o, null, 2));
          console.log('brevo-config-sync', p, 'replaced', n);
          total += n;
        }
      } catch {}
    }
    if (total === 0) console.log('brevo-config-sync-skip');
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
  PETRALIAN_BREVO="$(grep -E '^BREVO_API_KEY=' "$PETRALIAN_ENV" | cut -d= -f2- | tr -d '\r"' || true)"
fi

NEED_RECREATE=0

# Optional: GitHub Actions secret BREVO_API_KEY (repo Settings → Secrets)
if [[ -n "${BREVO_API_KEY_OVERRIDE:-}" ]]; then
  log "BREVO_API_KEY_OVERRIDE from CI — updating petralian .env and sitemonitor compose"
  PETRALIAN_BREVO="$(normalize_brevo_key "$BREVO_API_KEY_OVERRIDE")"
  set_env_key "$PETRALIAN_ENV" "BREVO_API_KEY" "$PETRALIAN_BREVO"
  set_env_key "$ENV_FILE" "BREVO_API_KEY" "$PETRALIAN_BREVO"
  NEED_RECREATE=1
fi

PETRALIAN_BREVO="$(normalize_brevo_key "$PETRALIAN_BREVO")"

log_brevo_key_check "petralian.env" "$PETRALIAN_BREVO"
log_brevo_smtp_check "petralian.env" "$PETRALIAN_BREVO"
SITEMON_FILE_BREVO="$(read_env_key "$ENV_FILE" BREVO_API_KEY)"
SITEMON_FILE_BREVO="$(normalize_brevo_key "$SITEMON_FILE_BREVO")"
log_brevo_key_check "sitemonitor.compose" "$SITEMON_FILE_BREVO"
log_brevo_smtp_check "sitemonitor.compose" "$SITEMON_FILE_BREVO"

# Align sender fields (digest uses same Brevo account as petralian.com)
if [[ -f "$PETRALIAN_ENV" ]]; then
  for pair in BREVO_SENDER_EMAIL BREVO_SENDER_NAME; do
    val="$(read_env_key "$PETRALIAN_ENV" "$pair")"
    [[ -n "$val" && -n "$ENV_FILE" ]] && set_env_key "$ENV_FILE" "$pair" "$val"
  done
fi

if [[ -n "$PETRALIAN_BREVO" ]] && docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  sync_brevo_to_volume_configs "$PETRALIAN_BREVO"
  write_sitemonitor_config_brevo_key "$PETRALIAN_BREVO"
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

if [[ -n "$PETRALIAN_BREVO" ]] && ! brevo_account_ok "$PETRALIAN_BREVO"; then
  warn "petralian BREVO_API_KEY fails Brevo API check — emails will fail until you paste the petralian.com key (Brevo → SMTP & API → API keys)"
fi

if [[ -n "$PETRALIAN_BREVO" && ( "$BREVO_BROKEN" == "1" || -z "$CONTAINER_BREVO" || "$(normalize_brevo_key "$CONTAINER_BREVO")" != "$PETRALIAN_BREVO" ) ]]; then
  log "Syncing BREVO_API_KEY from petralian .env into sitemonitor compose env"
  NEED_RECREATE=1
  set_env_key "$ENV_FILE" "BREVO_API_KEY" "$PETRALIAN_BREVO"
  sync_brevo_to_volume_configs "$PETRALIAN_BREVO"
  write_sitemonitor_config_brevo_key "$PETRALIAN_BREVO"
fi

# Do NOT sync CRON_SECRET from petralian — SiteMonitor uses its own digest auth secret.
CONFIG_CRON=""
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  CONFIG_CRON="$(read_volume_cron_secret || true)"
fi
if [[ -z "$CONFIG_CRON" ]]; then
  CONFIG_CRON="$(read_host_monitor_cron_secret || true)"
fi
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
  [[ -n "$PETRALIAN_BREVO" ]] && write_sitemonitor_config_brevo_key "$PETRALIAN_BREVO"
fi

ensure_container_brevo_matches() {
  local want="$1"
  want="$(normalize_brevo_key "$want")"
  [[ -z "$want" ]] && return 0
  local got
  got="$(normalize_brevo_key "$(container_env_key BREVO_API_KEY)")"
  [[ "$got" == "$want" ]] && return 0
  warn "Container BREVO suffix=...$(brevo_key_suffix "$got") != desired ...$(brevo_key_suffix "$want")"
  [[ -z "$COMPOSE_DIR" || ! -f "$COMPOSE_DIR/docker-compose.yml" ]] && return 0
  local override="$COMPOSE_DIR/docker-compose.brevo-fix.yml"
  cat > "$override" <<EOF
# Generated by scripts/fix-website-monitor-emails.sh — do not commit on VPS
services:
  sitemonitor:
    environment:
      BREVO_API_KEY: "${want}"
      BREVO_KEY: "${want}"
EOF
  log "Applying compose override $override and recreating"
  (cd "$COMPOSE_DIR" && docker compose -f docker-compose.yml -f docker-compose.brevo-fix.yml up -d --force-recreate) || true
  sleep 5
  got="$(normalize_brevo_key "$(container_env_key BREVO_API_KEY)")"
  if [[ "$got" == "$want" ]]; then
    log "Container BREVO now matches GitHub/petralian secret"
  else
    warn "Container BREVO still mismatched after override — internal cron may need another fix run"
  fi
}

if [[ -n "$PETRALIAN_BREVO" ]] && docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  ensure_container_brevo_matches "$PETRALIAN_BREVO"
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

if [[ -n "$PETRALIAN_BREVO" ]] && docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  log "BREVO container suffix=...$(brevo_key_suffix "$(normalize_brevo_key "$(container_env_key BREVO_API_KEY)")")"
  docker exec sitemonitor sh -c '
    for f in .env /app/.env data/.env /app/data/.env; do
      [ -f "$f" ] && echo "env-file $f BREVO=$(grep -E "^BREVO" "$f" | cut -d= -f1 | tr "\n" " ")"
    done
  ' 2>/dev/null || true
  docker exec sitemonitor node -e "
    const fs = require('fs');
    const p = 'scripts/run-digest.mjs';
    try {
      const lines = fs.readFileSync(p, 'utf8').split('\n').filter((l) => /brevo|BREVO|smtp\\/email|api-key/i.test(l));
      console.log('[monitor-fix] run-digest brevo-related lines:', lines.slice(0, 12).join(' | '));
    } catch (e) { console.log('[monitor-fix] run-digest probe skip', e.message); }
    const describe = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const [k, v] of Object.entries(obj)) {
        const p = path ? path + '.' + k : k;
        if (/brevo|apikey|api_key|smtp/i.test(k)) {
          const hint = typeof v === 'string' ? (v ? 'len=' + v.length + ' suffix=' + v.slice(-6) : 'empty') : typeof v;
          console.log('[monitor-fix] config field', p, hint);
        }
        if (v && typeof v === 'object') describe(v, p);
      }
    };
    for (const cfg of ['data/config.json', '/app/data/config.json']) {
      try { describe(JSON.parse(fs.readFileSync(cfg, 'utf8'))); } catch {}
    }
  " 2>/dev/null || true
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

try_npm_digest_send() {
  local brevo_key="${1:-}"
  brevo_key="$(normalize_brevo_key "$brevo_key")"
  log "Trying in-container npm digest scripts (no HTTP auth)"
  local -a exec_env=()
  if [[ -n "$brevo_key" ]]; then
    exec_env=(-e "BREVO_API_KEY=$brevo_key" -e "BREVO_KEY=$brevo_key")
  fi
  docker exec "${exec_env[@]}" sitemonitor sh -c '
    set -e
    for dir in /app /usr/src/app; do
      [ -f "$dir/package.json" ] || continue
      cd "$dir"
      for s in digest send-digest digest:send daily-digest digest:run; do
        for extra in "--send" "--send=1" ""; do
          if [ -n "$extra" ]; then
            npm run "$s" -- $extra 2>/dev/null && echo "npm-run-ok:$s:$extra" && exit 0
          else
            SEND_DIGEST=1 DIGEST_SEND=1 npm run "$s" 2>/dev/null && echo "npm-run-ok:$s:env" && exit 0
          fi
        done
      done
    done
    exit 1
  ' 2>/dev/null && return 0
  return 1
}

# ── Trigger digest now (catch-up) ────────────────────────────────────────────
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  TRIGGER_SECRET="$(read_volume_cron_secret || true)"
  [[ -z "$TRIGGER_SECRET" ]] && TRIGGER_SECRET="$(read_trigger_secret "$(container_env_key CRON_SECRET)" || true)"
  [[ -z "$TRIGGER_SECRET" && -n "$FILE_CRON" ]] && TRIGGER_SECRET="$FILE_CRON"
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
          console.log(res.status, res.body);
          if (res.status >= 200 && res.status < 300) break;
        }
      })();
    " 2>/dev/null || true
    try_npm_digest_send "$PETRALIAN_BREVO" || true
  else
    warn "No cron secret for HTTP catch-up — trying npm digest scripts"
    try_npm_digest_send "$PETRALIAN_BREVO" || warn "npm digest scripts failed — internal cron still runs 07:00 Asia/Singapore if Brevo is set"
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
