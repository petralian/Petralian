---
title: "Why Vouch Merchants See Zero Referrals (and It Is Usually Not Your Code)"
slug: vouch-referral-tracking-three-gates-shopify
date: 2026-07-06
status: published
tags:
  - Ecommerce
  - Customer Experience
  - Marketing Technology
excerpt: "Vouch can be installed while referrals stay at zero. Three separate gates—embed enabled, link attribution, and account-page data—must pass before orders earn credit."
featured_image: /images/posts/vouch-referral-tracking-three-gates-shopify.png
featured_image_alt: >-
  Editorial diagram of three gates leading to a checkout receipt with a referral
  field, warm paper texture, no logos or readable text.
focus_keyword: shopify referral tracking not working
seo_description: "Why Vouch and other Shopify referral apps show zero conversions: app embed off, referral links confused with discount codes, and customer account pages on a different API path."
image_prompt: "Editorial 16:9 diagram on warm paper: three gates labeled Installed, Enabled, Attributing leading to a checkout receipt with a referral field, office light, no logos, no readable text, no faces."
image_prompt_variant_1: "Tiny theme-editor diorama: green Installed badge while app embed toggle stays OFF, clever workshop tone, 16:9, no logos."
image_prompt_variant_2: "Split scene: left checkout missing referral attribute, right same checkout with referral code flowing from link to cart to order, editorial contrast, 16:9."
format: hybrid
best_for: Shopify merchants and founders triaging zero-referral tickets on referral programs
---

> **Deeper architecture:** [Customer account monolith anti-pattern](/posts/customer-account-monolith-anti-pattern-shopify-extensions) — when one API path cannot serve every Shopify surface.

## What breaks when referrals show zero

**Referral tracking on Shopify** is a pipeline from landing link to paid order—not a single switch in admin. **Vouch** merchants often see **Installed** in the app list, launch campaigns, and still report **zero referrals** while orders look healthy in Shopify.

**Who this is for:** **Shopify merchants, founders running referral programs, and support leads** triaging zero-referral tickets — you do not need to be an engineer to walk the three gates.

**What you will learn:** three gates that fail independently, why discount codes are not referral codes, and what to check on customer account pages before blaming application logic.

---

If you support referral apps on Shopify, you have seen this ticket: the program is live, friends get discounts, and the referrer dashboard stays empty. The instinct is to redeploy or rewrite tracking code. In practice, the failure is usually **configuration and naming**, not a broken webhook.

This article names the three gates I use when triaging **Vouch** stores. The same pattern applies to affiliate pixels, loyalty IDs, and any flow that must survive from URL → browser → cart → order.

---

## Gate 1: Installed is not the same as tracking

Shopify apps that depend on storefront behavior fail in a predictable way. The merchant sees **Installed** in admin, campaigns go live, and reporting stays at zero.

| Gate | What merchants assume | What has to be true |
|------|----------------------|---------------------|
| **Installed** | App is on the store | OAuth and app record exist |
| **Enabled** | Tracking works everywhere | Theme **app embed** is on in Theme settings |
| **Attributing** | Orders get credit | Cookie or session, cart attribute, and server webhook agree |

Miss any gate after install and you get the same symptom: clicks or conversions stay at zero.

Shopify **theme app extension embeds are disabled by default** after install. Merchants must open **Theme settings → App embeds** and turn on the head or body embed that loads the bootstrap script. Documentation that only says "add our app block to the homepage" does not fix global landing traffic from paid social, email, or influencer links.

```d2
direction: right

installed: "Gate 1\nInstalled" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

enabled: "Gate 2\nEmbed enabled" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

attributing: "Gate 3\nAttributing" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

checkout: "Paid order\nwith attribute" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

installed -> enabled -> attributing -> checkout
```

**Fix pattern:** one global head embed for bootstrap (parse query params, set first-party cookie, call track endpoint once per session) plus optional blocks for UI widgets. Page-scoped blocks alone break when traffic lands on collection or product URLs without the widget.

---

## Gate 2: Referral links are not checkout discount codes

Merchants and technical partners often treat referral links and friend discount codes as the same thing because both appear in campaign URLs. They are not.

**Referral link flow:**

1. Visitor lands with `?ref=CODE` or similar.
2. Storefront script stores code in cookie or session.
3. Cart attribute carries code into checkout.
4. Order webhook reads `note_attributes` for conversion creation.

**Discount code flow:**

1. Visitor enters code or arrives with `/discount/CODE`.
2. Shopify price rules apply adjustment at checkout.
3. Order shows discount line; referral attribute may be **empty**.

Campaign briefs say "use code FRIEND20." Support docs rarely say whether FRIEND20 is a price rule, a referral key, or both. Checkout succeeds, the friend gets a discount, and the referrer gets no credit.

Shopify surfaces cart attributes as **note_attributes** on the order. That is the durable handoff for apps that are not the discount engine. If your program only watches discount applications, you miss referrals that never map to a price rule.

**Product clarity for merchants:**

1. **Referral code** — tracks who invited whom.
2. **Friend incentive** — may be automatic discount, free shipping, or points.
3. **Optional manual coupon** — price rule the friend types at checkout.

Product and technical teams can link them commercially. Technically they are **separate pipes**. Report referral conversion rate and discount redemption rate on **separate charts**—combined KPIs hide broken attribution when coupons still look healthy.

---

## Gate 3: Customer account pages use a different path

Even when storefront tracking works, merchants opening **new customer accounts** may see empty referral history or broken share links.

The online store theme and **Customer Account UI** do not run in the same security context. **App Proxy** URLs that work for theme JavaScript (`/apps/your-app/...` on the shop domain) are often **wrong for account extensions**, which run on Shopify's hosted customer account host and must call your app origin directly.

**Symptom pattern:**

1. Extension deploy succeeds; merchant adds menu link.
2. Account page loads shell UI.
3. Lists are empty with no visible error.
4. Same customer ID returns correct JSON when you test the app server directly.

That last step usually means logic is fine and **URL strategy** is wrong—not that Vouch "lost" the data.

For readers who need the full split-API architecture, see [customer account monolith anti-pattern](/posts/customer-account-monolith-anti-pattern-shopify-extensions). For merchant support, the actionable line is simpler: **verify referral UI on account pages with a real logged-in customer**, not only on the homepage.

---

## Cart attributes are the checkout handoff

Shopify checkout does not automatically read cookies your app set in the theme. The durable bridge is **`/cart/update.js` cart attributes**, surfaced as `note_attributes` on the order.

Without that attribute at checkout time, server webhooks see a paid order with no referral field—even if the friend clicked a valid link on day one.

**Five-step incognito test** (run before every major campaign):

1. Land with a test `?ref=` param in an incognito window.
2. Confirm cookie or session flag in browser DevTools.
3. Add to cart and inspect cart JSON for your attribute key.
4. Complete test checkout and confirm the attribute on the order **Additional details**.
5. Confirm the webhook handler reads the **same key name** the storefront writes.

Name drift between Liquid, JavaScript, and server code is a common silent failure.

---

## What you can do this afternoon

1. **Audit embed scope** — global head embed on, not block-only on homepage.
2. **Separate codes in docs** — referral key vs friend discount vs optional coupon; update campaign briefs.
3. **Run the five-step test** on storefront and on customer account referral pages.
4. **Split dashboards** — referral credit vs discount redemption; do not merge into one "campaign success" number.
5. **Train support on three stories:** friend applied coupon without clicking link; cookie expired before return visit; one string used as both discount and referral key.

Attribution is a pipeline. **Install is step zero.**

**Sources**

1. Shopify, "Configure theme app extensions." https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration
2. Shopify, "Cart API reference." https://shopify.dev/docs/api/ajax/reference/cart
3. Shopify, "Discount codes." https://help.shopify.com/en/manual/discounts/discount-codes
