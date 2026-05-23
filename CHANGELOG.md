# Changelog

All notable changes to petralian.com are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `public/images/nathan-petralia.jpg` — Nathan's homepage profile photo (migrated from dead WP URL)
- `public/images/nathan-petralia-about.jpg` — Nathan's about page profile photo (migrated from dead WP URL)
- `src/app/icon.png` — favicon from `public/images/posts/petralian_ico.png`
- SEO metadata (`seo_title`, `seo_description`, `featured_image_alt`, `focus_keyword`) added to all 37 published posts
- `image_prompt` frontmatter field documented in Writing Session Guide (Obsidian-only, stripped by sync script)

### Changed
- Masonry grid: replaced CSS `column-count` with flex split-column layout for correct left-to-right reading order on home page and blog index
- Blog filters: `reorderForMasonry` replaced with `splitIntoColumns` — responsive column arrays via `matchMedia`
- Next.js version references updated from 15 → 16 across all docs and published content
- All prose and UI copy standardized to American English spelling
- TinaCMS `tina/config.ts`: renamed `meta_description` field → `seo_description` to match what `src/lib/posts.ts` reads
- `src/lib/posts.ts`: `PostMeta` interface now exposes `seo_title` and `featured_image_alt`
- `src/app/posts/[slug]/page.tsx`: `generateMetadata` uses `seo_title` for `<title>` tag; featured image uses `featured_image_alt`
- Brand logos moved from `public/images/posts/` → `public/images/` (petralian_blue.png, petralian_white.png, petralian_ico.png)
- Next.js placeholder SVGs removed from `public/` root

### Fixed
- `src/app/page.tsx`, `src/app/about/page.tsx`: replaced dead WordPress image URLs (`403 Forbidden`) with local assets — eliminates browser console errors and PageSpeed Best Practices penalty
- `src/components/Header.tsx`: removed `priority` from dark logo (white logo) — eliminates "preloaded but unused resource" browser warning; added `sizes="247px"` to both logos to prevent oversized srcset generation
- `next.config.ts`: removed stale WordPress `remotePattern` for `petralian.com/wp-content/uploads/**` (migration complete)
- British → American English spelling corrected across 6 content files and `src/app/posts/[slug]/page.tsx`
- `meta_description` field renamed to `seo_description` in 3 posts (getting-enterprise-ai-right, what-i-learned-directing-ai, what-the-next-generation-of-delivery-leadership)

## [2.0.0] — 2026-05-22

### Changed
- Full site rewrite: WordPress + Divi → Next.js 16 (App Router, Turbopack)
- Styling: Tailwind CSS v4 (CSS-first, no config file)
- Theme system: system / light / dark switcher with no flash on load
  - Light theme inspired by Outline (clean white, blue accent `#3b82f6`)
  - Dark theme inspired by Obsidian (warm `#1e1e1e`, violet accent `#7c6aff`)
- Font: SF Pro Text / Inter, base size 15px (slightly smaller, cleaner)
- Content: Markdown files with gray-matter frontmatter (no database)
- Publish workflow: Obsidian → `scripts/sync-obsidian.ps1` → Vercel
- Deploy: Vercel (root directory: repo root), auto-deploy on push to `master`
- Repo: clean open-source release — single commit, zero WordPress history

### Added
- `scripts/sync-obsidian.ps1` — Obsidian to site publish script
- `ThemeToggle` component — system/light/dark switcher in header
- Anti-FOUC theme script in `<head>` (reads `localStorage` before first paint)

### Removed
- WordPress, Divi, Docker, all PHP — replaced entirely
- All hardcoded `https://petralian.com/` internal navigation links
  converted to relative paths (`/posts/slug`, `/about`)

---

*Previous WordPress changelog (v1.x) archived locally — not included here.*
