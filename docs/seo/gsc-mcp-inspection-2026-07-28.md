# GSC URL inspection via OpenSEO MCP (2026-07-28)

**Project:** petralian.com (`45d09f46-ddaf-422e-96d9-34a35a5b85bd`)  
**Source:** GSC Coverage drilldown xlsx (172 URLs) + live HEAD probe + `inspect_urls` (20 URLs, 2 batches)

## Live probe summary (404 export, 61 URLs)

| Result | Count | Notes |
|--------|------:|-------|
| Redirect → 200 | 59 | WP legacy rules already work in production |
| Still **404** | 2 | Fixed in `next.config.ts` (pending deploy) |

**True 404s before deploy:**

- `/posts/what-the-next-generation-of-delivery-leadership-may-look-like` — post never published; 301 → leadership decisions post
- `/new-merkle-md/page/2/?et_blog` — WP pagination; 301 → `/posts/new-merkle-md`

**Additional redirects added (live 404 on HEAD):**

- `/privacy-policy` → `/about`
- `/how-ai-and-human-imagination-work-together-to-break-barriers/` → `/posts/how-ai-and-human-imagination-work-together`
- `/posts/delivery-leadership` → `/posts/knowledge-work-engine-leadership-decisions-2026`

## OpenSEO `inspect_urls` — batch 1 (404 / legacy)

| URL | GSC inspection |
|-----|----------------|
| `/posts/what-the-next-generation-of-delivery-leadership-may-look-like` | Not found (404) |
| `/new-merkle-md/page/2/` | Unknown to Google |
| `/privacy-policy/` | Crawled — not indexed |
| `/how-ai-and-human-imagination-…-to-break-barriers/` | Crawled — not indexed |
| `/posts/delivery-leadership` | Unknown to Google |
| `/tag/shopify/` | Not found (404) — *GSC stale; live redirects to `/posts`* |
| `/redefining-media-agency-success-…/` | Not found (404) — *GSC stale; live → `/posts/…`* |
| `/blog/gravio-multi-repo-rollout-playbook/` | Not found (404) — *GSC stale; live → `/posts/…`* |
| `/category/ideas/page/2/` | Unknown to Google |
| `/posts/petralian-seo-geo-publish-pipeline-2026` | Discovered — not indexed → **request indexing** |

## OpenSEO `inspect_urls` — batch 2 (crawled-not-indexed samples)

| URL | GSC inspection | Live (2026-07-28) |
|-----|----------------|-------------------|
| `/posts/managed-agent-memory-vs-files-you-control-2026` | **Indexed** | 200 |
| `/the-future-of-social-commerce-…/` | Crawled — not indexed | 301 → `/posts/…` |
| `/thank-you-merkle/` | Crawled — not indexed | 301 → `/posts/thank-you-merkle` |
| `/the-power-of-engagement-…/` | Crawled — not indexed | 301 → `/posts/…` |
| `/posts?tag=APAC` | Crawled — not indexed | Review: query param hub |
| `/feed.xml` | Crawled — not indexed | 200 (feed; low index priority OK) |
| `/boutiques-agencies-…-roi/` | Crawled — not indexed | 301 → `/posts/…` |
| `www.petralian.com/tag/silk-commerce/` | Unknown | Use apex; www → apex at edge |
| `/posts/what-i-learned-directing-ai-as-my-primary-engineer` | Not found (404) | **200** — GSC stale |
| `/contextual-ai-for-ecommerce-…/` | Not found (404) | **301 → `/posts/…`** — GSC stale |

**Takeaway:** Most “404” in GSC inspection reflects **pre-redirect crawl state**. After deploy + **Validate fix**, counts should drop. Only 2 URLs were truly 404 on live HEAD before redirect patch (2026-07-28).

## GSC “Validate fix” — when to click

| Signal | Enough alone? |
|--------|----------------|
| OpenSEO crawl: 0×404 in 50 pages | **No** — sample only; still validate after deploy |
| Live `audit-wp-redirects.mjs` passes | **Yes** — then GSC → Page indexing → Not found (404) → **Validate fix** |
| Redirect patch deployed to production | **Required** before validate |

OpenSEO audit ≠ GSC recrawl. Validate fix tells Google to re-check the **404 issue cluster**; allow 2–4 weeks for counts to fall.

## After deploy

1. `node scripts/audit-wp-redirects.mjs` — must pass (includes new cases)
2. GSC → **Page indexing** → **Not found (404)** → **Validate fix**
3. URL Inspection → **Request indexing** on `petralian-seo-geo-publish-pipeline-2026`
4. Re-run OpenSEO site audit (user) when crawl completes

## Indexing actions (no code)

| Priority | URL | Action |
|----------|-----|--------|
| P0 | `/posts/petralian-seo-geo-publish-pipeline-2026` | Request indexing |
| P1 | `/privacy-policy/` | Resolves after 301 deploy; validate fix |
| P2 | Legacy root slugs in “crawled not indexed” | Mostly fixed by existing `/slug` → `/posts/slug` rules; wait for recrawl |
