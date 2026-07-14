# Petralian — project notes (agent handoff)

**Updated:** 2026-07-14 (writing guide voice + density)

## Durable lessons (2026-07-14)
- **Writing guide voice** — Gold standard = Lighthouse 100 shape; paragraphs 3–6 sentences; **Say it once** (no thesis repeat per H2); ban `(Not X)` titles and clever headings like `hosts, not dogma`.
- **Capability honesty** — vibe-code + read/review code; never claim hand-coding unless verified for that draft.
- **Playbook + GEO tags** — allowed in normalize-tags + Writing Session Guide; SEO_POST_TAGS overrides must include them or normalize strips them.
- **KW Engine cleanup** — plain titles; `How this relates to…` headings; split duplicate `Getting oriented` into `How to start with this playbook`.

## Durable lessons (2026-07-13)
- **Format vocabulary** — one label per format everywhere: Strategic / Hands-on / Hybrid (`src/lib/post-format.ts`). Never alternate names on cards vs filters.
- **Site layout tokens** — use `--site-gutter-x`, `--site-pad-bottom`, `--site-block-gap` in `globals.css` for all page shells; responsive overrides at 860px / 640px.
- **Post outline** — sticky on `.post-outline-root`; IntersectionObserver spy; Playbook/GEO are topic tags.
- **Inline D2** — getBBox viewBox trim; transparent viewport; no CSS squash.
- **`date` = editorial publish date**, never sync day — publish scripts preserve existing `content/posts/` dates on re-sync from `03 Published/`.
- **One slug = one vault file** — published posts live only in `03 Published/`; delete ideas dupes (` 1.md` suffix).
- **No Ulta on blog** — anonymize to generic beauty/retail; Vouch OK to name.

## Stack
Next.js 16 · TinaCMS · Markdown in `content/posts/` · Vercel

## Vault
`D:\Obsidian\Obsidian\40_VSCode\Petralian`

## Session protocol (mandatory — user-enforced)
**Start:** `D:\Obsidian\Obsidian\00_Brain\_Manual Prompts\Start of Session.md`

Minimum before coding:
1. Read `_Home.md`, `Operations/AI Session Bridge.md`, `Operations/Session Summaries.md`, relevant `Features/*`
2. Read `memories/repo/index.md`, `open-loops.md`, `known-gotchas.md`
3. Create/update `Operations/Sessions/YYYY-MM-DD <topic>.md` with goal, git state, pre-scan, roadmap

**During:** Append session note + update Feature notes after major changes.

**End:** `D:\Obsidian\Obsidian\00_Brain\_Manual Prompts\End of Session.md` — summaries, bridge, lessons, footer.

## Layered memory map
| Layer | Where |
|-------|--------|
| Universal rules | `00_Brain/AI Agent Methodology.md` |
| Project bridge | Vault `Operations/AI Session Bridge.md` |
| Session handoff | Vault `Operations/Sessions/*.md` |
| Evergreen features | Vault `Features/*.md` |
| Decisions / lessons | Vault `Operations/Decisions.md`, `Lessons Learned.md` |
| Cross-agent | Vault `Operations/Copilot Shared Memory.md` |
| Machine-readable | Repo `memories/repo/*` |
| Cursor enforce | `.cursor/rules/session-protocol.mdc` |

## Current focus (next session)
**D2 QA → commit** — uncommitted on master. `npx next build` passed at close. Production still Mermaid (`7850261`).

## Bootstrap order
1. Start of Session prompt (Brain)
2. `memories/repo/*`
3. Vault bridge + summaries
4. This file + `NEXT_SESSION.md`
