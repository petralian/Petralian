# Copilot Instructions

> Auto-loaded into every chat session. Two parts:
> **Part A** is project-specific (Petralian).
> **Part B** is a reusable, project-agnostic engineering ruleset — copied verbatim from Gravio.

---

# PART A — Petralian (this project)

## Session Continuity Bootstrap (Mandatory)

At the start of every non-trivial session, read universal rules **before** project vault notes:

1. **Brain first** — read via the `obsidian-brain` MCP server:
   - `00_Brain/AI Agent Methodology.md` — note taxonomy, session loop, anti-patterns
   - `00_Brain/Conventions/Deploy Playbook.md` — session-end footer template
   - **Path safety (mandatory):** for `mcp_obsidian-brai_*` reads, always pass absolute paths rooted at `C:\Obsidian\obsidian\00_Brain\...`
   - Never pass relative `00_Brain/...` paths to `mcp_obsidian-brai_*`.
2. Then follow the Session Memory Loop below.

If the `obsidian-brain` server isn't responding: Command Palette → **MCP: Reset Cached Tools**.

### Manual Prompt Integration (Mandatory)

The following Brain manual prompts are part of the default operating model:

- `00_Brain/Manual Prompts/Start of Session.md`
- `00_Brain/Manual Prompts/End of Session.md`
- `00_Brain/Manual Prompts/Start of New Project.md`

---

## TOP RULE: Session Memory Loop (Obsidian)

Every chat session **must** follow this loop — no exceptions:

1. **Session start:** Call `mcp_petralian-obsidi_obsidian_write` to create/overwrite a session note at `Operations/Sessions/YYYY-MM-DD <Topic>.md`. The note must contain:
   - Session goals as checkboxes
   - Current state: uncommitted files, blockers
   - Active phase roadmap with ✅ / ⚠️ / 🔲 status markers
   - Manual steps the user must perform
   - Obsidian pre-scan results
   - WikiLinks to touched Feature/Design notes

2. **During session:** Mark completed items ✅. Add todos, blockers immediately. Update Feature notes.

3. **After every git commit:** Add commit hash to relevant Feature note's `## Commits` section.

4. **Session end:** Finalize session note, all touched Feature notes, append one-line summary to `Operations/Session Summaries.md`.

**Vault path for session notes:** `Operations/Sessions/`
**Vault path for feature notes:** `Features/`
**Vault path for architecture notes:** `Architecture/`
**Vault path for design notes:** `Design/`

---

## Project Identity

- **Site:** petralian.com — personal website + writing on enterprise AI and transformation
- **Stack:** Next.js 15 · TypeScript · Tailwind CSS v4 · Markdown · Vercel
- **Repo:** `D:\VS Code Projects\Petralian`
- **Local URL:** http://localhost:3000
- **Live URL:** https://petralian.com (Vercel, auto-deploy from `master`)
- **Obsidian vault:** `C:\Obsidian\obsidian\40_VSCode\Petralian\`
- **MCP server:** `petralian-obsidian` (custom) + `obsidian-brain` (built-in filesystem)

## Key Paths

| Concern | Path |
|---|---|
| Next.js site | `site/` |
| Pages | `site/src/app/` |
| Components | `site/src/components/` |
| Styles | `site/src/app/globals.css` |
| Content | `site/content/posts/` |
| Site config | `site/src/lib/constants.ts` |
| Post utils | `site/src/lib/posts.ts` |
| Publish script | `scripts/sync-obsidian.ps1` |
| Blog drafts (Obsidian) | `D:\Obsidian\...\Blog\` |

## Next.js Development Rules

1. **App Router only** — all pages in `site/src/app/`. No pages router.
2. **Server components by default** — only `'use client'` when strictly needed (interactivity, browser APIs, hooks).
3. **TypeScript** — all files `.ts` or `.tsx`. No `any` without justification.
4. **Tailwind CSS v4 (CSS-first)** — config lives in `globals.css` under `@theme`. No `tailwind.config.js`.
5. **JSX escaping** — apostrophes must be `&apos;`, quotes `&quot;` in JSX text. Never raw `'` or `"`.
6. **No hardcoded URLs** — use `SITE_URL`, `SOCIAL_LINKS` from `site/src/lib/constants.ts`.
7. **Content visibility** — `getAllPosts()` filters by `status === 'published'`. Always set `status: published` in frontmatter before publishing.
8. **Images** — use `next/image`. Remote domains must be in `next.config.ts` `remotePatterns`.
9. **Metadata** — every page must export `metadata` with `title` and `description`.
10. **No `<script>` or inline styles** — use `next/script` or Tailwind/CSS modules.

## Local Dev Commands

```powershell
# Start local dev server
cd site
npm run dev

# Build (verify before deploying)
cd site
npm run build

# Publish article from Obsidian to site
.\scripts\sync-obsidian.ps1

# Preview sync without writing
.\scripts\sync-obsidian.ps1 -DryRun
```

## Deploy

Vercel auto-deploys on every push to `master`. Root directory: `site/`.

- Push to GitHub → Vercel builds in ~30 seconds → live at https://petralian.com
- Always run `cd site && npm run build` locally to verify before pushing.

## Test Baseline

- No automated test suite. Test = `cd site && npm run build` passes (zero TypeScript/Next.js errors) + manual verify at http://localhost:3000.
- When a test suite is added, update this section with baseline count.

---

# PART B — Standardized Engineering Rules (project-agnostic)

> Copied verbatim from Gravio. Do not modify.

## Session End Protocol

At the end of **every** response that involved code changes, file edits, or deploys, append:

```
---
**Changes made:** <one-line summary>
**Files changed:** <comma-separated list>
**Deploy needed:** <Yes/No> — <why> — <done ✓ / pending>
**Rollback tag:** <`vX.Y.Z` if tagged, else `None`>
**Notes updated:** <Yes / No / N/A>
**Obsidian:** <read ✓ / written ✓ / path — OR "skipped: <reason>"> — proof the memory loop ran
**Git commit:** <short hash + message, or `N/A`>
**Self-improvements:** <`None` OR exact file path + line(s) where the rule was written>
**Next session priority:** <highest open item or `None`>
**Test plan:** <how the change was verified, or `N/A`>
```

The `Obsidian` line is **mandatory** on every footer — never `N/A`. Skip this block only for purely conversational answers.

## Self-Improvement Protocol

After every non-trivial session, ask:
1. *Did I learn anything that should be a permanent rule?* → write it into this file (Part A or Part B) and cite the file path + line in the footer.
2. *Did I repeat a mistake?* → write the rule that prevents the **category**, not just the instance.
3. *Did I debug something for >5 minutes or get it wrong on the first try?* → a rule or memory would have prevented it. Write it.

## Code Discipline

1. **Read before writing.** Always read the full relevant file before editing.
2. **One change at a time.** Don't refactor adjacent code while fixing a bug.
3. **Don't gold-plate.** Implement exactly what was asked. No extra abstractions.
4. **No dead code.** If you replace a function, delete the old one in the same commit.
5. **Avoid unnecessary files.** Prefer editing existing files. Don't create docs unless asked.
6. **Pin dependencies.** Use exact versions for any package that ships breaking changes.
7. **Verify assumptions before coding.** Fetch docs first — never iterate on stale memory.

## Pre-Implementation Checklist

Before writing a single line of code:
- [ ] **Obsidian pre-scan:** Read `Operations/Session Summaries.md` and related vault notes. Record findings under `## Obsidian Pre-Scan` in the session note.
- [ ] Read the relevant existing file(s) fully — not just snippets.
- [ ] **For 3+ file changes:** state a plan first, list every file + reason, flag destructive steps, wait for user confirmation.
- [ ] If extending a multi-item system: read all existing items, replicate their contract 1:1.
- [ ] If touching UI/CSS: identify the existing pattern. Reuse, don't reinvent.
- [ ] If touching a third-party integration: fetch the current docs.

## Post-Implementation Checklist

Before declaring done:
- [ ] PHP lint passes (no syntax errors).
- [ ] Manual verify at localhost:8082.
- [ ] Update `CHANGELOG.md` under `[Unreleased]`.
- [ ] If deployed: verify live site loads.
- [ ] Append the Session End Protocol footer.

## Visual Consistency — UI/CSS

1. Read sibling component files first. Find the existing pattern. Do not invent.
2. Reuse design tokens (CSS custom properties).
3. Same component → same class.
4. `[hidden]` always wins. Never write CSS with `display:` on a selector that may also receive `hidden`.
5. Mentally place the element on a real page.

## UX Guidelines

For every interactive component, answer all five before shipping:
1. **Discoverability** — can a user tell the element is interactive and what it does?
2. **Multi-vs-single selection** — default to multi-select where bulk action is plausible.
3. **Inline validation feedback** — never silent no-ops.
4. **Button labels reflect state** — e.g. "Submitting…" while in-flight.
5. **Required steps come first** — inputs that gate an action sit above the action button.

## Destructive Action Rule

Any button that deletes or performs an irreversible action **must** use two-step inline confirmation. Never fire on first click.

## Safety Gate Audit

Whenever you implement a gate (lock, validation, permission check), run all six checks:
1. Error path bypass — can a crash skip the gate? Failure must be BLOCK, not PASS.
2. Permanent lock / no recovery — auto-recovery required.
3. Input validation on required fields — placeholders must be rejected.
4. Correct state assumption — verify the variable actually reflects runtime state.
5. Blast radius — list every file that depends on this mechanism.
6. Hostile self-review — re-read for skipped steps, copy-pasted placeholders, doc/code drift.

## Tool Routing Safety

- Workspace/repo paths → workspace edit tools.
- External tool paths (Obsidian, MCP) → that tool's native API only.
- If a tool reports `Access denied`, stop that tool family and switch to the correct one.

## Communication

- Be brief. Target 1–3 sentences for simple answers.
- Skip framing ("Here's the answer:", "I will now…").
- Confirm completed file operations briefly.
- No emojis unless explicitly requested.

## Git Commit Convention

```
<type>(<scope>): <short description>

Types: feat | fix | style | refactor | chore | docs | content | test
Scope: theme | plugin | docker | content | scripts | docs

Examples:
  feat(theme): add blog index template
  fix(theme): correct escaping in post title output
  content(posts): add vibe coding intro draft
  chore(docker): update compose healthcheck
```

## Multi-Session Safety

- Pull before deploy: `git fetch origin && git log HEAD..origin/main` — if remote has new commits, rebase first.
- After deploy: `git push origin main` immediately.
- For destructive ops (DB wipe, force-push), require explicit user confirmation.
