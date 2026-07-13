# WordPress legacy redirects

Implemented in [`src/lib/legacy-redirects.ts`](../../src/lib/legacy-redirects.ts), loaded first in [`next.config.ts`](../../next.config.ts).

## Strategy

| Pattern | Destination | Rationale |
|---------|-------------|-----------|
| `/tag/*`, `/category/*` | `/posts` | Taxonomy → writing hub (link equity) |
| `/services/*` | `/about` | Commercial pages → about |
| `/author/*` | `/about` | Author archives → about |
| `/page/*`, portfolio patterns | `/about` or `/posts` | Closest live section |
| `/:locale/*` (nl, fr, …) | `/`, `/posts/:slug`, or `/posts` | Preserve translated permalinks when possible |
| `/:id` (digits only) | `/posts` | Old numeric WP URLs |
| `/feed`, `/rss`, `/atom` | `/feed.xml` | Canonical feed |
| `/wp-content/*`, `/wp-admin/*` | `/` | System paths; stop 404 crawl noise |

All redirects are **301 (permanent)** to pass link equity.

Root post slugs (`petralian.com/my-post` → `/posts/my-post`) are generated from `content/posts/` separately.

## After deploy

1. `node scripts/audit-wp-redirects.mjs`
2. GSC → **Page indexing** → **Not found (404)** → **Validate fix**
3. Re-check count in 2–4 weeks

## www and http

Canonical host is `https://petralian.com` (Cloudflare + Vercel). `www` and `http` should redirect at the edge before these path rules run.
