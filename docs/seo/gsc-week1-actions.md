# GSC Week 1 — manual actions (copy this checklist)

Property: **Domain `petralian.com`** (single property — do not maintain www/https duplicates).

**Status:** Week 1 complete (2026-07-13). Re-check Pages + Links ~2026-07-27.

## Step 1 — Delete stale sitemaps ✅

GSC → **Indexing** → **Sitemaps** → three-dot menu → **Remove sitemap** for each:

- [x] `https://www.petralian.com/sitemap.rss`
- [x] `https://www.petralian.com/sitemap.xml`
- [x] `http://frankfurt.petralian.com/sitemap-index.xml`
- [x] `http://www.petralian.com/sitemap_index.xml`

**Keep:** `https://petralian.com/sitemap.xml` (Status: Success, 71 pages).

## Step 2 — Manual actions ✅

GSC → **Security & Manual Actions** → **Manual actions**

- [x] Confirmed **empty** (2026-07-13) — no unnatural-links penalty → **do not upload disavow**

GSC → **Security issues** — also **empty** (2026-07-13).

> **Not the same as Links report.** [Links](https://search.google.com/search-console/links?resource_id=sc-domain%3Apetralian.com) shows who links to you. As of 2026-07-13: 142 external links, mostly `curiosithee.be` (125) → homepage only. **No disavow** needed.

## Step 2b — Block internal CRM from index

See [`crm-noindex.md`](crm-noindex.md) — `crm.petralian.com` must be noindex on the Perfex server + optional GSC prefix removal.

## Step 2c — CRM noindex + verify (backlink audit follow-up)

Semrush toxic audit (2026-07-13): **42 of 81** toxic links target `crm.petralian.com`. Full runbook: [`backlink-audit-2026-07-13.md`](backlink-audit-2026-07-13.md).

- [ ] Upload [`crm-deploy/robots.txt`](crm-deploy/robots.txt) + [`.htaccess`](crm-deploy/.htaccess) to Perfex web root on `46.224.49.175`
- [ ] Verify `https://crm.petralian.com/robots.txt` shows `Disallow: /`
- [ ] Verify response header includes `X-Robots-Tag: noindex` (browser devtools or `curl -sI`)
- [ ] GSC → **Indexing** → **Removals** → prefix `https://crm.petralian.com/`
- [ ] URL Inspection → `https://crm.petralian.com/` → confirm “Excluded by noindex” after deploy

**Do not upload disavow** until Manual Action exists or indexation stalls (~re-check 2026-07-27). Break-glass file: [`disavow-2026-07-13.txt`](disavow-2026-07-13.txt) (352 domains).

## Step 3 — Request indexing (URL Inspection) ✅

- [x] All 10 pillar URLs requested (2026-07-13)

### Step 3b — New pillar posts (after 2026-07-13 deploy)

GSC → **URL Inspection** → **Request indexing** for each:

- [ ] `https://petralian.com/posts/what-i-learned-directing-ai-as-my-primary-engineer`
- [ ] `https://petralian.com/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment`

## Step 4 — Baseline snapshot

GSC → **Indexing** → **Pages** (export `petralian.com-Coverage-2026-07-13.xlsx`):

| Date | Indexed | Not indexed | Notes |
|------|---------|-------------|-------|
| 2026-06-30 | 80 | 200 | Latest row in export; migration dip from ~110 (May) |
| 2026-07-13 | — | — | Re-export after 2–4 weeks |

**Not indexed breakdown (2026-07-13 export):**

| Reason | Pages | Action |
|--------|-------|--------|
| Crawled – currently not indexed | 110 | Wait + internal links; post-migration normal |
| Not found (404) | 63 | Legacy WP URLs — expected |
| Alternate page with proper canonical | 17 | www/duplicate — expected |
| Page with redirect | 4 | Legacy redirects — expected |
| Blocked (403) | 2 | Investigate if count rises |
| Duplicate without user-selected canonical | 2 | Minor |
| Server error (5xx) | 1 | Spot-check in URL Inspection |
| Excluded by noindex | 1 | Intentional page |

Re-check in 2–4 weeks (target **~2026-07-27**). After WP redirect deploy: run `audit-wp-redirects.mjs`, then **Validate fix** on GSC 404 report.
