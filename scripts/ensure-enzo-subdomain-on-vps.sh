#!/usr/bin/env bash
# Route enzo.petralian.com to the same Next.js app as petralian.com.
# Disables aaPanel "site created successfully" placeholder vhost when present.
set -euo pipefail

PANEL_VHOST="/www/server/panel/vhost/nginx"
PETRALIAN_CONF="${PANEL_VHOST}/petralian.com.conf"
ENZO_CONF="${PANEL_VHOST}/enzo.petralian.com.conf"

reload_nginx() {
  if nginx -t 2>/dev/null; then
    nginx -s reload 2>/dev/null || service nginx reload 2>/dev/null || true
  fi
}

if [[ ! -f "$PETRALIAN_CONF" ]]; then
  echo "ensure-enzo: petralian.com nginx vhost not found — skip"
  exit 0
fi

if ! grep -q 'enzo\.petralian\.com' "$PETRALIAN_CONF"; then
  echo "ensure-enzo: add enzo.petralian.com to petralian.com server_name"
  sed -i -E 's/(server_name[[:space:]]+[^;]*)(;)/\1 enzo.petralian.com;/' "$PETRALIAN_CONF"
fi

if [[ -f "$ENZO_CONF" ]] && ! grep -q 'proxy_pass http://127.0.0.1:3000' "$ENZO_CONF"; then
  DISABLED="${ENZO_CONF}.disabled-placeholder"
  echo "ensure-enzo: disable placeholder vhost → $DISABLED"
  mv "$ENZO_CONF" "$DISABLED"
fi

reload_nginx
echo "ensure-enzo: done"
