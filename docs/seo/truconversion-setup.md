# TruConversion setup — Petralian

Component: [`src/components/TruConversion.tsx`](../../src/components/TruConversion.tsx) (production-only, like GA4).

## Enable

1. TruConversion dashboard → **Code** → copy site ID from tracking snippet
2. Vercel → Project → Environment Variables:
   - `NEXT_PUBLIC_TRUCONVERSION_SITE_ID` = your site ID
3. Redeploy production
4. Dashboard → **Verify installation**

If your dashboard snippet differs from the default embed, paste the full script into `TruConversion.tsx` (replace the `tc.js` loader).

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
