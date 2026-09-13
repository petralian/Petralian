# Cloud continuity — execution report

> **Updated:** 2026-09-13 — Fleet bootstrap workflow **succeeded** (run `34752150366`).

## What the cloud agent could run

| Action | Result |
|--------|--------|
| Create `petralian/ops`, `vault-petralian`, `sitemonitor` via `gh` | **Blocked** — integration token cannot `createRepository` |
| `workflow_dispatch` Deploy / Fix SiteMonitor | **Blocked** — HTTP 403 for integration |
| HTTP smoke petralian.com / mon / crm | **OK** (200 / 200 / 307) |
| In-repo **cloud-bundle/** + fleet-bootstrap | **Shipped** in Petralian `master` |
| Push to `master` | Triggers **Deploy to VPS** (includes monitor email fix hook) |

## What is ready without your login

1. **`cloud-bundle/`** — cloud agents read fleet + Bridge stubs from **this repo** until private deps exist:
   - `cloud-bundle/ops/services.yaml` (all VPS web apps)
   - `cloud-bundle/vault-mirror/Operations/AI Session Bridge.md`
2. **`fleet-bootstrap/`** — copy for `petralian/ops` repo root
3. **`.cursor/environment.json`** — four `repositoryDependencies` (enable after repos exist)
4. **Desk scripts:** `scripts/bootstrap-fleet-repos.ps1`, `scripts/local-phase-b-vault-mirror.ps1`

## One-time setup (you — ~5 min)

### A. Fleet repos (pick one)

**Option 1 — GitHub Action (recommended)**

1. GitHub → **petralian/Petralian** → Settings → Secrets → Actions → New secret  
   - Name: `PETRALIAN_ADMIN_PAT`  
   - Value: classic PAT with `repo` + permission to create repos in `petralian` org  
2. Actions → **Fleet bootstrap** → Run workflow  
3. Confirm repos exist: `gh repo list petralian`

**Option 2 — PowerShell at desk**

```powershell
cd <Petralian clone>
.\scripts\bootstrap-fleet-repos.ps1
.\scripts\local-phase-b-vault-mirror.ps1
```

### B. Cursor Cloud

1. [Cloud environments](https://cursor.com/dashboard/cloud-agents/environments) → Petralian  
2. Add `repositoryDependencies` from `.cursor/environment.json`  
3. Grant access to private repos after step A  

### C. VPS CouchDB retire (Phase A)

SSH port `2245` → `docker compose down` on legacy obsidian/couch stack when Obsidian Sync is confirmed on all devices.

## SiteMonitor email

Last automated fix: **Deploy to VPS** post-step runs `scripts/fix-website-monitor-emails.sh`.  
After you run **Fleet bootstrap** workflow, it also attempts SSH monitor fix if `VPS_*` secrets are set.

**Verify:** inbox after 07:00 Asia/Singapore, or SSH `docker logs sitemonitor --since 24h | grep -i brevo`.

## Agent read order (cloud, today)

1. `cloud-bundle/ops/services.yaml`  
2. `cloud-bundle/vault-mirror/Operations/AI Session Bridge.md`  
3. `memories/repo/open-loops.md`  
4. After repos exist: cloned `ops` + `vault-petralian` per `AGENTS.md`
