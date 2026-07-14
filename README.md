# Petralian.com

Source for [petralian.com](https://petralian.com) — Nathan Petralia's personal writing site on enterprise AI, digital transformation, and delivery leadership.

## Stack

| | |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) — App Router, Turbopack |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) — CSS-first, no config file |
| **Content** | Markdown files with gray-matter frontmatter |
| **Syntax highlighting** | [Shiki](https://shiki.style) via rehype-pretty-code |
| **Deploy** | [Vercel](https://vercel.com) — root directory: repo root |

## Development

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

To build and check for errors before pushing:

```bash
npm run build
```

## Publishing workflow

Articles are written in [Obsidian](https://obsidian.md) and published via a sync script:

1. Write in Obsidian (`01 Drafts/`)
2. Move to `02 Ready to publish/` when the article is done
3. Run `.\scripts\sync-obsidian.ps1` — copies from `02 Ready to publish/` and `03 Published/` into `content/posts/`, commits, and pushes to GitHub
4. Vercel auto-deploys in ~30 seconds

Preview without writing: `.\scripts\sync-obsidian.ps1 -DryRun`

## Content

Articles live in `content/posts/` as Markdown files. Each needs frontmatter:

```yaml
---
title: "Article title"
slug: article-slug
date: "2026-01-15"
tags: ["AI", "transformation", "strategy"]
excerpt: "Short summary shown on article cards."
featured_image: "/images/posts/my-hero-image.jpg"
seo_title: "55-60 char SEO title (optional override of title)"
seo_description: "150-160 char meta description for search engines."
featured_image_alt: "Descriptive alt text for the hero image."
focus_keyword: "enterprise AI strategy"
---
```

Only files in `content/posts/` appear on the site. The vault folder (`02 Ready to publish/` / `03 Published/`) controls what sync copies in.

**SEO fields:** `seo_title` overrides the page `<title>` tag; `seo_description` populates the meta description and OG description; `featured_image_alt` sets the hero image alt text. If `seo_title` is absent, the article `title` is used.

**Categories in use:** deprecated — use `tags` only.

## Project structure

```
src/app/            ← Pages (App Router)
src/components/     ← Shared components
src/lib/            ← Utilities and constants
content/posts/      ← Markdown articles
public/             ← Static assets
scripts/
└── sync-obsidian.ps1  ← Obsidian → site publish workflow
wp-content/         ← Legacy WordPress theme/plugins
```

## Deploy

The site deploys automatically on every push to `master` via **Vercel**.

| Setting | Value |
|---|---|
| **Root directory** | repo root |
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
