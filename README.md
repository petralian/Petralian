# Petralian.com

Source for [petralian.com](https://petralian.com) — Nathan Petralia's personal writing site on enterprise AI, digital transformation, and delivery leadership.

## Stack

| | |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) — App Router, Turbopack |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) — CSS-first, no config file |
| **Content** | Markdown files with gray-matter frontmatter |
| **Syntax highlighting** | [Shiki](https://shiki.style) via rehype-pretty-code |
| **Deploy** | [Vercel](https://vercel.com) — root directory: `site/` |

## Development

```bash
cd site
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

To build and check for errors before pushing:

```bash
cd site
npm run build
```

## Publishing workflow

Articles are written in [Obsidian](https://obsidian.md) and published via a sync script:

1. Write in Obsidian (`01 Drafts/`)
2. Move to `02 Ready to publish/` when the article is done
3. Run `.\scripts\sync-obsidian.ps1` — copies to `site/content/posts/`, sets `status: published`, commits, and pushes to GitHub
4. Vercel auto-deploys in ~30 seconds

Preview without writing: `.\scripts\sync-obsidian.ps1 -DryRun`

## Content

Articles live in `site/content/posts/` as Markdown files. Each needs frontmatter:

```yaml
---
title: "Article title"
slug: article-slug
date: "2026-01-15"
status: published
category: "Enterprise AI"
tags: [AI, transformation, strategy]
excerpt: "Short summary shown on article cards."
seo_description: "Longer meta description for search engines."
focus_keyword: "enterprise AI strategy"
---
```

Only articles with `status: published` appear on the site.

## Project structure

```
site/               ← Next.js project (Vercel root)
├── src/app/        ← Pages (App Router)
├── src/components/ ← Shared components
├── src/lib/        ← Utilities and constants
├── content/posts/  ← Markdown articles
└── public/         ← Static assets

scripts/
└── sync-obsidian.ps1  ← Obsidian → site publish workflow
```

## Deploy

The site deploys automatically on every push to `master` via **Vercel**.

| Setting | Value |
|---|---|
| **Root directory** | `site/` |
| **Framework preset** | Next.js (auto-detected) |
| **Build command** | `npm run build` |
| **Production URL** | https://petralian.com |

### First-time setup

1. [vercel.com/new](https://vercel.com/new) → Import `petralian/Petralian`
2. Set **Root Directory** → `site`
3. Deploy — framework auto-detected
4. Add custom domain `petralian.com` in Project → Settings → Domains
5. Point DNS at your registrar to Vercel's nameservers

### Always verify before pushing

```bash
cd site && npm run build   # must exit 0
```

## License

MIT — code only. Article content © Nathan Petralia, all rights reserved.
