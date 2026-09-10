#!/usr/bin/env bash
# Restore SiteMonitor (mon.petralian.com) daily digest emails on VPS.
# SiteMonitor runs in Docker (container: sitemonitor, host port 3010).
set -euo pipefail

log() { echo "[monitor-fix] $*"; }
warn() { echo "[monitor-fix] WARN: $*" >&2; }

COMPOSE_DIR=""
for d in /www/wwwroot/mon.petralian.com /www/wwwroot/sitemonitor /www/wwwroot/website-monitor /root/sitemonitor; do
  if [[ -f "$d/docker-compose.yml" || -f "$d/docker-compose.yaml" || -f "$d/compose.yml" ]]; then
    COMPOSE_DIR="$d"
    break
  fi
done
if [[ -z "$COMPOSE_DIR" ]]; then
  COMPOSE_DIR="$(find /www /root -maxdepth 4 -name 'docker-compose.yml' 2>/dev/null | while read -r f; do
    grep -q sitemonitor "$f" 2>/dev/null && dirname "$f" && break
  done | head -1 || true)"
fi

log "compose_dir=${COMPOSE_DIR:-not_found}"

# ── Docker container health ──────────────────────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  warn "sitemonitor container not running"
  if [[ -n "$COMPOSE_DIR" ]]; then
    log "Starting via docker compose in $COMPOSE_DIR"
    (cd "$COMPOSE_DIR" && docker compose up -d) || true
  else
    docker start sitemonitor 2>/dev/null || true
  fi
else
  log "sitemonitor container is running"
fi

# ── Read env from compose dir or container ───────────────────────────────────
CRON_SECRET=""
BREVO_API_KEY=""
ENV_FILE=""
if [[ -n "$COMPOSE_DIR" ]]; then
  for f in "$COMPOSE_DIR/.env" "$COMPOSE_DIR/.env.production"; do
    [[ -f "$f" ]] && ENV_FILE="$f" && break
  done
fi
if [[ -n "$ENV_FILE" ]]; then
  log "env_file=$ENV_FILE"
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
  CRON_SECRET="${CRON_SECRET:-}"
  BREVO_API_KEY="${BREVO_API_KEY:-}"
fi

if docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  if [[ -z "$CRON_SECRET" ]]; then
    CRON_SECRET="$(docker exec sitemonitor printenv CRON_SECRET 2>/dev/null || true)"
  fi
  if [[ -z "$BREVO_API_KEY" ]]; then
    BREVO_API_KEY="$(docker exec sitemonitor printenv BREVO_API_KEY 2>/dev/null || true)"
  fi
  log "container env: BREVO_API_KEY=${BREVO_API_KEY:+set} CRON_SECRET=${CRON_SECRET:+set}"

  log "Recent container logs (brevo|cron|digest|email|error):"
  docker logs sitemonitor --tail 80 2>&1 | grep -iE 'brevo|cron|digest|email|error|fail|notify' | tail -25 || true

  log "In-container config snapshot:"
  docker exec sitemonitor sh -c 'ls -la data 2>/dev/null; ls -la data/digests 2>/dev/null | head -5; test -f data/config.json && head -c 1500 data/config.json || true' 2>/dev/null || true

  # Enable cron in config if present
  docker exec sitemonitor node -e "
    const fs=require('fs');
    for (const p of ['data/config.json','config.json']) {
      if (!fs.existsSync(p)) continue;
      const o=JSON.parse(fs.readFileSync(p,'utf8'));
      let changed=false;
      if (o.cron?.enabled===false){o.cron.enabled=true;changed=true;}
      if (o.cron && !o.cron.intervalMinutes){o.cron.intervalMinutes=1440;changed=true;}
      if (o.digest?.cronEnabled===false){o.digest.cronEnabled=true;changed=true;}
      if (changed){fs.writeFileSync(p,JSON.stringify(o,null,2));console.log('updated',p);}
    }
  " 2>/dev/null || true
fi

# ── Brevo key fallback from petralian .env ───────────────────────────────────
if [[ -z "$BREVO_API_KEY" && -f /www/wwwroot/petralian/.env ]]; then
  BREVO_API_KEY="$(grep -E '^BREVO_API_KEY=' /www/wwwroot/petralian/.env | cut -d= -f2- || true)"
  if [[ -n "$BREVO_API_KEY" && -n "$ENV_FILE" ]]; then
    log "Patching BREVO_API_KEY into $ENV_FILE"
    if grep -q '^BREVO_API_KEY=' "$ENV_FILE"; then
      sed -i "s|^BREVO_API_KEY=.*|BREVO_API_KEY=$BREVO_API_KEY|" "$ENV_FILE"
    else
      echo "BREVO_API_KEY=$BREVO_API_KEY" >> "$ENV_FILE"
    fi
    if [[ -n "$COMPOSE_DIR" ]]; then
      (cd "$COMPOSE_DIR" && docker compose up -d) || docker restart sitemonitor || true
    fi
  fi
fi

# ── External cron fallback (daily 08:00 HKT = 00:00 UTC) ────────────────────
if [[ -n "$CRON_SECRET" ]]; then
  CRON_LINE="0 0 * * * curl -fsS -X POST -H \"Authorization: Bearer ${CRON_SECRET}\" \"https://mon.petralian.com/api/digest/run?send=1\" >> /www/wwwlogs/sitemonitor-digest.log 2>&1"
  CRON_MARK="sitemonitor-digest"
  CRON_FILE="/var/spool/cron/crontabs/root"
  if [[ -f "$CRON_FILE" ]] && ! grep -q "$CRON_MARK" "$CRON_FILE" 2>/dev/null; then
    log "Adding root crontab entry for daily digest email"
    printf '%s # %s\n' "$CRON_LINE" "$CRON_MARK" >> "$CRON_FILE"
  elif [[ -f "$CRON_FILE" ]]; then
    log "root crontab already has sitemonitor-digest entry"
  else
    warn "No root crontab at $CRON_FILE"
  fi
else
  warn "CRON_SECRET missing — cannot install external cron or trigger digest"
fi

# ── Trigger digest now (catch-up) ────────────────────────────────────────────
if [[ -n "$CRON_SECRET" ]]; then
  HTTP_CODE="$(curl -sS -o /tmp/sitemonitor-digest-run.json -w '%{http_code}' \
    -X POST -H "Authorization: Bearer ${CRON_SECRET}" \
    "https://mon.petralian.com/api/digest/run?send=1" || echo 000)"
  log "POST /api/digest/run?send=1 => HTTP $HTTP_CODE"
  head -c 800 /tmp/sitemonitor-digest-run.json 2>/dev/null || true
  echo
  if [[ "$HTTP_CODE" == "401" || "$HTTP_CODE" == "403" ]]; then
    warn "Digest trigger unauthorized — CRON_SECRET may not match container config"
  fi
fi

log "Done"
