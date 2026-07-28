---
name: publish-petralian
description: >-
  Publish Petralian blog posts from Obsidian vault. Use when user says publish ready,
  check ready posts, preflight articles, sync 02 Ready, or promote drafts to live site.
  User should NOT run npm commands manually — the agent runs publish:ready for them.
---

# Publish Petralian

## What the user says (only these)

| User says | Agent does |
|-----------|------------|
| **"publish ready"** / **"check ready"** / **"preflight"** | Run `npm run publish:ready` — auto-fix images + validate |
| **"publish ready now"** / **"publish with confirm"** | If last check was clean → `npm run publish:ready -- --publish`; if warnings → add `--confirm` |
| **"publish"** (ambiguous) | Run check first, report, ask only if warnings |

**Never** ask the user to run `ingest:images`, `resolve:pexels`, or multi-step npm chains. One command handles it.

## Single command (agent runs this)

```bash
npm run publish:ready
npm run publish:ready -- --publish
npm run publish:ready -- --publish --confirm   # when warnings acknowledged
npm run publish:ready -- --slug my-article-slug  # one Ready post only
```

### What `publish:ready` does automatically

1. **Ingest images** — pasted screenshots renamed; Pexels/Unsplash URLs downloaded + credited
2. **Normalize** — vault filenames, captions, Attachments paths
3. **Pexels credits** — photographer from API/cache (never from download filename)
4. **Slug bundle** — filename, hero, attachments integrity
5. **Hero diversity** — vault `image_prompt` lane caps (blocks monotone isometric batches)
6. **Preflight** — `02 Ready` + `03 Published`: format, best_for, body word count (≥50 blocking)

### After `--publish` (sync-obsidian.ps1 — automatic, user never runs manually)

1. **Vault → content/posts** with safe frontmatter strip (`gray-matter`, not regex)
2. **SEO auto-fix** + `llms.txt`
3. **Post-publish gates** (`run-post-publish-gates.mjs`):
   - `audit-sync-integrity` — live body ≥85% of vault; format present
   - `audit-hero-diversity` — per-slug vault prompts
   - `audit-live-posts` — full `content/posts/` integrity
4. **Git commit + push** — blocked if any gate fails

### Exit codes (agent interprets)

| Code | Meaning | Agent action |
|------|---------|--------------|
| **0** | All PASS | Offer to publish now (`--publish`) |
| **1** | FAIL (errors) | Fix blockers, re-run check — do not publish |
| **2** | WARN only | Show warnings; publish only if user confirms (`--publish --confirm`) |

## After sync (when user wants live site)

Agent runs the full loop — user does **not** run audit commands manually:

1. `npm run publish:ready -- --publish` (or `sync-obsidian.ps1` for direct sync)
2. Gates above must pass (sync integrity + live posts + hero diversity)
3. `npx next build` when code changed (Tina port 9000 must be free)
4. Commit + push when user requests ship

**Runbook:** vault `Operations/SEO Publish Pipeline.md`  
**Writing rules:** `Blog/00 Writing Session Guide.md`

## User workflow in Obsidian (no commands)

1. Write in `01 Drafts` → move to `02 Ready to publish`
2. Paste screenshots or stock URLs directly in the note (messy is OK)
3. Tell agent: **"publish ready"**

## Env keys (repo `.env`)

| Key | Required for |
|-----|----------------|
| `PEXELS_API_KEY` | Pexels stock download + credit |
| `UNSPLASH_ACCESS_KEY` | Unsplash stock download + credit |
| `UNSPLASH_APP_ID` / `UNSPLASH_SECRET_KEY` | **Not needed** — OAuth only; Access Key is enough |

## Safety

- Never write new drafts to `content/posts/` during writing sessions
- **Folder = publish gate** — only `02 Ready` / `03 Published` sync
- Missing body images are **stripped** on sync (no broken live images)
- Missing **hero** blocks publish (error)

## Slug / title change protocol (mandatory for agents)

When the user changes **title**, **slug**, tool names in the title (e.g. ChatGPT → Poe), or version strings that affect the URL:

**Do not stop at frontmatter.** Run the full **slug bundle** in one batch:

| Step | Action |
|------|--------|
| 1 | Set `slug`, `title`, `seo_title`, `focus_keyword`, `featured_image` together |
| 2 | **Rename** vault `{slug}.md` (filename stem = slug) |
| 3 | **Rename** hero PNG → `{slug}.png` |
| 4 | **Rename** every `body_images[].filename` + matching files in `Attachments/` |
| 5 | **Fix** wiki embeds `![[…]]` in the body to new filenames |
| 6 | Grep vault `Blog/` for old slug in `related_posts` and `/posts/` links |
| 7 | Grep repo `scripts/`, `data/`, `content/posts/` for old slug |
| 8 | Run `npm run audit:slug-bundle -- --slug <slug> --old-slug <old>` |
| 9 | Tell user to **Reload Obsidian** (`Ctrl+R`) after file renames |

`publish:ready` runs slug-bundle audit automatically — **FAIL blocks publish** if filename ≠ slug, hero ≠ slug, or embeds use stale names.

**User should not run these steps.** Agent executes rename + audit before reporting done.

## Image files (mandatory — do not violate)

- **SEO filenames required** before publish: `{slug}.png` (hero), `{slug}-body-{NN}-{descriptor}.{ext}` — no `Snipaste_*`, `Pasted image *`, `image4.gif`, or spaces.
- **Rename in place** in `Attachments/` + update `body_images`, wiki embeds, and captions in the **same batch** (slug bundle). One article at a time.
- **Never** run batch ingest across Ready posts or swap files between articles.
- Allowed without rename: fix **captions**, `alt`, SEO fields.
- Preflight **FAIL** if any embedded image uses a non-SEO filename (`audit-slug-bundle.mjs`).

## Preflight report format

Always list **Blockers** and **Warnings** as numbered lists with **article slug** on each line.

## Footer

Publishing to git/deploy = **Mode D**.
