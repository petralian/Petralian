# Changelog

All notable changes to petralian.com are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2.0.0] — 2026-05-22

### Changed
- Full site rewrite: WordPress + Divi → Next.js 15 (App Router, Turbopack)
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
