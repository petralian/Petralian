# Phase 0 inventory — 2026-09-13

> Agent-run from cloud workspace. **Confirm on desk:** `D:\` vault git remotes, Hermes public domains, private repo visibility.

## GitHub (`petralian`)

| Repo | Status | Notes |
|------|--------|-------|
| `petralian/Petralian` | **Exists** (public) | User may want **private** for cloud continuity |
| `petralian/vault-petralian` | **Created** | Fleet bootstrap run `34752150366`; replace stubs via Obsidian Git |
| `petralian/ops` | **Created** | Fleet map from `fleet-bootstrap/` |
| `petralian/sitemonitor` | **Created** | Placeholder README — Phase D import from VPS |
| `petralian/Gravio`, `aesthetic-clock`, `obsidiandb` | Public | External / not on VPS fleet template unless inventory adds them |

## HTTP smoke (external)

| URL | Code |
|-----|------|
| https://petralian.com/ | 200 |
| https://mon.petralian.com/ | 200 |
| https://crm.petralian.com/ | 307 |

## VPS (not SSH’d this run)

Last deploy fix hook (2026-09-10): `compose_dir=/opt/sitemonitor`, Brevo synced. Re-verify digest email + `docker ps` on SSH.

Expected containers (from prior logs): `sitemonitor`, Hermes stack, **legacy** `obsidian-sync-mcp` + `obsidiansync-couchdb` until Phase A.

## Cursor Cloud

| Item | Status |
|------|--------|
| `.cursor/environment.json` | **Not committed** — added in this session |
| `repositoryDependencies` | **Not set** until private repos exist |

## Desk-only (Nathan)

- [ ] `Get-ChildItem D:\Obsidian\Obsidian\40_VSCode` — list project vaults
- [ ] `Test-Path D:\Obsidian\...\Petralian\.git` and `git remote -v`
- [ ] `gh repo list petralian --limit 100` (includes private)
- [ ] Hermes/nginx domains for ports 8787–8790
- [x] Fleet bootstrap Action + `PETRALIAN_ADMIN_PAT` (2026-09-13)
- [ ] Cursor Cloud `repositoryDependencies` + grant private repo access
- [ ] `local-phase-b-vault-mirror.ps1` — push real vault over stubs

## Next execution order

1. Merge PR #1 → pull `master` locally  
2. Run `scripts/bootstrap-fleet-repos.ps1` (create private repos + push ops bootstrap)  
3. Run `scripts/local-phase-b-vault-mirror.ps1` in vault  
4. SSH Phase A (retire CouchDB stack)  
5. Cursor Dashboard → `repositoryDependencies` + grant repo access  
