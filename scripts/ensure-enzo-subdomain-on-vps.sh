#!/usr/bin/env bash
# Route enzo.petralian.com to the same Next.js app as petralian.com.
# Disables aaPanel "site created successfully" placeholder vhost when present.
set -euo pipefail

PANEL_VHOST="/www/server/panel/vhost/nginx"
ENZO_CONF="${PANEL_VHOST}/enzo.petralian.com.conf"

find_petralian_vhost() {
  local candidate
  for candidate in \
    "${PANEL_VHOST}/petralian.com.conf" \
    "${PANEL_VHOST}/www.petralian.com.conf"; do
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  if [[ -d "$PANEL_VHOST" ]]; then
    candidate="$(grep -l 'server_name[[:space:]].*petralian\.com' "$PANEL_VHOST"/*.conf 2>/dev/null | head -1 || true)"
    if [[ -n "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
    candidate="$(grep -l 'proxy_pass http://127.0.0.1:3000' "$PANEL_VHOST"/*.conf 2>/dev/null | head -1 || true)"
    if [[ -n "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  fi
  return 1
}

reload_nginx() {
  if nginx -t 2>/dev/null; then
    nginx -s reload 2>/dev/null || service nginx reload 2>/dev/null || true
  fi
}

PETRALIAN_CONF="$(find_petralian_vhost || true)"
if [[ -z "$PETRALIAN_CONF" ]]; then
  echo "ensure-enzo: petralian.com nginx vhost not found under ${PANEL_VHOST} — skip"
  exit 0
fi
echo "ensure-enzo: using vhost ${PETRALIAN_CONF}"

if ! grep -q 'enzo\.petralian\.com' "$PETRALIAN_CONF"; then
  echo "ensure-enzo: add enzo.petralian.com to petralian.com server_name"
  sed -i -E 's/(server_name[[:space:]]+[^;]*)(;)/\1 enzo.petralian.com;/' "$PETRALIAN_CONF"
fi

PROXY_SNIPPET="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/deploy/nginx/enzo.petralian.com.conf"

patch_enzo_vhost_proxy() {
  local conf="$1"
  local tmp
  tmp="$(mktemp)"
  awk -v proxy_file="$PROXY_SNIPPET" '
    BEGIN { skip=0 }
    /^[[:space:]]*location \/ \{/ { skip=1; while ((getline line < proxy_file) > 0) print line; close(proxy_file); next }
    skip && /^[[:space:]]*\}/ { skip=0; next }
    skip { next }
    { print }
  ' "$conf" > "$tmp"
  mv "$tmp" "$conf"
}

if [[ -f "$ENZO_CONF" ]]; then
  if grep -q 'proxy_pass http://127.0.0.1:3000' "$ENZO_CONF"; then
    echo "ensure-enzo: enzo vhost already proxies to Next"
  elif [[ -f "$PROXY_SNIPPET" ]]; then
    echo "ensure-enzo: patch enzo vhost location / → proxy :3000"
    patch_enzo_vhost_proxy "$ENZO_CONF"
  fi
fi

reload_nginx
echo "ensure-enzo: done"
