#!/usr/bin/env bash
# Zero-downtime VPS deploy: build to .next-staging, atomic swap, PM2 cluster reload.
# Usage: bash scripts/deploy-on-vps.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/petralian}"
BRANCH="${BRANCH:-master}"
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"
STAGING_DIST="${NEXT_STAGING_DIST:-.next-staging}"
LIVE_DIST="${NEXT_LIVE_DIST:-.next}"
LOCKFILE_HASH_FILE="${LOCKFILE_HASH_FILE:-.deploy-lockfile.sha256}"
DEPLOY_LOCK="${DEPLOY_LOCK:-/var/lock/petralian-deploy.lock}"
DEPLOY_LOCK_WAIT_SEC="${DEPLOY_LOCK_WAIT_SEC:-900}"
HEALTH_RETRIES="${HEALTH_RETRIES:-25}"
HEALTH_INTERVAL_SEC="${HEALTH_INTERVAL_SEC:-1}"
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"

cd "$APP_DIR"

# Pull latest deploy script before flock — re-exec so this process never runs stale logic
# after `git reset` (GitHub Actions + manual SSH can start concurrently).
if [[ -d .git ]] && [[ "${PETRALIAN_DEPLOY_SYNCED:-}" != "1" ]]; then
  echo "==> Sync repo to origin/$BRANCH (before deploy lock)"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
  export PETRALIAN_DEPLOY_SYNCED=1
  exec env PETRALIAN_DEPLOY_SYNCED=1 bash "$SCRIPT_PATH" "$@"
fi

health_check() {
  curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1
}

verify_node_deps() {
  node -e "
    import('gray-matter')
      .then(() => import('next'))
      .then(() => process.exit(0))
      .catch((err) => { console.error(err); process.exit(1); });
  "
}

rollback_next() {
  if [[ -d "${LIVE_DIST}.prev" ]]; then
    echo "==> Rollback: restore ${LIVE_DIST}.prev"
    rm -rf "$LIVE_DIST"
    mv "${LIVE_DIST}.prev" "$LIVE_DIST"
    pm2 reload ecosystem.config.cjs --update-env || pm2 restart ecosystem.config.cjs --update-env
  fi
}

# Single deploy at a time (GitHub Actions + manual SSH)
exec 200>"$DEPLOY_LOCK"
if ! flock -w "$DEPLOY_LOCK_WAIT_SEC" 200; then
  echo "Error: deploy lock busy for ${DEPLOY_LOCK_WAIT_SEC}s"
  exit 1
fi

echo "==> Petralian deploy in $(pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node not found."
  exit 1
fi

echo "==> Node $(node -v)"

if health_check; then
  echo "==> Pre-deploy: app healthy (build uses ${STAGING_DIST}; live ${LIVE_DIST} untouched)"
else
  echo "==> Pre-deploy: app not responding — will start/reload after build"
  pm2 start ecosystem.config.cjs 2>/dev/null || true
fi

LOCK_HASH="$(sha256sum package-lock.json | awk '{print $1}')"
PREV_HASH=""
[[ -f "$LOCKFILE_HASH_FILE" ]] && PREV_HASH="$(cat "$LOCKFILE_HASH_FILE")"

if [[ "$LOCK_HASH" != "$PREV_HASH" ]] || ! verify_node_deps 2>/dev/null; then
  echo "==> npm ci (lockfile or deps changed)"
  npm ci
  echo "$LOCK_HASH" > "$LOCKFILE_HASH_FILE"
else
  echo "==> npm ci skipped (lockfile unchanged, deps OK)"
fi

verify_node_deps

echo "==> JPEG sidecars (.og.jpg) for email + social previews"
node scripts/raster-to-avif.mjs --og-only

echo "==> Build to ${STAGING_DIST} (live site keeps serving from ${LIVE_DIST})"
rm -rf "$STAGING_DIST"
export NEXT_DIST_DIR="$STAGING_DIST"
export NODE_OPTIONS
npm run build:vps

if [[ ! -f "${STAGING_DIST}/BUILD_ID" ]]; then
  echo "Error: build failed — no ${STAGING_DIST}/BUILD_ID"
  exit 1
fi

echo "==> Atomic swap ${STAGING_DIST} → ${LIVE_DIST}"
rm -rf "${LIVE_DIST}.prev"
if [[ -d "$LIVE_DIST" ]]; then
  mv "$LIVE_DIST" "${LIVE_DIST}.prev"
fi
mv "$STAGING_DIST" "$LIVE_DIST"

echo "==> PM2 cluster reload (one worker at a time — never pm2 stop)"
if pm2 describe petralian >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "==> Health check (${HEALTH_RETRIES}× ${HEALTH_INTERVAL_SEC}s)"
for ((i = 1; i <= HEALTH_RETRIES; i++)); do
  if health_check; then
    echo "OK — petralian healthy after deploy (${i}s)"
    rm -rf "${LIVE_DIST}.prev"
    exit 0
  fi
  sleep "$HEALTH_INTERVAL_SEC"
done

echo "Error: health check failed after reload"
rollback_next
pm2 logs petralian --lines 30 --nostream || true
exit 1
