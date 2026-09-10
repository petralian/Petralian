#!/usr/bin/env bash
# Diagnose SiteMonitor (mon.petralian.com) daily digest emails on VPS.
# Run via GitHub Actions workflow_dispatch or SSH on the server.
set -euo pipefail

echo "=== SiteMonitor diagnostic ($(date -u +%Y-%m-%dT%H:%M:%SZ)) ==="

CANDIDATE_DIRS=(
  /www/wwwroot/website-monitor
  /www/wwwroot/mon
  /www/wwwroot/sitemonitor
  /www/wwwroot/petralian/.website-monitor
  /root/website-monitor
)

MONITOR_DIR=""
for d in "${CANDIDATE_DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    MONITOR_DIR="$d"
    break
  fi
done

if [[ -z "$MONITOR_DIR" ]]; then
  echo "WARN: monitor dir not found in candidates; searching /www/wwwroot..."
  find /www/wwwroot -maxdepth 3 -name 'package.json' 2>/dev/null | while read -r pkg; do
    if rg -q 'sitemonitor|website-monitor|mon\.petralian' "$pkg" 2>/dev/null; then
      echo "  candidate: $(dirname "$pkg")"
    fi
  done
  MONITOR_DIR="$(find /www/wwwroot -maxdepth 2 -type d \( -name 'website-monitor' -o -name 'sitemonitor' -o -name 'mon' \) 2>/dev/null | head -1 || true)"
fi

echo "MONITOR_DIR=${MONITOR_DIR:-NOT_FOUND}"

echo ""
echo "=== PM2 status (all) ==="
pm2 list 2>/dev/null || true
pm2 jlist 2>/dev/null | node -e "
const list = JSON.parse(require('fs').readFileSync(0,'utf8'));
for (const p of list) {
  console.log(JSON.stringify({ name: p.name, status: p.pm2_env?.status, cwd: p.pm2_env?.pm_cwd, script: p.pm2_env?.pm_exec_path }, null, 0));
}
" 2>/dev/null || true

echo ""
echo "=== Docker containers ==="
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null || echo "(docker unavailable)"

echo ""
echo "=== Listening node ports ==="
ss -tlnp 2>/dev/null | grep -E 'node|LISTEN' | head -20 || netstat -tlnp 2>/dev/null | grep node | head -20 || true

echo ""
echo "=== Find SiteMonitor auth.js on disk ==="
find /www /root /home -maxdepth 6 -name 'auth.js' 2>/dev/null | while read -r f; do
  grep -q '/api/auth/session' "$f" 2>/dev/null && echo "$f" || true
done
find /www /root /home -maxdepth 5 -path '*/.website-monitor/package.json' 2>/dev/null | head -5

echo ""
echo "=== Nginx vhosts mentioning mon ==="
grep -r 'mon\.petralian' /www/server/panel/vhost/nginx/ 2>/dev/null | head -30 || grep -r 'mon\.petralian' /etc/nginx/ 2>/dev/null | head -30 || echo "(no nginx match or no permission)"

echo ""
echo "=== aaPanel / system cron (monitor|digest|mon.petralian) ==="
for f in /var/spool/cron/crontabs/* /etc/crontab; do
  [[ -f "$f" ]] && rg -n 'monitor|digest|mon\.petralian|website-monitor' "$f" 2>/dev/null && echo "  (in $f)" || true
done
bt default 2>/dev/null | head -3 || true

echo ""
if [[ -n "$MONITOR_DIR" && -d "$MONITOR_DIR" ]]; then
  cd "$MONITOR_DIR"
  echo "=== Monitor app ($MONITOR_DIR) ==="
  ls -la
  echo ""
  [[ -f package.json ]] && cat package.json | head -30
  echo ""
  [[ -f .env ]] && echo ".env keys:" && rg '^[A-Z_]+=' .env | sed 's/=.*$/=***/' || echo "(no .env)"
  echo ""
  for f in data/config.json data/settings.json data/digest-config.json config.json; do
    if [[ -f "$f" ]]; then
      echo "--- $f (redacted) ---"
      node -e "
        const fs=require('fs');
        const o=JSON.parse(fs.readFileSync('$f','utf8'));
        const redact=(v,k)=>typeof v==='string'&&/key|secret|password|token/i.test(k)?'***':v;
        console.log(JSON.stringify(o,(k,v)=>typeof v==='object'&&v?undefined:redact(v,k),2).slice(0,3000));
      " 2>/dev/null || head -c 500 "$f"
      echo ""
    fi
  done
  echo "=== Recent PM2 logs (monitor) ==="
  pm2 logs --nostream --lines 80 2>/dev/null | rg -i 'brevo|cron|digest|email|error|fail' | tail -40 || true
  echo ""
  echo "=== data/digests (latest) ==="
  ls -lt data/digests 2>/dev/null | head -8 || ls -lt data 2>/dev/null | head -8 || echo "(no digest data dir)"
fi

echo ""
echo "=== External health ==="
curl -fsS -o /dev/null -w "mon.petralian.com HTTP %{http_code}\n" https://mon.petralian.com/ || true

echo ""
echo "=== DONE ==="
