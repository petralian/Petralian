# Block indexing — crm.petralian.com

Internal Perfex CRM on `46.224.49.175` (Cloudflare **dns-only**). The main Next.js site cannot control this subdomain via `petralian.com/robots.txt`.

## 1. On the CRM server (permanent)

Upload or create **`/robots.txt`** at the Perfex web root:

```txt
User-agent: *
Disallow: /
```

Add **`X-Robots-Tag`** on all responses (Apache `.htaccess` in web root):

```apache
<IfModule mod_headers.c>
  Header set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
```

Or in Perfex theme **`application/views/themes/perfex/head.php`** (path may vary), inside `<head>`:

```html
<meta name="robots" content="noindex, nofollow, noarchive" />
```

Verify after deploy:

```bash
curl -sI https://crm.petralian.com/ | grep -i robots
curl -s https://crm.petralian.com/robots.txt
```

## 2. Google Search Console (speed up de-index)

Domain property `petralian.com` includes subdomains.

1. GSC → **Indexing** → **Removals** → **New request**
2. Choose **Remove all URLs with this prefix**
3. Prefix: `https://crm.petralian.com/`
4. Temporary (~6 months) — pair with server noindex for permanent effect

Also: **URL Inspection** → `https://crm.petralian.com/` → confirm “Excluded by noindex” after server fix.

## 3. Main site

- No links to `crm.petralian.com` in the Next.js repo (confirmed).
- GSC **Links** showed 2 internal links — likely legacy; they should drop after CRM is noindex + de-indexed.

## Optional: Cloudflare proxy + header

If you later **proxy** `crm` through Cloudflare (orange cloud), add a **Transform Rule** → Modify response header → `X-Robots-Tag: noindex, nofollow` for hostname `crm.petralian.com`. Not applicable while dns-only.
