# IndexNow 403 — `UserForbiddedToAccessSite`

## Symptom

```bash
node scripts/request-indexing.mjs <slug>
```

Returns **403** with:

```json
{
  "errorCode": "UserForbiddedToAccessSite",
  "message": "User is unauthorized to access the site. Please verify the site using the key and try again"
}
```

## What already works

| Check | Status |
|-------|--------|
| Key file in repo | `public/petralian-indexnow-2026.txt` |
| Key file live | `https://petralian.com/petralian-indexnow-2026.txt` → **200**, body matches key |
| Script payload | `host`, `key`, `keyLocation` correct in `scripts/request-indexing.mjs` |

Hosting the key file is **necessary but not sufficient**. IndexNow (Microsoft/Bing) must **authorize** your domain to submit URLs.

## What you need to do (one-time)

### Option A — Bing Webmaster Tools (recommended)

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters/).
2. **Add site** → `https://petralian.com` (or `petralian.com`).
3. Choose verification method **IndexNow** or **HTML file**:
   - **IndexNow / key file:** point Bing at  
     `https://petralian.com/petralian-indexnow-2026.txt`  
     (same key as `INDEXNOW_KEY` / repo file).
   - **HTML file:** alternative if IndexNow option is not shown.
4. Complete verification → wait until site shows **Verified**.
5. Retry:

   ```bash
   node scripts/request-indexing.mjs hong-kong-customer-ai-is-still-mostly-a-label cdp-your-agents-need-is-a-folder-contract
   ```

   Success = **200** or **202**.

### Option B — Yandex Webmaster

If you use Yandex: add site at [webmaster.yandex.com](https://webmaster.yandex.com/), verify with the same key URL, then retry IndexNow.

### If still 403 after Bing verify

- Confirm Bing lists **exact host** `petralian.com` (not only `www` unless you submit `www` URLs).
- Re-deploy so `/{key}.txt` is reachable without redirect chain issues.
- Wait 24h after first verification (propagation).
- Ensure `INDEXNOW_KEY` env in CI/local matches the hosted filename.

## What IndexNow does *not* do

- **Google** does not use IndexNow. Use [GSC URL Inspection](https://search.google.com/search-console) manually (~10–20/day) or wait for crawl.
- IndexNow does not replace sitemap; keep `sitemap.xml` + internal links.

## Script reference

```bash
# After Bing verification
node scripts/request-indexing.mjs slug-one slug-two

# Post-publish helper (also prints GSC inspect links)
npm run post-publish:seo -- slug-one slug-two
```
