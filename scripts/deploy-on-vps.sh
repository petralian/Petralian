#!/usr/bin/env bash
# Run on the VPS after git pull (or from GitHub Actions over SSH).
# Usage: bash scripts/deploy-on-vps.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/petralian}"
BRANCH="${BRANCH:-master}"
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

cd "$APP_DIR"

echo "==> Petralian deploy in $(pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node not found. Install Node 20+ via aaPanel → App Store → Node.js Version Manager."
  exit 1
fi

echo "==> Node $(node -v)"

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

echo "==> PM2 reload"
if pm2 describe petralian >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "==> Health check"
sleep 2
curl -fsS "http://127.0.0.1:3000/" >/dev/null
echo "OK — petralian listening on :3000"
