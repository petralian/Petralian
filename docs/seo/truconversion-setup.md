# TruConversion setup — Petralian

Component: [`src/components/TruConversion.tsx`](../../src/components/TruConversion.tsx) (production-only, like GA4).

## Embedded scripts

Both snippets from TruConversion → **Code** are wired in `TruConversion.tsx`:

| Script | Source |
|--------|--------|
| Heatmaps / experiments | `app.truconversion.com/ti-js/35198/d46f0.js` |
| Visitor tracking (Reveal) | `rest.revealid.xyz/v3/script?clientId=bYWmatUgWapY699k1o1sgm` |

Defaults live in [`src/lib/constants.ts`](../../src/lib/constants.ts). Override via Vercel env if the dashboard rotates IDs:

- `NEXT_PUBLIC_TRUCONVERSION_SCRIPT_PATH` = `35198/d46f0`
- `NEXT_PUBLIC_TRUCONVERSION_REVEAL_CLIENT_ID` = `bYWmatUgWapY699k1o1sgm`

## Enable

1. Commit + push (or redeploy) so production serves the updated component
2. TruConversion dashboard → **Verify installation**
3. Confirm recordings appear on `/`, `/posts`, and a sample `/posts/*` URL

No Vercel env vars required unless you change IDs in the dashboard.

## Campaigns to create

| Campaign | URL pattern | Goal |
|----------|-------------|------|
| Homepage | `petralian.com/` | Scroll depth, nav clicks |
| Writing index | `/posts` | Filter/category usage |
| Post reading | `/posts/*` | Scroll to subscribe box |
| Subscribe CTA | `/posts/*` | Click on `.subscribe-box` |

## A/B test (week 3)

- **Control:** current subscribe copy on pillar posts
- **Variant:** shorter CTA — "Weekly digest — enterprise AI & execution"
- Metric: subscribe form submit (cross-check GA4 `generate_lead` if configured)

## Privacy

- TruConversion loads third-party JS — only on production
- Document in privacy policy if EU traffic grows
