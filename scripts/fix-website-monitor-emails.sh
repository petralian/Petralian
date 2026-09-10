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

# ── Resolve compose dir from container labels ────────────────────────────────
COMPOSE_DIR=""
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  COMPOSE_DIR="$(docker inspect sitemonitor --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' 2>/dev/null || true)"
fi
if [[ -z "$COMPOSE_DIR" || ! -d "$COMPOSE_DIR" ]]; then
  for d in /opt/sitemonitor /www/wwwroot/mon.petralian.com /www/wwwroot/sitemonitor /www/wwwroot/website-monitor /root/sitemonitor; do
    [[ -f "$d/docker-compose.yml" || -f "$d/compose.yml" ]] && COMPOSE_DIR="$d" && break
  done
fi
log "compose_dir=${COMPOSE_DIR:-not_found}"

# ── Source of truth: petralian production .env ───────────────────────────────
PETRALIAN_ENV="/www/wwwroot/petralian/.env"
PETRALIAN_BREVO=""
PETRALIAN_CRON=""
if [[ -f "$PETRALIAN_ENV" ]]; then
  PETRALIAN_BREVO="$(grep -E '^BREVO_API_KEY=' "$PETRALIAN_ENV" | cut -d= -f2- || true)"
  PETRALIAN_CRON="$(grep -E '^CRON_SECRET=' "$PETRALIAN_ENV" | cut -d= -f2- || true)"
fi

# ── SiteMonitor env file (compose) ───────────────────────────────────────────
ENV_FILE=""
if [[ -n "$COMPOSE_DIR" ]]; then
  for f in "$COMPOSE_DIR/.env" "$COMPOSE_DIR/.env.production"; do
    [[ -f "$f" ]] && ENV_FILE="$f" && break
  done
fi

CONTAINER_BREVO=""
CONTAINER_CRON=""
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  CONTAINER_BREVO="$(docker exec sitemonitor printenv BREVO_API_KEY 2>/dev/null || true)"
  CONTAINER_CRON="$(docker exec sitemonitor printenv CRON_SECRET 2>/dev/null || true)"
fi

BREVO_BROKEN=0
if docker logs sitemonitor --since 24h 2>&1 | grep -q 'Key not found'; then
  BREVO_BROKEN=1
  log "Detected invalid Brevo API key in recent container logs"
fi

NEED_RECREATE=0
if [[ -n "$PETRALIAN_BREVO" && ( "$BREVO_BROKEN" == "1" || -z "$CONTAINER_BREVO" || "$CONTAINER_BREVO" != "$PETRALIAN_BREVO" ) ]]; then
  log "Syncing BREVO_API_KEY from petralian .env"
  NEED_RECREATE=1
  set_env_key "$ENV_FILE" "BREVO_API_KEY" "$PETRALIAN_BREVO"
fi

if [[ -n "$PETRALIAN_CRON" && ( -z "$CONTAINER_CRON" || "$CONTAINER_CRON" != "$PETRALIAN_CRON" ) ]]; then
  log "Syncing CRON_SECRET from petralian .env"
  NEED_RECREATE=1
  set_env_key "$ENV_FILE" "CRON_SECRET" "$PETRALIAN_CRON"
fi

CRON_SECRET="${CONTAINER_CRON:-$PETRALIAN_CRON}"

# ── Recreate container when env changed ──────────────────────────────────────
if [[ "$NEED_RECREATE" == "1" ]]; then
  if [[ -n "$COMPOSE_DIR" && -f "$COMPOSE_DIR/docker-compose.yml" ]]; then
    log "Recreating sitemonitor via docker compose"
    (cd "$COMPOSE_DIR" && docker compose up -d --force-recreate) || docker restart sitemonitor || true
  else
    warn "No compose dir — attempting docker restart (env may need manual update)"
    docker restart sitemonitor || true
  fi
  sleep 3
  CONTAINER_BREVO="$(docker exec sitemonitor printenv BREVO_API_KEY 2>/dev/null || true)"
  CONTAINER_CRON="$(docker exec sitemonitor printenv CRON_SECRET 2>/dev/null || true)"
  CRON_SECRET="${CONTAINER_CRON:-$PETRALIAN_CRON}"
fi

if ! docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  warn "sitemonitor container not running — starting"
  if [[ -n "$COMPOSE_DIR" ]]; then
    (cd "$COMPOSE_DIR" && docker compose up -d) || docker start sitemonitor || true
  else
    docker start sitemonitor 2>/dev/null || true
  fi
fi

log "container env after fix: BREVO=${CONTAINER_BREVO:+set} CRON=${CRON_SECRET:+set}"

log "Recent container logs:"
docker logs sitemonitor --tail 40 2>&1 | grep -iE 'brevo|cron|digest|email|error|fail|notify|listening' | tail -20 || true

# Internal digest cron (0 7 * * * Asia/Singapore) handles daily email — remove bad external cron if added earlier.
CRON_FILE="/var/spool/cron/crontabs/root"
if [[ -f "$CRON_FILE" ]] && grep -q 'sitemonitor-digest' "$CRON_FILE" 2>/dev/null; then
  sed -i '/sitemonitor-digest/d' "$CRON_FILE"
  log "Removed obsolete external sitemonitor-digest crontab (app has internal cron)"
fi

# ── Trigger digest now (catch-up) ────────────────────────────────────────────
if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  TRIGGER_SECRET="$(docker exec sitemonitor printenv 2>/dev/null | grep -E '^(CRON_SECRET|DIGEST_SECRET|SITEMONITOR_SECRET|ADMIN_TOKEN)=' | head -1 | cut -d= -f2- || true)"
  if [[ -z "$TRIGGER_SECRET" && -n "$PETRALIAN_CRON" ]]; then
    TRIGGER_SECRET="$PETRALIAN_CRON"
    log "Using CRON_SECRET from petralian .env for catch-up trigger"
  fi
  log "Triggering catch-up digest (secret=${TRIGGER_SECRET:+present})"
  if [[ -n "$TRIGGER_SECRET" ]]; then
    docker exec sitemonitor node -e "
      fetch('http://127.0.0.1:3000/api/digest/run?send=1',{
        method:'POST',
        headers:{Authorization:'Bearer $TRIGGER_SECRET'}
      }).then(async (r) => console.log(r.status, (await r.text()).slice(0, 500)))
        .catch((e) => console.error(e.message));
    " 2>/dev/null || true
  else
    warn "No cron secret available — next scheduled digest: 07:00 Asia/Singapore"
  fi
  sleep 8
  docker logs sitemonitor --tail 30 2>&1 | grep -iE 'brevo|digest|email|sent|error|queued|Key not found' | tail -15 || true
fi

log "Done"
