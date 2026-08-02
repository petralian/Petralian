# Petralian — repo memory (machine-readable)

**Updated:** 2026-07-28

## Identity
- **Site:** https://petralian.com — Next.js 16 blog + newsletter
- **Repo:** `C:\Users\User\OneDrive\02 VS Code\Petralian`
- **Vault:** `D:\Obsidian\Obsidian\40_VSCode\Petralian`

## Bootstrap order (mandatory every non-trivial session)
1. `D:\Obsidian\Obsidian\00_Brain\_Manual Prompts\Start of Session.md` — execute fully
2. `.cursor/rules/response-footer.mdc`, `session-protocol.mdc`, `facts-and-verification.mdc`, `enterprise-traceability.mdc`, `ux-design-harness.mdc` (frontend)
3. This folder: `index.md`, `open-loops.md`, `known-gotchas.md`, `facts-discipline.md`, `ux-design.md`
4. `data/harness-verify.yaml` — verify commands + SEO limits (parametric SSOT)
5. `data/design-harness.yaml` — UX touch targets + a11y thresholds (frontend work)
6. Vault: `Operations/AI Session Bridge.md` → `Session Summaries.md` → relevant `Features/*`
7. Create/update `Operations/Sessions/YYYY-MM-DD <topic>.md` **before coding**
8. Vault I/O: native `Read`/`Write` on `D:\Obsidian\...` per `.cursor/rules/obsidian-vault-io.mdc`

## Harness verify (before publish / session close)
```powershell
npm run audit:facts
# or: node scripts/run-facts-gate.mjs
```

## Key paths
| Area | Path |
|------|------|
| Posts (live) | `content/posts/*.md` |
| Drafts (never write in session) | Obsidian `Blog/01 Drafts/` |
| Parametric SSOT | `data/harness-verify.yaml` |
| UX harness | `DESIGN.md`, `data/design-harness.yaml`, `.cursor/rules/ux-design-harness.mdc` |
| Facts gate | `scripts/run-facts-gate.mjs` |
| Publish (local) | `scripts/sync-obsidian.ps1` |
| Publish (cloud) | `scripts/publish-from-vault.mjs` + `.github/workflows/auto-publish.yml` |
| D2 render | `src/lib/render-d2.ts` |
| SEO field | `seo_description` (limits in `data/harness-verify.yaml`) |

## Deploy
- **Platform (target):** VPS + aaPanel — runbook `docs/deploy/aapanel.md`
- **Platform (current):** VPS + aaPanel — `docs/deploy/aapanel.md`, `data/deploy.yaml`; deploy via `.github/workflows/deploy-vps.yml` on push to `master`
- **VPS paths SSOT:** `data/deploy.yaml`
- **Build:** `npm run build` (Tina + Next); on VPS: `bash scripts/deploy-on-vps.sh`
- **PM2:** `ecosystem.config.cjs`
- **CI deploy:** `.github/workflows/deploy-vps.yml` (secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)
- **TS-only check:** `npx next build` if Tina dev on :9000
- **Facts CI:** `.github/workflows/facts-gate.yml`

## Fleet sync
Brain manifest: `00_Brain/scripts/cursor-projects.json`  
Spread rules + harness scripts: `00_Brain/scripts/sync-cursor-stack.ps1`

## MCP (Cursor)
See `docs/TOKEN-STACK.md`. **OpenSEO** (`openseo` in `.cursor/mcp.json`) — GSC + keyword research; auth at https://app.openseo.so/ai
