# enzo.petralian.com — family microsite

Served by the same Next.js app as `petralian.com`. Host-based routing in `src/middleware.ts` rewrites `enzo.petralian.com` → `/enzo` (see `src/lib/enzo-site.ts`).

## DNS (Cloudflare)

1. Add **CNAME** `enzo` → same target as `petralian.com` (or A record to VPS IP).
2. Proxy status: same as main site (orange cloud OK).

## aaPanel / Nginx

Deploy runs `scripts/ensure-enzo-subdomain-on-vps.sh`, which:

1. Adds `enzo.petralian.com` to the main Petralian vhost `server_name` when found under `/www/server/panel/vhost/nginx/`.
2. Replaces the placeholder `location /` on `enzo.petralian.com.conf` with `deploy/nginx/enzo.petralian.com.conf` (proxy to `:3000`).

Manual fallback: alias domain on the Petralian site or paste the proxy snippet from `deploy/nginx/petralian.conf`.

## Local preview

- Path: `http://localhost:3000/enzo`
- Or add `127.0.0.1 enzo.localhost` and open `http://enzo.localhost:3000`

## Privacy

Page metadata uses `noindex, nofollow` (family board, not SEO).
