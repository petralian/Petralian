#!/usr/bin/env bash
# Find SiteMonitor on VPS, diagnose missing daily digest emails, apply safe fixes.
# Non-fatal: logs findings; exits 0 unless invoked with --strict.
set -euo pipefail

STRICT=0
[[ "${1:-}" == "--strict" ]] && STRICT=1

log() { echo "[monitor-fix] $*"; }
warn() { echo "[monitor-fix] WARN: $*" >&2; }

MONITOR_DIR=""
for d in /www/wwwroot/website-monitor /www/wwwroot/mon /www/wwwroot/sitemonitor \
  /www/wwwroot/petralian/.website-monitor /root/website-monitor; do
  if [[ -d "$d" && -f "$d/package.json" ]]; then
    MONITOR_DIR="$d"
    break
  fi
done
if [[ -z "$MONITOR_DIR" ]]; then
  MONITOR_DIR="$(find /www /root /home -maxdepth 5 -type d \( -name 'website-monitor' -o -name 'sitemonitor' -o -name '.website-monitor' \) 2>/dev/null | head -1 || true)"
fi
if [[ -z "$MONITOR_DIR" ]]; then
  # Resolve from PM2 cwd
  MONITOR_DIR="$(pm2 jlist 2>/dev/null | node -e "
    const list=JSON.parse(require('fs').readFileSync(0,'utf8'));
    const hit=list.find(p=>/monitor|sitemonitor|website-monitor|mon\.petralian/i.test((p.pm2_env?.pm_cwd||'')+(p.name||'')));
    if (hit) process.stdout.write(hit.pm2_env.pm_cwd||'');
  " 2>/dev/null || true)"
fi
if [[ -z "$MONITOR_DIR" || ! -d "$MONITOR_DIR" ]]; then
  warn "SiteMonitor directory not found — dumping PM2 + nginx hints"
  pm2 list 2>/dev/null || true
  grep -r 'mon\.petralian' /www/server/panel/vhost/nginx/ 2>/dev/null | head -10 || true
  exit 0
fi
cd "$MONITOR_DIR"
log "Using $MONITOR_DIR"

# ── PM2: ensure process is online ───────────────────────────────────────────
PM2_NAME=""
while read -r name cwd; do
  if [[ "$cwd" == "$MONITOR_DIR"* ]] || [[ "$name" =~ monitor|sitemonitor|^mon$ ]]; then
    PM2_NAME="$name"
    break
  fi
done < <(pm2 jlist 2>/dev/null | node -e "
const list=JSON.parse(require('fs').readFileSync(0,'utf8'));
for (const p of list) console.log(p.name, p.pm2_env?.pm_cwd||'');
" 2>/dev/null || true)

if [[ -z "$PM2_NAME" ]]; then
  if [[ -f ecosystem.config.cjs ]]; then
    log "Starting PM2 from ecosystem.config.cjs"
    pm2 start ecosystem.config.cjs --update-env || true
    PM2_NAME="$(pm2 jlist | node -e "const l=JSON.parse(require('fs').readFileSync(0,'utf8')); const p=l.find(x=>(x.pm2_env?.pm_cwd||'').includes('monitor')); console.log(p?.name||'');")"
  fi
fi

if [[ -n "$PM2_NAME" ]]; then
  STATUS="$(pm2 jlist | node -e "const l=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(l.find(x=>x.name==='$PM2_NAME')?.pm2_env?.status||'unknown');")"
  log "PM2 $PM2_NAME status=$STATUS"
  if [[ "$STATUS" != "online" ]]; then
    log "Reloading $PM2_NAME"
    pm2 reload "$PM2_NAME" --update-env || pm2 restart "$PM2_NAME" --update-env || true
  fi
else
  warn "No PM2 process found for SiteMonitor"
fi

# ── .env: Brevo + notify recipients ─────────────────────────────────────────
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a; source .env; set +a
fi

if [[ -z "${BREVO_API_KEY:-}" && -f /www/wwwroot/petralian/.env ]]; then
  PETRALIAN_BREVO="$(grep -E '^BREVO_API_KEY=' /www/wwwroot/petralian/.env | cut -d= -f2- || true)"
  if [[ -n "$PETRALIAN_BREVO" ]]; then
    log "Copying BREVO_API_KEY from petralian .env"
    if grep -q '^BREVO_API_KEY=' .env 2>/dev/null; then
      sed -i "s|^BREVO_API_KEY=.*|BREVO_API_KEY=$PETRALIAN_BREVO|" .env
    else
      echo "BREVO_API_KEY=$PETRALIAN_BREVO" >> .env
    fi
    export BREVO_API_KEY="$PETRALIAN_BREVO"
    [[ -n "$PM2_NAME" ]] && pm2 reload "$PM2_NAME" --update-env || true
  fi
fi

# ── Config: ensure digest cron enabled (daily = 1440m) ───────────────────────
CONFIG_FILES=(data/config.json config.json)
for cfg in "${CONFIG_FILES[@]}"; do
  [[ -f "$cfg" ]] || continue
  node -e "
    const fs=require('fs');
    const p='$cfg';
    const o=JSON.parse(fs.readFileSync(p,'utf8'));
    let changed=false;
    if (o.cron && o.cron.enabled === false) { o.cron.enabled=true; changed=true; console.log('enabled cron in', p); }
    if (o.cron && !o.cron.intervalMinutes) { o.cron.intervalMinutes=1440; changed=true; }
    if (o.digest && o.digest.cronEnabled === false) { o.digest.cronEnabled=true; changed=true; }
    if (changed) fs.writeFileSync(p, JSON.stringify(o, null, 2));
  " || true
done

# ── aaPanel cron: daily digest trigger at 08:00 HKT (00:00 UTC) ────────────
CRON_SECRET="${CRON_SECRET:-}"
[[ -z "$CRON_SECRET" && -f .env ]] && CRON_SECRET="$(grep -E '^CRON_SECRET=' .env | cut -d= -f2- || true)"

CRON_LINE="0 0 * * * curl -fsS -H \"Authorization: Bearer ${CRON_SECRET}\" \"https://mon.petralian.com/api/digest/run?send=1\" >> /www/wwwlogs/sitemonitor-digest.log 2>&1"
CRON_MARK="sitemonitor-digest"

if [[ -n "$CRON_SECRET" ]]; then
  CRON_USER="${CRON_USER:-root}"
  CRON_FILE="/var/spool/cron/crontabs/$CRON_USER"
  if [[ -f "$CRON_FILE" ]] && ! grep -q "$CRON_MARK" "$CRON_FILE" 2>/dev/null; then
    log "Adding aaPanel cron for daily digest email"
    printf '%s # %s\n' "$CRON_LINE" "$CRON_MARK" >> "$CRON_FILE"
  elif [[ -f "$CRON_FILE" ]] && grep -q "$CRON_MARK" "$CRON_FILE"; then
    log "aaPanel cron entry already present"
  else
    warn "Could not update crontab at $CRON_FILE"
  fi
else
  warn "CRON_SECRET not set — cannot install external cron fallback"
fi

# ── Report recent digest + Brevo log lines ───────────────────────────────────
log "Recent digest files:"
ls -lt data/digests 2>/dev/null | head -5 || ls -lt data 2>/dev/null | head -5 || true

log "Recent monitor errors:"
pm2 logs --nostream --lines 60 2>/dev/null | grep -iE 'brevo|cron|digest|email|error|fail' | tail -20 || true

# ── Smoke: trigger digest if last run > 36h ago (optional) ─────────────────
if [[ -n "$CRON_SECRET" ]]; then
  HTTP_CODE="$(curl -sS -o /tmp/digest-run.json -w '%{http_code}' \
    -X POST -H "Authorization: Bearer ${CRON_SECRET}" \
    "https://mon.petralian.com/api/digest/run?send=1" || echo 000)"
  log "POST /api/digest/run?send=1 => HTTP $HTTP_CODE"
  head -c 500 /tmp/digest-run.json 2>/dev/null || true
  echo
fi

log "Done"
exit 0
