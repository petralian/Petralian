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
4. **Preflight** — frontmatter, hero, SEO lengths, body placeholders

### Exit codes (agent interprets)

| Code | Meaning | Agent action |
|------|---------|--------------|
| **0** | All PASS | Offer to publish now (`--publish`) |
| **1** | FAIL (errors) | Fix blockers, re-run check — do not publish |
| **2** | WARN only | Show warnings; publish only if user confirms (`--publish --confirm`) |

## After sync (when user wants live site)

Only when user explicitly asks to ship:

1. `npm run audit:pre-publish -- <slug>`
2. `npx next build` (Tina port 9000 must be free)
3. Commit + push — **only when user requests**

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

## Footer

Publishing to git/deploy = **Mode D**.
