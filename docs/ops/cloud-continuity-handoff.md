# Cloud continuity handoff — local agent execution plan

> **Created:** 2026-09-10 (cloud agent session, SiteMonitor email fix)  
> **For:** Local Cursor agent when Nathan is back at the desk  
> **Goal:** Shared operator layer so cloud agents can continue work without `D:\` vault or VPS archaeology

---

## Can cloud access Obsidian today?

**No — not from this cloud agent, and not via official Obsidian Sync.**

| Path | Cloud agent today | Why |
|------|-------------------|-----|
| `D:\Obsidian\...` native read/write | ❌ | Windows path; not mounted on cloud VM |
| `petralian-obsidian` MCP (`scripts/obsidian-mcp-server.mjs`) | ❌ | Hardcoded to `D:\Obsidian\Obsidian\40_VSCode\Petralian`; fails closed off Windows |
| **Obsidian Sync** (official cloud) | ❌ | Syncs Obsidian apps only — no agent/API surface |
| **Self-hosted CouchDB** on VPS (`obsidiansync-couchdb`, port 5984) | ❌ | Bound to `127.0.0.1` — not reachable from cloud |
| `obsidian-sync-mcp` container on VPS | ⚠️ Not wired | Exists in Docker; not in cloud `.cursor/mcp.json` or egress allowlist |

**Half the solution** is vault continuity. **The other half** is git-hosted ops map + service repos (SiteMonitor, secrets manifest). This plan covers both.

---

## Target architecture (when done)

```
┌─────────────────────────────────────────────────────────────┐
│  Nathan @ desk: Obsidian (canonical prose) + local Cursor      │
└───────────────┬─────────────────────────────┬───────────────┘
                │ git push (Operations mirror)  │ git push (code)
                ▼                               ▼
┌───────────────────────────┐     ┌────────────────────────────┐
│ petralian/ops (private)    │     │ petralian/Petralian         │
│ services.yaml, secrets     │     │ petralian/sitemonitor       │
│ manifest, runbooks         │     │ (app code + compose)        │
└───────────────┬───────────┘     └──────────────┬─────────────┘
                │                                 │
                └────────────┬────────────────────┘
                             ▼
              ┌──────────────────────────────┐
              │ Cursor Cloud environment      │
              │ repositoryDependencies: all 3 │
              │ GitHub Environment secrets    │
              └──────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ VPS (deploy from git only)    │
              │ /www/wwwroot/petralian        │
              │ /opt/sitemonitor              │
              └──────────────────────────────┘
```

---

## Phase 0 — Inventory (local agent, ~30 min)

Run at desk. Fill gaps in `petralian/ops` later.

### 0.1 Vault paths (confirm)

| Vault | Path |
|-------|------|
| Brain | `D:\Obsidian\Obsidian\00_Brain` |
| Petralian project | `D:\Obsidian\Obsidian\40_VSCode\Petralian` |

### 0.2 What must cloud agents read without Obsidian?

Minimum mirror set (private git):

```
Operations/
  AI Session Bridge.md
  Session Summaries.md
  Open Loops.md
_MOC.md
_Home.md
Features/          # active features only
Operations/Sessions/  # last 14 days optional
```

**Do not mirror:** `Blog/01 Drafts/`, full `00_Brain` (too large; methodology stays local unless needed).

### 0.3 VPS services (confirmed 2026-09-10)

| Service | Domain | VPS path | Runtime |
|---------|--------|----------|---------|
| Petralian site | petralian.com | `/www/wwwroot/petralian` | PM2 cluster :3000 |
| SiteMonitor | mon.petralian.com | `/opt/sitemonitor` | Docker `sitemonitor` :3010 |
| Obsidian sync | — | CouchDB `127.0.0.1:5984` | Docker `obsidiansync-couchdb` |

### 0.4 Secrets inventory (names only — document where values live)

| Secret | Used by | Current location |
|--------|---------|------------------|
| `BREVO_API_KEY` | Petralian newsletter + SiteMonitor digest | VPS `.env` files (was drifting!) |
| `CRON_SECRET` | Petralian weekly digest API | petralian `.env` |
| `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` | GitHub Actions deploy | GitHub repo secrets |
| SiteMonitor dashboard password | mon.petralian.com UI | SiteMonitor config only |
| CouchDB credentials | Obsidian self-host sync | VPS / compose env |

---

## Phase 1 — `petralian/ops` private repo (priority)

**Owner:** local agent creates repo; cloud can consume immediately.

### 1.1 Create repo

```bash
# On GitHub: new private repo petralian/ops
```

### 1.2 Add `services.yaml` (SSOT)

```yaml
# ops/services.yaml — machine-readable fleet map
version: 1

vps:
  host_secret: VPS_HOST          # GitHub secret name
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
    repo: github.com/petralian/sitemonitor   # Phase 2
    domain: mon.petralian.com
    compose_dir: /opt/sitemonitor
    port: 3010
    container: sitemonitor
    digest_cron: "0 7 * * * Asia/Singapore"
    shared_secrets: [BREVO_API_KEY]

  obsidian_sync:
    type: couchdb
    bind: 127.0.0.1:5984
    container: obsidiansync-couchdb
    note: "Local Obsidian only today; not exposed to cloud"
```

### 1.3 Add `secrets.manifest.yaml`

```yaml
# Names and consumers only — NEVER values
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

### 1.4 Link from Petralian repo

In `memories/repo/index.md` and `AGENTS.md`, add:

```markdown
Fleet map: github.com/petralian/ops → services.yaml
```

---

## Phase 2 — Vault git mirror (fixes “half the solution”)

Pick **one** approach.

### Option A — Recommended: private `petralian/vault-petralian` mirror

Ops subset only; Obsidian remains canonical at desk.

1. Create private repo `petralian/vault-petralian`.
2. From project vault root:

```powershell
cd "D:\Obsidian\Obsidian\40_VSCode\Petralian"
git init
git remote add origin git@github.com:petralian/vault-petralian.git

# .gitignore in vault mirror
@(
  'Blog/01 Drafts/',
  'Blog/02 Ready to publish/',
  '.obsidian/workspace*',
  '.trash/'
) | Set-Content .gitignore

git add Operations/ Features/ _Home.md _MOC.md
git commit -m "Initial ops mirror for cloud continuity"
git push -u origin master
```

3. **Habit:** End of session → `git add Operations/ && git commit && git push` (or script).
4. Cloud agents: clone via `repositoryDependencies` — read Bridge, Open Loops, Features.

### Option B — Obsidian Git plugin (same repo, inside Obsidian UI)

If you already use Obsidian Git: point it at `petralian/vault-petralian`, auto-commit Operations on interval. Same mirror scope as Option A.

### Option C — Expose self-hosted sync to cloud (advanced, later)

Only if you want live vault, not mirror:

- Tailscale on VPS + cloud agent egress to CouchDB, **or**
- Deploy `obsidian-sync-mcp` with auth; add to cloud environment MCP allowlist.

**Not recommended first** — git mirror is simpler and auditable.

---

## Phase 3 — `petralian/sitemonitor` repo

SiteMonitor code today: `/opt/sitemonitor` + local `.website-monitor/` (gitignored in Petralian).

### 3.1 Snapshot from VPS

```bash
ssh -p 2245 user@VPS
sudo tar -czf /tmp/sitemonitor-backup.tgz -C /opt sitemonitor
# scp to local, unpack, review
```

Also copy local `.website-monitor/` if it exists and diff against VPS.

### 3.2 Create repo structure

```
sitemonitor/
├── docker-compose.yml
├── .env.example          # all keys, no values
├── package.json
├── src/ or server/
├── public/               # auth.js, index.html
├── data/                 # .gitignore — volume on VPS
└── .github/workflows/deploy-sitemonitor.yml
```

### 3.3 Deploy workflow

Mirror `deploy-vps.yml`: SSH → `cd /opt/sitemonitor` → `git pull` → `docker compose up -d --build`.

### 3.4 Shared Brevo secret

GitHub Environment `production` → inject `BREVO_API_KEY` into compose `.env` on deploy. **Never hand-copy between petralian and sitemonitor again.**

---

## Phase 4 — Cursor Cloud environment

In [Cursor Cloud environment](https://cursor.com/dashboard/cloud-agents/environments/e/ef658c55-accc-11f1-bf4b-42ffb4d10ea7) (or commit `.cursor/environment.json`):

```json
{
  "name": "Petralian fleet",
  "install": "npm ci",
  "repositoryDependencies": [
    "github.com/petralian/ops",
    "github.com/petralian/vault-petralian",
    "github.com/petralian/sitemonitor"
  ]
}
```

### 4.1 Cloud agent bootstrap (add to `AGENTS.md`)

```markdown
## Cloud bootstrap (no D:\ vault)
1. Read `ops/services.yaml` from ops repo dependency
2. Read `Operations/AI Session Bridge.md` from vault-petralian dependency
3. Read `memories/repo/open-loops.md` in Petralian (fallback)
4. Never assume `.website-monitor/` exists — use sitemonitor repo
```

### 4.2 Relax `obsidian-mcp-server.mjs` for cloud (optional)

Allow `PETRALIAN_OBSIDIAN_VAULT_ROOT` to point at cloned `vault-petralian` in cloud workspace when `D:\` is absent. Local agent can patch:

```javascript
// If D:\ missing, fall back to env or ./vault-petralian clone path
```

---

## Phase 5 — GitHub Environments (shared secrets)

1. GitHub → petralian org → Settings → Environments → `production`.
2. Add secrets: `BREVO_API_KEY`, `CRON_SECRET`, `UNSUBSCRIBE_SECRET`.
3. Update `deploy-vps.yml` and new `deploy-sitemonitor.yml`:

```yaml
environment: production
```

4. Optional workflow `ops/.github/workflows/sync-vps-env.yml` — writes `.env` files from secrets (single source).

---

## Local agent checklist (copy-paste)

```
□ Create private petralian/ops with services.yaml + secrets.manifest.yaml
□ Create private petralian/vault-petralian; push Operations/ + Features/ + _MOC.md
□ Snapshot /opt/sitemonitor → petralian/sitemonitor repo + deploy workflow
□ GitHub Environment production with shared BREVO_API_KEY
□ Cursor Cloud: repositoryDependencies (ops, vault-petralian, sitemonitor)
□ Update AGENTS.md cloud bootstrap section
□ Optional: patch obsidian-mcp-server.mjs for vault-petralian clone path
□ End-of-session: vault mirror git push habit (or Obsidian Git plugin)
□ Vault: append Session Summaries entry linking this handoff + IDN when phases ship
```

---

## What cloud can do *right now* (without Phase 1–4)

- Edit `petralian/Petralian` and deploy via GitHub Actions
- Run `scripts/fix-website-monitor-emails.sh` on VPS (symptom fix; not root ownership)
- Read `memories/repo/*` and `data/*.yaml` in repo

## What cloud cannot do until handoff is done

- Read/write Obsidian Bridge, Session Summaries, Feature notes
- Own SiteMonitor source changes
- See full secrets map or fix cross-service drift confidently

---

## Session context for local agent

**Prior cloud work (2026-09-10):** SiteMonitor daily emails failed due to invalid `BREVO_API_KEY` in Docker container at `/opt/sitemonitor`. Fixed by syncing key from petralian `.env` and recreating container. Added `scripts/fix-website-monitor-emails.sh` to deploy hook. Root issue: operator layer not in git.

**Open loop:** Promote SiteMonitor to `petralian/sitemonitor` repo and vault ops to `petralian/vault-petralian` per this plan.
