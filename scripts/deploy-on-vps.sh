#!/usr/bin/env bash
# Run on the VPS after git pull (or from GitHub Actions over SSH).
# Usage: bash scripts/deploy-on-vps.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/petralian}"
BRANCH="${BRANCH:-master}"
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"

cd "$APP_DIR"

health_check() {
  curl -fsS "$HEALTH_URL" >/dev/null 2>&1
}

echo "==> Petralian deploy in $(pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node not found. Install Node 20+ via aaPanel → App Store → Node.js Version Manager."
  exit 1
fi

echo "==> Node $(node -v)"

if health_check; then
  echo "==> Pre-deploy: app healthy (build runs while site stays up)"
else
  echo "==> Pre-deploy: app not responding — will start after build"
fi

if [[ -d .git ]]; then
  echo "==> Fetch $BRANCH"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
else
  echo "Warning: not a git repo — skipping pull"
fi

echo "==> npm ci"
npm ci

echo "==> npm run build"
export NODE_OPTIONS
npm run build:vps

echo "==> PM2 reload (rolling — cluster workers restart one at a time)"
if pm2 describe petralian >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "==> Health check"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if health_check; then
    echo "OK — petralian listening on :3000"
    exit 0
  fi
  sleep 3
done

echo "==> Reload did not pass health check — attempting full restart"
pm2 restart ecosystem.config.cjs --update-env
pm2 save

for i in 1 2 3 4 5; do
  if health_check; then
    echo "OK — recovered after pm2 restart"
    exit 0
  fi
  sleep 3
done

echo "Error: app not responding on :3000 after deploy"
pm2 status || true
pm2 logs petralian --lines 40 --nostream || true
exit 1
