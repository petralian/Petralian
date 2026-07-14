---
name: publish-petralian
description: >-
  Publish Petralian blog posts from Obsidian vault to live site. Use when user
  asks to publish, sync posts, or promote drafts from 02 Ready to content/posts.
  Frontmatter and SEO rules: Writing Session Guide (SSOT) — not this file.
---

# Publish Petralian

## Single source of truth

`D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\00 Writing Session Guide.md` — frontmatter, hero prompts, handoff checklist.

## Pipeline

1. Drafts in `Blog/01 Drafts/` only during writing
2. Handoff to `Blog/02 Ready/` or live edits in `03 Published/`
3. Sync: `scripts/sync-obsidian.ps1` (vault → `content/posts/`)
4. SEO chain: optimize → autofix → post-publish-seo → request-indexing
5. Build: `npx next build` when Tina port 9000 free
6. Commit + push only when user explicitly requests

**Runbook:** vault `Operations/SEO Publish Pipeline.md`

## Safety

- Never write new drafts to `content/posts/` during a writing session
- **Folder = publish gate** — only `02 Ready` / `03 Published` sync; no `status` field
- `date` = editorial publish date; do not overwrite on re-sync

## Footer

Publishing = **Mode D** (deploy Vercel + git commit).
