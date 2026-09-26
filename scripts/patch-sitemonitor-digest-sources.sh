#!/usr/bin/env bash
# Apply all data/sitemonitor/*-sources.json patches to SiteMonitor TAG digest (mon.petralian.com).
set -euo pipefail

log() { echo "[digest-patch] $*"; }
warn() { echo "[digest-patch] WARN: $*" >&2; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPLY_SCRIPT="$REPO_ROOT/scripts/sitemonitor/apply-digest-sources.mjs"
PATCH_GLOB="$REPO_ROOT/data/sitemonitor"

if [[ ! -f "$APPLY_SCRIPT" ]]; then
  warn "missing $APPLY_SCRIPT"
  exit 1
fi

shopt -s nullglob
PATCH_FILES=("$PATCH_GLOB"/*-sources.json)
shopt -u nullglob

if [[ ${#PATCH_FILES[@]} -eq 0 ]]; then
  warn "no *-sources.json under $PATCH_GLOB"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx sitemonitor; then
  warn "sitemonitor container not running — skip digest source patches"
  exit 0
fi

log "Discover digest-related paths in container"
docker exec sitemonitor sh -c '
  ls -la data 2>/dev/null | head -20 || true
  ls -la data/topics/petralian 2>/dev/null | head -20 || true
' 2>/dev/null || true

docker cp "$APPLY_SCRIPT" sitemonitor:/tmp/apply-digest-sources.mjs

failed=0
for PATCH_FILE in "${PATCH_FILES[@]}"; do
  base="$(basename "$PATCH_FILE")"
  log "Applying $base"
  docker cp "$PATCH_FILE" "sitemonitor:/tmp/$base"
  if ! docker exec sitemonitor node "/tmp/apply-digest-sources.mjs" "/tmp/$base"; then
    warn "apply failed for $base"
    failed=1
  fi
done

if [[ $failed -ne 0 ]]; then
  exit 1
fi

log "All patches applied — restart container to reload in-memory caches if needed"
docker restart sitemonitor >/dev/null 2>&1 || true
sleep 3
log "Done (${#PATCH_FILES[@]} patch file(s))"
