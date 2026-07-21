# Petralian — repo memory (machine-readable)

**Updated:** 2026-05-28

## Identity
- **Site:** https://petralian.com — Next.js 16 blog + newsletter
- **Repo:** `D:\VS Code Projects\Petralian`
- **Vault:** `D:\Obsidian\Obsidian\40_VSCode\Petralian`

## Bootstrap order (mandatory every non-trivial session)
1. `D:\Obsidian\Obsidian\00_Brain\_Manual Prompts\Start of Session.md` — execute fully
2. `.claude/NOTES.md` + `.claude/NEXT_SESSION.md`
3. This folder: `memories/repo/index.md`, `open-loops.md`, `known-gotchas.md`, `facts-discipline.md`; `data/harness-verify.yaml` when verifying or changing limits
4. `00_Brain/AI Agent Methodology.md`
5. `00_Brain/Conventions/Response Footer Contract.md` — session context + footer on every work reply
6. Vault: `Operations/AI Session Bridge.md` → `Session Summaries.md` → relevant `Features/*`
7. Create/update `Operations/Sessions/YYYY-MM-DD <topic>.md` **before coding**
8. Confirm `.cursor/rules/response-footer.mdc` (`alwaysApply: true`)
9. Vault writes: `petralian-obsidian` MCP or `node scripts/obsidian-mcp-cli.mjs` (see `.cursor/rules/obsidian-mcp.mdc`)

## Key paths
| Area | Path |
|------|------|
| Posts (live) | `content/posts/*.md` |
| Drafts (never write in session) | Obsidian `Blog/01 Drafts/` |
| D2 render | `src/lib/render-d2.ts`, `src/lib/d2-design-system.ts` |
| Diagram UI | `src/components/diagram/`, `src/components/d2/D2Diagram.tsx` |
| Post MDX | `src/app/posts/[slug]/page.tsx` |
| SEO field | `seo_description` (not `meta_description`) |

## Deploy
- **Platform:** Vercel from `master`
- **Build:** `tinacms build --skip-cloud-checks && cross-env NODE_OPTIONS=--max-old-space-size=1024 next build`
- **TS-only check:** `npx next build` if Tina dev on :9000

## Current priority (2026-05-28)
Deploy batch: Lighthouse homepage fix + mobile diagram viewport + image JPEGs. Re-run PageSpeed mobile after deploy. Footer/memory loop: brain RFC + Cursor rules synced.
