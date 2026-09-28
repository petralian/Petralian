# enzo.petralian.com — family microsite

Served by the same Next.js app as `petralian.com`. Host-based routing in `src/middleware.ts` rewrites `enzo.petralian.com` → `/enzo` (see `src/lib/enzo-site.ts`).

## DNS (Cloudflare)

1. Add **CNAME** `enzo` → same target as `petralian.com` (or A record to VPS IP).
2. Proxy status: same as main site (orange cloud OK).

## aaPanel / Nginx

Add `enzo.petralian.com` as an **alias domain** on the existing Petralian site (same `proxy_pass http://127.0.0.1:3000` block as `deploy/nginx/petralian.conf`). No separate Node process.

## Local preview

- Path: `http://localhost:3000/enzo`
- Or add `127.0.0.1 enzo.localhost` and open `http://enzo.localhost:3000`

## Privacy

Page metadata uses `noindex, nofollow` (family board, not SEO).
