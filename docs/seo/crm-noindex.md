# Block indexing — crm.petralian.com

Internal Perfex CRM on `46.224.49.175` (Cloudflare **dns-only**). The main Next.js site cannot control this subdomain via `petralian.com/robots.txt`.

**Server:** nginx (verified 2026-07-13) — `.htaccess` does **not** apply.

**SSH (aaPanel VPS):** `ssh root@46.224.49.175` (key `~/.ssh/id_rsa`).  
**Nginx vhost:** `/www/server/panel/vhost/nginx/crm.petralian.com.conf`  
**Perfex web root:** `/www/wwwroot/crm.petralian.com/`

## 1. On the CRM server (permanent)

### A. robots.txt (done on live site)

Upload [`crm-deploy/robots.txt`](crm-deploy/robots.txt) to Perfex web root.

Live check (2026-07-13): `https://crm.petralian.com/robots.txt` → `Disallow: /` ✓

### B. X-Robots-Tag header (**done 2026-07-20**)

CRM runs **nginx**, not Apache. Live HTTPS `server` block now includes:

```nginx
add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
```

Verified: `node scripts/audit-crm-noindex.mjs` → home + login headers pass.  
Backup on server: `crm.petralian.com.conf.bak-xrobots-*` under `/www/server/panel/vhost/nginx/`.

Snippet file (reference): [`crm-deploy/nginx-noindex.conf`](crm-deploy/nginx-noindex.conf)

**Optional:** Perfex login layout `<head>` meta robots (redundant once header is live).

### Verify

```bash
node scripts/audit-crm-noindex.mjs
```

Expect: robots.txt pass + X-Robots-Tag pass.

## 2. Google Search Console (speed up de-index)

Domain property `petralian.com` includes subdomains.

1. GSC → **Indexing** → **Removals** → **New request**
2. Choose **Remove all URLs with this prefix**
3. Prefix: `https://crm.petralian.com/`
4. Temporary (~6 months) — pair with server noindex for permanent effect

Also: **URL Inspection** → `https://crm.petralian.com/` → confirm “Excluded by noindex” after header fix.

## 3. Main site

- No links to `crm.petralian.com` in the Next.js repo (confirmed).
- Semrush toxic audit: 42/81 spam links target CRM login URLs.

## Optional: Cloudflare proxy + header

If you later **proxy** `crm` through Cloudflare (orange cloud), add a **Transform Rule** → Modify response header → `X-Robots-Tag: noindex, nofollow` for hostname `crm.petralian.com`. Not applicable while dns-only.
