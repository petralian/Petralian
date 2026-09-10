# COPY-PASTE — Local agent instructions (cloud continuity)

> Paste this entire message into Cursor at your desk.  
> Full reference: `docs/ops/cloud-continuity-handoff.md`

---

## Context

Nathan retired **self-hosted CouchDB / LiveSync** on the VPS. Vault sync is now **official Obsidian Sync only** (no API). Cloud agents and iPhone cannot read Obsidian directly — they need a **private git mirror** of vault ops files plus fleet repos.

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
2. Add `services.yaml`:

   ```yaml
   version: 1
   obsidian:
     sync: official_obsidian_sync
     cloud_mirror: github.com/petralian/vault-petralian
     local_path: "D:\\Obsidian\\Obsidian\\40_VSCode\\Petralian"
     brain_path: "D:\\Obsidian\\Obsidian\\00_Brain"
     retired_vps: [obsidiansync-couchdb, obsidian-sync-mcp]

   vps:
     host_secret: VPS_HOST
     ssh_port: 2245

   services:
     petralian:
       repo: github.com/petralian/Petralian
       domain: petralian.com
       app_dir: /www/wwwroot/petralian
       port: 3000
       deploy: .github/workflows/deploy-vps.yml
       shared_secrets: [BREVO_API_KEY, CRON_SECRET, UNSUBSCRIBE_SECRET]

     sitemonitor:
       repo: github.com/petralian/sitemonitor
       domain: mon.petralian.com
       compose_dir: /opt/sitemonitor
       port: 3010
       container: sitemonitor
       digest_cron: "0 7 * * * Asia/Singapore"
       shared_secrets: [BREVO_API_KEY]
   ```

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
4. **MCP for mobile/cloud:** Only URL servers (OpenSEO already works). Do **not** add CouchDB Obsidian MCP.
5. Smoke test: launch cloud agent → ask it to read `Operations/AI Session Bridge.md` from vault-petralian clone and summarize priority.

---

### Phase G — Vault write-back (~10 min)

1. Update `Operations/Open Loops.md` — close or update "Cloud continuity" loop.
2. Append `Operations/Session Summaries.md` with what shipped and repo links.
3. Sync `memories/repo/open-loops.md` in Petralian git (already has mirror row — update status to Closed when done).

---

## Checklist (tick as you go)

```
□ Phase A: CouchDB + obsidian-sync-mcp stopped/removed on VPS
□ Phase B: petralian/vault-petralian live + Obsidian Git pushing
□ Phase C: petralian/ops with services.yaml + secrets.manifest.yaml
□ Phase D: petralian/sitemonitor repo + deploy workflow
□ Phase E: GitHub Environment production secrets
□ Phase F: Cursor Cloud repositoryDependencies + cloud smoke test
□ Phase G: Vault Session Summaries + Open Loops updated
```

---

## What NOT to do

- Do not set up `vault-mcp.petralian.com` or CouchDB-based obsidian-sync-mcp.
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
