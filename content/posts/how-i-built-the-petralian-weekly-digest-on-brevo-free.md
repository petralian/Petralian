---
title: How I Built the Petralian Weekly Digest on Brevo Free
slug: how-i-built-the-petralian-weekly-digest-on-brevo-free
date: 2026-05-24
status: published
category: AI & Building
tags:
- Developer Tools
excerpt: I wanted a clean weekly digest for petralian.com without paying for RSS automations.
  This is the exact architecture we implemented, the issues we hit, and the code patterns
  that made it reliable.
featured_image: /images/posts/how-i-built-the-petralian-weekly-digest-on-brevo-free.png
focus_keyword: petralian weekly digest brevo free
seo_description: A practical build log for implementing a weekly digest on Brevo free
  tier with Next.js and Vercel cron, including double opt-in, confirm unsubscribe,
  privacy safeguards, and fork-ready code.
image_prompt: 'Create a 16:9 hero image for a technical build-log article. Show a
  laptop with a minimal dashboard representing petralian.com newsletter flow: subscribe,
  confirm, weekly send, unsubscribe. Use subtle node-link diagrams, one red warning
  icon replaced by green checks, dark modern UI aesthetic, no brand logos, no text
  overlays, no watermarks.'
---

> **External Memory Series** — File-based memory for AI-assisted work ([overview](/posts/external-memory-series-guide) · [1 Implementation](/posts/three-layer-external-brain-for-ai-first-development) · [2 Productivity](/posts/obsidian-memory-layers-personal-productivity-beyond-chat) · [3 vs the diagram](/posts/why-file-memory-beats-the-three-layer-diagram-for-builders) · [4 Governance](/posts/why-deliberate-file-memory-beats-hoping-agents-remember))
I was not trying to build a newsletter startup. I was trying to solve a very specific operational problem on petralian.com.

The site had a working subscribe box. Contacts were getting into a list. What was missing was a reliable weekly digest workflow that respected privacy and did not force an expensive plan jump just to unlock one automation feature.

That was the issue: close the gap between "subscribe works" and "the full system is dependable in production."

---

## The Problem I Needed to Solve

The publishing side of petralian.com was already in good shape. The site architecture is documented in [/posts/why-i-rebuilt-petralian-on-nextjs](/posts/why-i-rebuilt-petralian-on-nextjs): file-based posts, Next.js, Vercel deployment, and an Obsidian-first writing workflow.

The newsletter side was the weak point.

I needed four things to work together:

1. A clean subscribe experience on-site
2. A weekly digest send that runs automatically
3. A compliant unsubscribe path
4. Reasonable privacy controls, including consent and confirmation

The system looked close. In practice, it was not production-reliable yet.

---

## The Options I Evaluated with AI

Before writing more code, I asked AI to pressure-test platform choices and free-tier constraints. The short list included Kit, Buttondown, beehiiv, MailerLite, Mailchimp, and Brevo.

The pattern was consistent: free tiers exist, but the exact automation needed for digest workflows is often restricted, branded, or moved into paid plans.

Kit, for example, was workable for list management, but RSS automation and integration controls on the active plan were not where I needed them. Beehiiv exposed a similar tradeoff in plan tiers. Buttondown was elegant but RSS support and certain capabilities are add-on dependent.

Brevo ended up being the best practical fit for this project for one reason: even when automation features are constrained, the API surface is strong enough to let the application own orchestration.

That became the strategy.

---

## The Issues I Hit While Implementing

### 1. Feature-gating friction

The first blocker was not code. It was product packaging. Native platform automation did not cleanly map to the plan constraints.

### 2. Production authorization failures

The local API key call worked. Production calls returned 401. That looked like a code bug until logs made it clear the request was reaching Brevo and failing on authorization context. Rotating keys and fixing provider-side restrictions resolved that.

### 3. Weak observability in first pass

The early subscribe flow returned a generic failure message. That is fine for UX and terrible for debugging. I added provider-aware error logging, response details, and reference IDs so live failures could be traced quickly.

### 4. Architecture mismatch for compliance

Immediate list insertion is convenient, but it is weak for consent quality. I moved to confirm-first subscription and confirm-before-unsubscribe action, which is better aligned with privacy expectations.

---

## The Final Architecture I Implemented

The working model is simple:

- Brevo is the delivery and contact layer
- Next.js API routes own workflow logic
- Vercel cron triggers weekly digest send
- Signed links secure confirmation and unsubscribe actions

Here are the key routes.

### Subscribe init route

`src/app/api/subscribe/route.ts`

- Validates email/name
- Applies rate limiting
- Sends confirmation email for Brevo path
- Does not add contact to list until confirmation

```ts
const provider = (process.env.NEWSLETTER_PROVIDER || "brevo").toLowerCase();

if (provider === "brevo") {
  await sendBrevoConfirmationEmail(name, email);
}
```

### Subscribe confirm route

`src/app/api/subscribe/confirm/route.ts`

- Validates signed token + timestamp window
- Inserts confirmed contact into Brevo list

```ts
const expected = signSubscribeToken(email, name, ts);
if (token !== expected) {
  return htmlPage("This confirmation link is invalid or has expired.");
}
await subscribeWithBrevo(name, email);
```

### Weekly digest route

`src/app/api/newsletter/weekly/route.ts`

- Auth-protected by secret
- Reads recent posts
- Reads Brevo contacts
- Sends digest emails via Brevo SMTP API
- Adds List-Unsubscribe header and per-recipient unsubscribe link

```ts
const posts = getDigestPosts();
const contacts = await getBrevoContacts(apiKey, listId);
for (const recipient of recipients) {
  await sendBrevoDigest(apiKey, recipient, posts);
}
```

### Unsubscribe route

`src/app/api/unsubscribe/route.ts`

- First request shows confirmation page
- Confirm action blacklists contact in Brevo

```ts
if (token !== expected) {
  return htmlPage("This unsubscribe link is invalid or has expired.");
}
const ok = await applyBrevoUnsubscribe(email);
```

### Scheduler

`vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/newsletter/weekly",
      "schedule": "0 1 * * 1"
    }
  ]
}
```

That runs weekly on Monday UTC. Manual trigger remains available for testing with `CRON_SECRET`.

---

## Brevo Limitations and How I Worked Around Them

The important limitation was not that Brevo cannot send. It can. The limitation was that certain native automation pathways are plan-sensitive and can introduce avoidable dependency on UI-level features.

The workaround was to move orchestration into code and keep Brevo focused on what it does best in this setup: contact storage and outbound delivery.

That gave three benefits.

First, plan changes no longer break workflow logic. The logic lives in routes.

Second, debugging became operationally clean. Each step has a bounded API endpoint and logs.

Third, privacy controls became explicit. Confirmation tokens, confirm-before-unsubscribe action, and blacklist updates are all visible in code and testable.

This is the part that matters: privacy is not a paragraph in a settings screen. Privacy is behavior in routes.

---

## Best Practices That Made This Stable

If someone wants to fork this pattern, these are the practices worth keeping:

- Use signed, time-bound tokens for confirmation links
- Keep provider keys server-side only
- Add rate limiting on public subscribe endpoint
- Return operator-useful diagnostics in logs
- Add `List-Unsubscribe` header in outbound sends
- Treat unsubscribe as a route, not just an ESP checkbox
- Keep scheduler trigger separate from provider UI automation assumptions

Also rotate secrets whenever keys appear in logs, screenshots, or terminal history.

---

## What This Means for Forking

This setup is intentionally easy to fork because it is file-based and route-based.

A fork only needs:

- New sender identity in Brevo
- New API key and list ID
- New secrets (`CRON_SECRET`, `UNSUBSCRIBE_SECRET`, `SUBSCRIBE_CONFIRM_SECRET`)
- Domain and branding updates

The application logic does not need a rewrite. The provider adapter and environment variables do most of the work.

This is the same design principle as the broader site architecture: keep complexity at the edges and keep core workflow deterministic.

---

## My Read

The core mistake in newsletter discussions is treating delivery as a platform toggle. Delivery is a system.

For petralian.com, the right choice was not "find the perfect dashboard." The right choice was to own the workflow in code, use Brevo as a dependable transport layer, and enforce consent and unsubscribe behavior as first-class application logic.

That made the setup simpler, not more complex.

The result is exactly what I needed: a weekly digest pipeline that is cheap to run, explicit to debug, privacy-aware by design, and straightforward to fork.