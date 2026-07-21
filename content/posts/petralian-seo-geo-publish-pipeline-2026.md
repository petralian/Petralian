---
title: How I Built an SEO and GEO Publish Pipeline (Without an Agency)
slug: petralian-seo-geo-publish-pipeline-2026
date: 2026-07-14T00:00:00.000Z
tags:
  - SEO
  - GEO
  - Developer Tools
  - AI Memory
excerpt: >-
  Publishing is not the hard part — being findable is. I wired preflight checks,
  llms.txt, IndexNow, and auto-fix scripts into one vault-to-Vercel chain so
  Google and AI crawlers see what I meant to ship.
featured_image: /images/posts/petralian-seo-geo-publish-pipeline-2026.png
featured_image_alt: "Flow from Obsidian vault folders through sync scripts to a live"
focus_keyword: SEO GEO publish pipeline
seo_title: How I Built an SEO and GEO Publish Pipeline (Without an…
seo_description: >-
  How I automated preflight, llms.txt, IndexNow, and meta fixes on petralian.com
  — a vault-to-Vercel pipeline anyone can adapt for search and AI discovery.
related_posts:
  - publishing-obsidian-drafts-through-github-actions
  - getting-to-lighthouse-100-on-nextjs-16
  - is-cursor-only-for-developers
image_prompt: >-
  Cinematic 16:9 photograph of a wooden desk at dusk: open laptop shows a
  sitemap tree, beside it a printed llms.txt page and a vault notebook labeled
  only "Drafts", warm desk lamp and cool window light, shallow depth of field,
  no logos, no readable text.
image_prompt_variant_1: >-
  Surreal 16:9 diorama: tiny crawler figures on ladders read floating scrolls
  marked only as sitemap and llms, a pipeline of file folders flows into a
  glowing cloud, twilight haze, no readable words, no logos.
image_prompt_variant_2: >-
  Bold isometric 16:9 poster: four panels Vault → Sync → Vercel → Crawlers as
  pictogram steps with checkmark gates, risograph texture, teal and amber
  palette, no logos, no readable text.
format: hybrid
best_for: >-
  Anyone publishing a personal or company site who wants search and AI discovery
  without an agency retainer
---

You publish an article, push to production, and assume Google — and the AI systems people actually ask — will eventually notice. They often do not, or they index the wrong URL from an old WordPress install, or they summarize you from a chat tab that never saw your canonical page.

That gap is not a writing problem. It is a **habits and files** problem: what runs before commit, what you expose to crawlers, and what you leave for manual judgment.

## Who this is for

**Anyone** with a site worth finding — a founder shipping a company blog, a student documenting a project, a CEO publishing thought leadership, an operator running a Shopify app changelog. You do not need a Semrush retainer to get the basics right.

I run this on **petralian.com** (Next.js on Vercel, drafts in Obsidian). The same pattern applies if your stack is Hugo, Astro, or a static folder — the principle is **automate the boring checks, keep judgment for the words**.

## The principle

Search engines and AI crawlers read **artifacts**, not intentions:

- `sitemap.xml` and `robots.txt` — what you allow and where pages live
- `llms.txt` — what AI systems are invited to cite (GEO / AIO discovery)
- Per-page `seo_title`, `seo_description`, canonical URLs, JSON-LD
- Hero `alt` text and absolute image URLs in structured data

If those files are wrong or missing, no amount of good prose fixes discoverability. So I treat publish like a small CI pipeline: **preflight → sync → compress → auto-fix → regenerate discovery files → ping indexes → push**.

```d2
direction: right

vault: "Obsidian\n02 Ready / 03 Published" {
  style.fill: "#e8f4fc"
}

sync: "sync-obsidian.ps1\npreflight + images" {
  style.fill: "#fff3cd"
}

repo: "content/posts\npublic/llms.txt" {
  style.fill: "#d4edda"
}

vercel: "Vercel build\nsitemap · robots · feed" {
  style.fill: "#cce5ff"
}

crawlers: "Google · Bing ·\nGPTBot · Perplexity" {
  style.fill: "#f8d7da"
}

vault -> sync -> repo -> vercel -> crawlers
```

## Example — how I run it

One PowerShell entry point after articles sit in `Blog/02 Ready to publish/`:

```powershell
.\scripts\sync-obsidian.ps1 -Preflight   # check only
.\scripts\sync-obsidian.ps1            # publish
```

The chain does the following in order:

1. **Preflight** — required `format`, `best_for`, hero file exists; warns on short `seo_title` or missing alt text
2. **Sync** — vault markdown → `content/posts/`, images → `public/images/posts/`, strips deprecated `category`
3. **Image compression** — `optimize-images.mjs` (non-fatal if Windows locks a file)
4. **SEO auto-fix** — `autofix-seo-meta.mjs` fills missing `seo_description`, `focus_keyword`, `featured_image_alt` without rewriting good copy
5. **GEO refresh** — `generate-llms-txt.mjs` rebuilds `public/llms.txt` with per-post descriptions
6. **Indexing pass** — `request-indexing.mjs` pings **IndexNow** (Bing/Yandex) and prints **Google Search Console** URL Inspection links
7. **Git push** — Vercel deploys; dynamic `sitemap.xml` and `robots.txt` update automatically

A GitHub Actions workflow (`publish-from-vault.mjs`) mirrors the same steps for cloud publish — parity matters so laptop and CI do not disagree.

**What I still do manually:** Google Search Console URL Inspection (~10–20 requests per day). Google does not offer a simple API key for “request indexing” the way IndexNow works for Bing. I click the links the script prints after each batch.

## What changed in one afternoon (2026-07-14)

I shipped a nine-article batch and hardened the pipeline in the same week:

| Layer | Automation |
|-------|------------|
| Meta debt | Auto-fix ran on 75 posts — missing alt text, titles, descriptions |
| GEO | `llms.txt` lists every post with a one-line `seo_description` |
| Schema | `BlogPosting` uses absolute hero URLs; `FAQPage` when an article has `## FAQ` |
| RSS | Hero `<enclosure>` on feed items |
| Audits | `npm run audit:pre-publish`, `audit:site`, `audit:lighthouse` |

SEO issues on live posts dropped from **72 → 21** after auto-fix; the remainder need human rewrites (titles too short for legacy pillars), not script patches.

## Path A — try the idea in any browser (no IDE)

1. Add a plain-text **`/llms.txt`** (or use the [llms.txt convention](https://llmstxt.org/)) listing your site sections and article URLs with one-line summaries.
2. Open [Google Search Console URL Inspection](https://search.google.com/search-console/inspect) for your domain and request indexing on your three most important URLs.
3. Register an [IndexNow](https://www.indexnow.org/) key file at `https://yoursite.com/{key}.txt` and POST new URLs after each publish.
4. Run one **lint pass** on titles (55–60 characters) and meta descriptions (150–160) before you hit publish.

That alone puts you ahead of most personal sites that only run `git push` and hope.

## Program depth — when the topic earns it

**Domain property in GSC:** I use `petralian.com` (domain), not separate www/https properties — one sitemap, one canonical host.

**CRM subdomain:** Toxic backlink audits hit `crm.petralian.com`; that host gets `robots.txt` disallow plus nginx `X-Robots-Tag: noindex` (server change still pending). Main-site SEO and app-host SEO are different problems — block the app from the index on purpose.

**Disavow:** I keep a break-glass disavow file but do not upload unless GSC shows a manual action — Links report noise is not the same as a penalty.

Full runbook: vault note [[Operations/SEO Publish Pipeline]] and repo `docs/seo/gsc-week1-actions.md`.

## What I would add next

- GSC Indexing API with a service account (optional; manual clicks work at my volume)
- WebP conversion for oversized PNG heroes (documented in `docs/seo/images-perf-2026-07-13.md`)
- Pre-commit hook calling `audit:pre-publish` on changed slugs only

## Bottom line

Publishing is a **pipeline**, not a single button. Automate what is mechanical — meta gaps, discovery files, IndexNow, link checks — and spend your judgment on openings that work for anyone reading screen one, not on remembering whether tonight's deploy included `llms.txt`.

If you run a similar stack, start with Path A this afternoon. If you run Obsidian + Next.js, steal the script chain — it is the same "files, habits, judgment" pattern I use for agent memory, applied to being found on the open web.
