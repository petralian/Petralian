# Crawl audit — 2026-07-13

Automated substitute for WebSite Auditor (run monthly: `npm run audit:site`).

## Live sitemap (`audit-live-sitemap.mjs`)

| Check | Result |
|-------|--------|
| URLs in sitemap | 71 |
| HTTP status | All 2xx/3xx |

## Internal links (`audit-internal-links.mjs`)

**5 broken target slugs** (unpublished vault drafts linked from live posts).

**Fix applied:** temporary 301 redirects in [`next.config.ts`](../../next.config.ts) until drafts publish:

| Broken slug | Redirects to |
|-------------|--------------|
| `what-i-learned-directing-ai-as-my-primary-engineer` | `training-an-ai-is-like-managing-an-employee` |
| `getting-enterprise-ai-right-the-work-that-comes-before-deployment` | `why-your-ai-program-may-fail-before-it-starts` |
| `cursor-local-proxy-cloudflare-tunnel-windows` | `cursor-token-saving-tools-beyond-headroom-2026` |
| `cursor-stack-cherry-picking-honey-superpowers-headroom-2026` | `cursor-token-saving-tools-beyond-headroom-2026` |
| `why-your-ai-program-is-failing-before-it-starts` | `why-your-ai-program-may-fail-before-it-starts` (permanent) |

**Next:** publish pillar drafts from vault → remove temporary redirects.

## Cross-check with GSC

- Sitemap: Success, 71 pages
- Compare **Pages → Not indexed** reasons after indexing requests

## Re-run

```bash
npm run audit:internal-links
npm run audit:live-sitemap
```
