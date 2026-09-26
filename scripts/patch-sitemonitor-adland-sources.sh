#!/usr/bin/env bash
# Apply APAC adland RSS + query boosts to SiteMonitor TAG digest (mon.petralian.com).
# SSOT: data/sitemonitor/adland-sources.json
set -euo pipefail

log() { echo "[adland-patch] $*"; }
warn() { echo "[adland-patch] WARN: $*" >&2; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PATCH_FILE="$REPO_ROOT/data/sitemonitor/adland-sources.json"
APPLY_SCRIPT="$REPO_ROOT/scripts/sitemonitor/apply-adland-sources.mjs"

if [[ ! -f "$PATCH_FILE" ]]; then
  warn "missing $PATCH_FILE"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  warn "sitemonitor container not running — skip adland patch"
  exit 0
fi

log "Discover digest-related paths in container"
docker exec sitemonitor sh -c '
  ls -la data 2>/dev/null | head -20 || true
  ls -la data/topics/petralian 2>/dev/null | head -20 || true
  grep -r "agency-media" /app --include="*.mjs" --include="*.js" -l 2>/dev/null | head -8 || true
' 2>/dev/null || true

docker cp "$PATCH_FILE" sitemonitor:/tmp/adland-sources.json
docker cp "$APPLY_SCRIPT" sitemonitor:/tmp/apply-adland-sources.mjs

if docker exec sitemonitor node /tmp/apply-adland-sources.mjs /tmp/adland-sources.json; then
  log "Config/topic patch applied — restart container to reload in-memory caches if needed"
  docker restart sitemonitor >/dev/null 2>&1 || true
  sleep 3
else
  warn "apply script failed"
  exit 1
fi

log "Done"
