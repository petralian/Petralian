# Google Search Console recovery — petralian.com

Use this after the WordPress → Next.js migration. Complete in order; check each box.

**Week 1 checklist (copy-paste URLs):** [`gsc-week1-actions.md`](gsc-week1-actions.md)

## 1. Find or verify your property (~10 min)

1. Open [Google Search Console](https://search.google.com/search-console)
2. In the property selector (top-left), look for:
   - `https://petralian.com` (URL-prefix) — **use this if present**
   - `https://www.petralian.com` (legacy WordPress)
   - Domain property `petralian.com` (covers www + apex — best long-term)
3. If nothing is verified:
   - Add **Domain** property → `petralian.com`
   - Verify via **DNS TXT** at your domain registrar
4. Confirm `www.petralian.com` redirects to `https://petralian.com` (301)

## 2. Remove stale WordPress sitemaps

1. GSC → **Sitemaps**
2. Delete any old entries such as:
   - `sitemap_index.xml`
   - `wp-sitemap.xml`
   - `post-sitemap.xml`
   - Any URL under an old WordPress install path
3. Submit: `https://petralian.com/sitemap.xml`
4. Status should show **Success** within 24–48 hours

## 3. Check for manual actions (before disavow)

1. GSC → **Security & Manual Actions** → **Manual actions**
2. If **empty**: do **not** upload `docs/seo/disavow-2026-07-13.txt` yet
3. If **Unnatural links to your site**: upload disavow file (see vault `Operations/SEO Backlink Audit 2026-07-13.md`)

## 4. Request indexing (daily limit ~10–20 URLs)

GSC → **URL Inspection** → paste each URL → **Request indexing**

Priority URLs:

- `https://petralian.com/`
- `https://petralian.com/posts`
- `https://petralian.com/about`
- `https://petralian.com/posts/knowledge-work-agent-engine-guide-2026`
- `https://petralian.com/posts/external-memory-series-guide`
- `https://petralian.com/posts/knowledge-work-engine-project-management-2026`
- `https://petralian.com/posts/obsidian-memory-layers-personal-productivity-beyond-chat`
- `https://petralian.com/posts/why-i-rebuilt-petralian-on-nextjs`
- `https://petralian.com/posts/building-petralian-the-technical-reality`
- `https://petralian.com/posts/the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo`

## 5. Read the Pages report (what screenshots mean)

GSC → **Pages** → **Not indexed** — common reasons:

| Reason | Meaning | Action |
|--------|---------|--------|
| Discovered – currently not indexed | Google knows URL, hasn't crawled | Sitemap + request indexing |
| Crawled – currently not indexed | Crawled but not added to index | Improve internal links; wait; check content quality |
| Page with redirect | Old WP URL redirecting | Expected for legacy slugs |
| Duplicate without canonical | www vs non-www conflict | Prefer `https://petralian.com` |

## 6. Verify live crawl assets

| URL | Expected |
|-----|----------|
| `https://petralian.com/sitemap.xml` | 200, ~57+ URLs |
| `https://petralian.com/robots.txt` | 200, `Sitemap:` line present |
| `https://petralian.com/llms.txt` | 301 → `/llms.txt` |
| `https://petralian.com/llms.txt` | 200, post URL list |
| `https://petralian.com/feed.xml` | 200, all published posts |

## 7. Re-check in 2–4 weeks

- GSC **Pages** → indexed count rising
- Ahrefs **Organic keywords** (may lag GSC by weeks)
- Only upload disavow if Manual Action exists or indexation stalls with spam anchors growing in GSC **Links**
