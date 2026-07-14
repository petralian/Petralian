#!/usr/bin/env node
/**
 * Write generic plan-derived drafts to Obsidian Blog/01 Drafts/
 * Usage: node scripts/_write-plan-drafts.mjs
 */
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const cli = join(__dir, "obsidian-mcp-cli.mjs");
const tmpDir = join(__dir, "_draft-tmp");
mkdirSync(tmpDir, { recursive: true });

function writeDraft(relPath, content) {
  const tmp = join(tmpDir, relPath.replace(/\//g, "_"));
  writeFileSync(tmp, content, "utf8");
  execSync(`node "${cli}" write "${relPath}" --file "${tmp}"`, { stdio: "inherit" });
}

const drafts = [
  {
    path: "Blog/01 Drafts/shopify-app-embeds-installed-but-not-tracking.md",
    content: `---
title: "Shopify App Embeds: Installed Is Not the Same as Tracking"
slug: shopify-app-embeds-installed-but-not-tracking
date: 2026-06-07
category: Commerce & Marketing
tags: ["Ecommerce", "Marketing Technology", "AI in Marketing"]
excerpt: "A Shopify app can be installed while attribution never runs. App embeds, landing-page coverage, and cart attributes are three separate gates."
featured_image:
focus_keyword: shopify app embed attribution tracking
seo_description: "Why Shopify referral and analytics apps show zero conversions: app embeds off by default, tracking only on some pages, and missing cart attributes at checkout."
image_prompt: "Editorial 16:9 diagram on paper: three labeled gates Installed, Enabled, Attributing leading to a checkout receipt, warm office light, no logos, no readable text, no faces."
image_prompt_variant_1: "Tiny theme-editor diorama: app embed toggle OFF while install badge glows green, clever workshop tone, 16:9, no logos."
image_prompt_variant_2: "Split scene: left checkout with empty order attributes, right same checkout with referral code flowing cookie to cart to webhook, editorial contrast, 16:9."
---

Shopify apps that depend on storefront behavior fail in a predictable way: the merchant sees **Installed** in admin, campaigns go live, and reporting stays at zero. The gap is almost never "Shopify is broken." It is three gates that teams treat as one.

This applies to referral programs, affiliate pixels, loyalty identifiers, and any flow that must survive from **landing URL → browser state → cart → order webhook**.

---

## The problem: three gates, one dashboard light

| Gate | What merchants assume | What actually has to be true |
|------|----------------------|------------------------------|
| **Installed** | App is on the store | OAuth + app record exists |
| **Enabled** | Tracking works everywhere | Theme app embed (or equivalent) is on in Theme settings |
| **Attributing** | Orders get credit | Cookie/session + cart attribute + server webhook all agree |

Miss any gate after install and you get the same symptom: **clicks or conversions stay at zero** while orders look healthy in Shopify admin.

Shopify theme app extension embeds are **disabled by default** after install. Merchants must open **Theme settings → App embeds** and turn on the head/body embed that loads your bootstrap script. Documentation that only says "add our app block to the homepage" does not fix global landing traffic.

---

## Why page-scoped blocks fail

Many apps ship a **section block** (referral widget, reviews carousel, loyalty banner) and inline click tracking only where that block renders.

That breaks real traffic:

- Paid social lands on a **collection** or **password** page without the block.
- Email links hit **/products/...** while tracking lives on **/**.
- Influencer URLs use **?ref=** on pages the theme never loads your snippet on.

**Fix pattern:** one **head app embed** (global bootstrap) plus optional blocks for UI. Bootstrap responsibilities:

1. Parse query params (`? ref = `, ` ? utm_`, partner codes).
2. Set a first-party cookie or `localStorage` with TTL and dedup.
3. Call your **track** endpoint once per session.
4. Re-inject **cart attributes** after add-to-cart and on `pageshow` (Safari back-forward).

---

## Cart attributes are the checkout handoff

Shopify checkout does not automatically read cookies your app set in the theme. The durable bridge is **`/ cart / update.js`** cart attributes (surfaced as `note_attributes` on the order).

Without that attribute at checkout time, server webhooks see a paid order with **no referral field**, even if the friend clicked a valid link on day one.

**Pre-flight test for any attribution app:**

1. Land with test param in an incognito window.
2. Confirm cookie or session flag in DevTools.
3. Add to cart; inspect cart JSON for your attribute key.
4. Complete test checkout; confirm attribute on the order.
5. Confirm webhook handler reads the same key name your storefront writes.

Name drift between Liquid, JS, and server (`ref_code` vs `referral_code`) is a common silent failure.

---

## Server-side: do not over-gate webhooks

Webhook handlers often require `customerId`, a feature flag, and a non-empty attribute before creating a conversion. That is correct for fraud control but deadly when **guest checkout** is allowed.

Pattern that survives production:

- If attribute present → process conversion even for guest buyers.
- Resolve shop domain with the same normalizer you use at OAuth (myshopify.com vs custom domain mismatch breaks lookups).
- Log a single structured line per paid order: attribute present yes/no, conversion created yes/no.

---

## Merchant checklist (copy into your docs)

1. App **installed** in Shopify admin.
2. Theme **app embed enabled** (screenshot in onboarding).
3. Test link opened on a page **without** your marketing block.
4. Cart attribute visible before checkout.
5. Test order shows attribute in **Additional details**.
6. Your app dashboard increments within one webhook retry window.

---

## What you can do next

1. Audit whether tracking lives in a **block only** or a **global embed**.
2. Add a **merchant diagnostics** panel: embed on/off, last track call, last cart attribute write.
3. Document that **discount codes ≠ referral link codes** (see companion post on checkout attribution).
4. Run the five-step incognito test before every major campaign launch.

Attribution is a pipeline. Install is step zero.

---

**Sources**

1. Shopify, "Configure theme app extensions." https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration
2. Shopify, "Cart API reference." https://shopify.dev/docs/api/ajax/reference/cart
`,
  },
{
  path: "Blog/01 Drafts/ugc-feed-broken-first-load-ssr-stale-media.md",
    content: `---
title: "Why Your UGC Feed Looks Broken for the First Five Seconds"
slug: ugc-feed-broken-first-load-ssr-stale-media
date: 2026-06-07
category: Commerce & Marketing
tags: ["Ecommerce", "Customer Experience", "Marketing Technology"]
excerpt: "SSR plus expired social CDN URLs produces broken thumbs and floating captions. Skeleton states and proactive refresh beat onerror-only retry."
featured_image:
focus_keyword: ugc feed broken images shopify
seo_description: "UGC and social commerce feeds often flash broken images on first load. Why expired CDN URLs, SSR timing, and missing skeletons hurt conversion."
image_prompt: "Editorial 16:9 browser mockup: social feed grid with grey shimmer placeholders resolving into photos, warm neutral UI, no logos, no readable text."
image_prompt_variant_1: "Tiny conveyor belt: expired URL tickets enter a refresh booth and exit as valid image cards, workshop clever tone, 16:9."
image_prompt_variant_2: "Before/after split: left broken image icons and captions floating, right stable grid with loaded thumbs, professional playful, 16:9."
---

Social proof feeds on ecommerce storefronts often look **broken on first paint**: grey broken-image icons, captions sitting above empty frames, product chips arriving late. Shoppers bounce before the feed becomes credible.

The root cause is usually **not** your API. It is **server-rendered HTML that references time-limited media URLs** plus **client hydration that retries too late**.

---

## What shoppers see (sequence)

\`\`\`mermaid
sequenceDiagram
  participant SSR as Server_rendered_HTML
  participant Browser
  participant CDN as Social_CDN
  participant API as Your_refresh_API

  SSR->>Browser: img src = expired signed URL
  Browser->>CDN: GET image
  CDN-->>Browser: 403 or empty
  Note over Browser: Broken icon + layout shift
  Browser->>API: onerror refresh per card
  API-->>Browser: fresh URL (1-3s later)
  Note over Browser: Feed finally looks correct
\`\`\`

Instagram, TikTok, and other networks issue **short-lived CDN URLs**. If your Liquid or SSR cache embeds yesterday's URL, the browser fails before your JavaScript runs a refresh.

---

## Why onerror-only retry is a weak contract

The common pattern:

\`\`\`html
<img src="{{ expired_url }}" onerror="refreshMedia(this)">
\`\`\`

Problems:

1. **User sees the failure** (broken glyph is the first impression).
2. **Layout shifts** when caption and product row render before the thumb stabilizes.
3. **Thundering herd** if every card errors at once on slow mobile networks.
4. **Carousel aspect ratios** diverge (9:16 TikTok vs 1:1 Instagram) unless CSS constrains the **frame**, not the intrinsic media.

---

## Fix A: skeleton-first rendering

Do not show caption, chips, or engagement counts until **media ready** OR **confirmed fallback**.

CSS pattern:

- Card starts in \`data-loading\` with shimmer placeholder (fixed aspect ratio frame).
- Hide caption/chips with \`visibility: hidden\` or \`opacity: 0\` until \`data-ready\`.
- Promote to \`data-ready\` on \`img.decode()\` success or refresh API return.

Shopify merchants expect polish similar to native collection grids. A feed that flashes errors reads as "broken app," not "slow network."

---

## Fix B: proactive refresh before paint

For feeds you control server-side:

1. At SSR, **omit** \`src\` or use a **local placeholder** if URL age > threshold.
2. In \`connectedCallback\` / first paint, batch-request fresh URLs for **visible** cards (Intersection Observer).
3. Swap \`src\` before browser hits expired CDN when possible.

For app-proxy feeds, add a **batch refresh endpoint** (\`?ids=\`) to cut round trips from N per card to 1 per viewport.

---

## Fix C: uniform carousel frames

In horizontal carousels, **do not** let each network's native aspect ratio set card height. Use a **fixed thumb frame** (often 1:1 at card width) and \`object-fit: cover\` inside. Reserve 9:16 portrait for **modal** or grid mode only.

Uneven card heights read as a layout bug even when images load correctly.

---

## Product chips and second-wave emptiness

Feeds that attach **shoppable SKUs** often prefetch product JSON in a second async pass. If chips render an empty row while media still loads, users see a "broken commerce" state.

**Pattern:** tie chip visibility to the same \`data-ready\` gate as media, or show chip skeletons—not an empty flex row.

---

## What you can do next

1. Record a **hard refresh** screen capture on 4G throttling; count seconds until zero broken glyphs.
2. Add **feed-level loading** state independent of per-card onerror.
3. Batch media refresh for above-the-fold cards.
4. Constrain carousel thumb frames; test mixed TikTok + photo sources.
5. Monitor **CDN 403 rate** on image requests in RUM if available.

First impression is SSR plus CSS discipline, not faster retry logic alone.

---

**Sources**

1. Shopify, "Performance best practices for themes." https://shopify.dev/docs/storefronts/themes/best-practices/performance
`,
  },
{
  path: "Blog/01 Drafts/shopify-customer-account-extensions-app-proxy-cross-origin.md",
    content: `---
title: "Shopify Customer Account Extensions Cannot Use App Proxy Like Your Storefront"
slug: shopify-customer-account-extensions-app-proxy-cross-origin
date: 2026-06-07
category: AI & Building
tags: ["Developer Tools", "Agentic AI"]
excerpt: "Customer Account UI runs on shopify.com origins. App Proxy URLs work for the theme, not for extension fetch. Split your API base URL strategy."
featured_image:
focus_keyword: shopify customer account extension api
seo_description: "Why Shopify Customer Account extensions return empty data when using App Proxy URLs, and how to split storefront vs extension API origins."
image_prompt: "Editorial 16:9 diagram: two browser windows labeled Storefront and Customer Account with different arrows to API endpoints, clean technical illustration, no logos."
image_prompt_variant_1: "Tiny postal system: theme letters go through local proxy slot, account letters need direct air mail, clever workshop, 16:9."
image_prompt_variant_2: "Split path maze vs straight line from Customer Account UI to app server, editorial playful contrast, 16:9."
---

If you build Shopify apps with **theme app extensions** and **Customer Account UI extensions**, you may have one \`appUrl\` helper and one happy path. That works until merchants open **the new customer accounts** experience and your reviews, loyalty, or referral pages show **empty state forever**.

The failure is often **cross-origin**: the storefront and Customer Account UI do not run in the same security context. **App Proxy** is the right tool for one and the wrong tool for the other.

---

## Two surfaces, two networks

| Surface | Where JS runs | Typical API path |
|---------|---------------|------------------|
| **Online Store theme** | Merchant \`myshopify.com\` | App Proxy \`/apps/your-app/...\` |
| **Customer Account UI** | \`shopify.com\` customer account host | **Direct HTTPS to app origin** \`/api/...\` |

App Proxy rewrites requests through the **shop domain** so theme JavaScript stays same-origin. Customer Account extensions execute in Shopify's hosted UI. Fetching \`https://merchant.myshopify.com/apps/...\` from that context is **cross-origin** and may fail silently when code swallows errors in \`.catch(() => {})\`.

---

## Symptom pattern

1. Extension deploy succeeds; merchant adds menu link.
2. Profile or account page loads shell UI.
3. Lists (reviews, rewards, linked social posts) are **empty** with no visible error.
4. Same customer ID returns correct JSON when you curl the **Fly/Heroku/Railway origin** with shop header.

That last step confirms logic is fine; **URL strategy** is wrong.

---

## Fix: split URL helpers

\`\`\`javascript
// Theme / Liquid blocks only
export function storefrontApi(path) {
  return \`/apps/your-app\${path}\`; // App Proxy
}

// Customer Account extensions only
export function extensionApi(path) {
  return \`\${APP_ORIGIN}/api\${path}\`; // baked at build from shopify.app.toml application_url
}
\`\`\`

Generate \`APP_ORIGIN\` at build/deploy from \`application_url\` in \`shopify.app.toml\`. Do not hardcode production URLs in source.

On the server, resolve shop with the **same normalizer** for proxy requests, session shop, and customer-account session tokens. Custom domains and \`*.myshopify.com\` drift breaks multi-tenant lookups.

---

## CORS and session

Direct extension calls require:

- Correct **CORS** for Shopify customer account origins (follow current Shopify docs for extension fetch).
- **Customer session** or token exchange per Shopify Customer Account API patterns.
- **Shop parameter** fallback when proxy middleware is not there to inject it.

Test with a real customer login, not only staff impersonation.

---

## Unicode and empty copy bugs

Extension bugs also come from copy-paste: JSX text nodes with literal \`\\u2019\` sequences render backslash-u instead of an apostrophe. Empty states then look like broken i18n on top of broken fetch.

Separate **data bugs** from **presentation bugs** in QA matrices.

---

## Architecture target

\`\`\`d2
direction: right

theme: "Online Store\ntheme JS" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

proxy: "App Proxy\n/ apps / ..." {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

ext: "Customer Account\nextension" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

api: "App server\n/ api / ..." {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

theme -> proxy -> api
ext -> api: "direct origin" {
  style.stroke: "#ff6a3d"
}
\`\`\`

---

## What you can do next

1. Grep extension code for App Proxy paths; replace with \`APP_ORIGIN\` helper.
2. Add build step that syncs origin from TOML before \`shopify app deploy\`.
3. QA matrix: logged-in customer on **Orders**, **Profile**, and each **full-page extension**.
4. Log fetch failures in extension UI (banner), not silent empty components.

One \`appUrl\` function is a coupling bug waiting for customer accounts.

---

**Sources**

1. Shopify, "Build customer account UI extensions." https://shopify.dev/docs/api/customer-account-ui-extensions
2. Shopify, "About app proxies." https://shopify.dev/docs/apps/build/online-store/app-proxies
`,
  },
];

// Continue in part 2 - write remaining drafts in same file by appending
console.log("Part 1:", drafts.length, "drafts");
