# enzo.petralian.com — static glamour board

**Hosting model:** plain static files in the aaPanel site folder (not Next.js proxy).

| Item | Path |
|------|------|
| VPS docroot | `/www/wwwroot/enzo.petralian.com` (`data/deploy.yaml` → `domain.enzo_web_root`) |
| Build output | `enzo-static-out/` (gitignored) via `node scripts/build-enzo-static.mjs` |
| Content SSOT | `data/enzo-site.json` (also used by `/enzo` on petralian.com) |
| CI deploy | `.github/workflows/deploy-enzo-static.yml` (SSH + rsync) |

## DNS (Cloudflare)

CNAME `enzo` → same target as `petralian.com`.

## Manual deploy (SSH)

```bash
cd /www/wwwroot/petralian
git pull origin master
node scripts/build-enzo-static.mjs
rsync -a --delete enzo-static-out/ /www/wwwroot/enzo.petralian.com/
```

## Also on main site

`https://petralian.com/enzo` remains the Next.js route (middleware + host rewrite) for previews.
