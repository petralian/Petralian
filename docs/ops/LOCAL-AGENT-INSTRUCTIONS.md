# COPY-PASTE — Local agent instructions (cloud continuity)

> Paste this entire message into Cursor at your desk.  
> Full reference: `docs/ops/cloud-continuity-handoff.md`

---

## Context

Nathan retired **self-hosted CouchDB / LiveSync** on the VPS. Vault sync is **official Obsidian Sync** (no public API). Agents get **full operational memory** via native `D:\` paths and/or **Obsidian MCP** on the same synced files; cloud also uses **`vault-petralian` git mirror** when MCP is unavailable. Fleet map covers **all VPS web apps**, not only petralian.com and mon.

**Do not** wire `obsidian-sync-mcp`, CouchDB, or `vault-mcp.petralian.com`. Decommission those Docker containers if still running.

**Prior cloud work:** SiteMonitor daily emails were fixed (`BREVO_API_KEY` drift). Root issue: operator layer not in git. See `scripts/fix-website-monitor-emails.sh`.

---

## Your mission

Execute all phases below. Update vault `Operations/Session Summaries.md` and `Operations/Open Loops.md` when done. Append a Session Summaries entry.

---

### Phase A — Retire legacy VPS Obsidian stack (~15 min)

1. SSH to VPS (port `2245`).
2. Confirm containers: `docker ps | grep -E 'obsidian|couch'`
3. Find compose dir:
   ```bash
   docker inspect obsidian-sync-mcp --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}'
   ```
4. `docker compose down` (add `-v` only if data is backed up and Obsidian Sync is confirmed working on all devices).
5. Remove any nginx site `vault-mcp.petralian.com` if it exists.
6. Note completion in session note.

---

### Phase B — Create `petralian/vault-petralian` (private) (~30 min)

**Goal:** Cloud/iPhone agents read `Operations/AI Session Bridge.md` from git.

1. Create private GitHub repo `petralian/vault-petralian`.
2. In `D:\Obsidian\Obsidian\40_VSCode\Petralian`:

   ```powershell
   @'
   Blog/01 Drafts/
   Blog/02 Ready to publish/
   .obsidian/workspace*
   .obsidian/cache
   .trash/
   '@ | Set-Content -Encoding utf8 .gitignore

   git init
   git remote add origin git@github.com:petralian/vault-petralian.git
   git add Operations/ Features/ _Home.md _MOC.md .gitignore
   git commit -m "Initial vault ops mirror for cloud continuity"
   git push -u origin master
   ```

3. Install/configure **Obsidian Git** plugin:
   - Auto-commit on interval OR commit on idle
   - Confirm pushes to `petralian/vault-petralian`
4. Smoke test: edit Bridge → wait for commit/push → verify on GitHub web UI.

---

### Phase C — Create `petralian/ops` (private) (~20 min)

1. Create private repo `petralian/ops`.
2. Copy [`docs/ops/services.yaml.example`](services.yaml.example) into `petralian/ops/services.yaml`. It lists **all known VPS web apps** (petralian, sitemonitor, crm, Hermes agents + web UIs, retired CouchDB stack). After Phase 0 inventory, set `domain:` for Hermes services and add any missing aaPanel sites.

3. Add `secrets.manifest.yaml` (names only — never values):

   ```yaml
   secrets:
     BREVO_API_KEY:
       github_environment: production
       consumers: [petralian, sitemonitor]
     CRON_SECRET:
       github_environment: production
       consumers: [petralian]
     VPS_HOST:
       github_repo_secrets: [Petralian, ops, sitemonitor]
   ```

4. In **Petralian** repo, update `memories/repo/index.md` and `AGENTS.md`:
   - Fleet map: `github.com/petralian/ops`
   - Vault mirror: `github.com/petralian/vault-petralian`
   - Cloud bootstrap section from `cloud-continuity-handoff.md` Phase 4

---

### Phase D — Create `petralian/sitemonitor` (private) (~45 min)

1. Snapshot VPS:
   ```bash
   ssh -p 2245 user@VPS
   sudo tar -czf /tmp/sitemonitor.tgz -C /opt sitemonitor
   ```
2. Copy local `.website-monitor/` if it exists under Petralian repo parent; diff against VPS.
3. Create private repo with `docker-compose.yml`, `.env.example`, source, `.github/workflows/deploy-sitemonitor.yml`.
4. Deploy workflow: SSH → `cd /opt/sitemonitor` → `git pull` → `docker compose up -d --build`.
5. Wire `BREVO_API_KEY` from GitHub Environment `production` on deploy (no manual `.env` copy).

---

### Phase E — GitHub Environment `production` (~15 min)

1. Org/repo → Settings → Environments → `production`.
2. Secrets: `BREVO_API_KEY`, `CRON_SECRET`, `UNSUBSCRIBE_SECRET` (values from current working VPS `.env`).
3. Update `deploy-vps.yml` to use `environment: production` if not already.
4. New `deploy-sitemonitor.yml` uses same environment.

---

### Phase F — Cursor Cloud environment (~15 min)

1. Open [Cursor Cloud environment](https://cursor.com/dashboard/cloud-agents/environments) for Petralian.
2. Add **repositoryDependencies** (all private repos must be accessible to the environment):
   - `github.com/petralian/ops`
   - `github.com/petralian/vault-petralian`
   - `github.com/petralian/sitemonitor`
   - `github.com/petralian/Petralian`
3. Optional: commit `.cursor/environment.json` with same `repositoryDependencies` + `install: npm ci`.
4. **MCP for mobile/cloud:** OpenSEO (URL) + **Obsidian MCP** in Dashboard for full vault; do **not** add CouchDB `obsidian-sync-mcp`.
5. Smoke test: launch cloud agent → ask it to read `Operations/AI Session Bridge.md` from vault-petralian clone and summarize priority.

---

### Phase F2 — Retire local vault MCP (~5 min)

**Policy:** At desk, vault I/O is native `Read`/`Write`/`StrReplace` on `D:\Obsidian\...`. MCP is for **remote** services only (OpenSEO URL, optional cloud filesystem MCP on `vault-petralian` clone).

1. Pull latest Petralian `master` (includes removal of `petralian-obsidian` from `.cursor/mcp.json`).
2. Cursor → **Settings → MCP** → remove any cached `petralian-obsidian`, `obsidian-brain`, or `obsidian-petralian` entries if still listed.
3. Confirm `.vscode/mcp.json` has empty `servers` (no vault stdio MCP).
4. **Developer: Reload Window**.
5. Smoke test: new chat → ask agent to read `Operations/AI Session Bridge.md` via native path (not MCP tools).

---

### Phase G — Vault write-back (~10 min)

1. Update `Operations/Open Loops.md` — close or update "Cloud continuity" loop.
2. Append `Operations/Session Summaries.md` with what shipped and repo links.
3. Sync `memories/repo/open-loops.md` in Petralian git (already has mirror row — update status to Closed when done).

---

## Phase 0 results (2026-09-13)

See [`docs/ops/phase-0-inventory-2026-09-13.md`](phase-0-inventory-2026-09-13.md). **Missing repos:** `vault-petralian`, `ops`, `sitemonitor`. **Desk scripts:** `scripts/bootstrap-fleet-repos.ps1`, `scripts/local-phase-b-vault-mirror.ps1`.

---

## Checklist (tick as you go)

```
□ Phase 0: Inventory confirmed on desk (private repos, D:\ vault .git, Hermes domains)
□ Phase A: CouchDB + obsidian-sync-mcp stopped/removed on VPS
□ Phase B: petralian/vault-petralian live + Obsidian Git pushing
□ Phase C: petralian/ops with services.yaml + secrets.manifest.yaml
□ Phase D: petralian/sitemonitor repo + deploy workflow
□ Phase E: GitHub Environment production secrets
□ Phase F: Cursor Cloud repositoryDependencies + cloud smoke test
□ Phase F2: Local vault MCP removed; native Read/Write smoke test
□ Phase G: Vault Session Summaries + Open Loops updated
```

---

## What NOT to do

- Do not set up `vault-mcp.petralian.com` or CouchDB-based obsidian-sync-mcp.
- Do not register `petralian-obsidian`, `obsidian-brain`, or filesystem MCP on `D:\Obsidian\...` at desk — use native file tools.
- Do not assume official Obsidian Sync exposes an API or MCP.
- Do not commit vault drafts (`Blog/01 Drafts/`) to the mirror repo.
- Do not hand-copy `BREVO_API_KEY` between services — use GitHub Environment.

---

## Done when

A cloud agent can, without Nathan at the desk:

1. Read `Operations/AI Session Bridge.md` from the `vault-petralian` dependency.
2. Read fleet map from `ops/services.yaml`.
3. Change SiteMonitor in `petralian/sitemonitor` and deploy.
4. Change Petralian site and deploy via existing workflow.
