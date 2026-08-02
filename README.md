# Petralian.com

Source for [petralian.com](https://petralian.com) — Nathan Petralia's personal writing site on enterprise AI, digital transformation, and delivery leadership.

## Stack

| | |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) — App Router, Turbopack |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) — CSS-first, no config file |
| **Content** | Markdown files with gray-matter frontmatter |
| **Syntax highlighting** | [Shiki](https://shiki.style) via rehype-pretty-code |
| **Deploy** | VPS (aaPanel + PM2) — GitHub Actions `Deploy to VPS` on push to `master` |

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
4. GitHub Actions deploys to VPS in ~2–3 minutes (`scripts/deploy-on-vps.sh`)

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

The site deploys on every push to `master` via **GitHub Actions** → SSH → `scripts/deploy-on-vps.sh` on the VPS.

| Setting | Value |
|---|---|
| **App directory** | `/www/wwwroot/petralian` (`data/deploy.yaml`) |
| **Process manager** | PM2 (`ecosystem.config.cjs`) |
| **Build command** | `npm run build:vps` |
| **Production URL** | https://petralian.com |

### GitHub secrets (required)

Set in repo **Settings → Secrets → Actions**:

- `VPS_HOST` — server IP or hostname
- `VPS_USER` — SSH user
- `VPS_SSH_KEY` — private key (PEM)

See `docs/deploy/aapanel.md` for first-time VPS setup and manual deploy: `bash scripts/deploy-on-vps.sh`.

## License

MIT — code only. Article content © Nathan Petralia, all rights reserved.
