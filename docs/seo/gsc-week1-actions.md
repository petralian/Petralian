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

## Step 3 — Request indexing (URL Inspection) ✅

- [x] All 10 pillar URLs requested (2026-07-13)

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
