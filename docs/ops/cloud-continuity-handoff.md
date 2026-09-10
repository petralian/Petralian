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
| `obsidian-sync-mcp` container on VPS | ⚠️ Not wired | Exists in Docker; not exposed via HTTPS; not in Cursor Cloud MCP dashboard |

**Yes — MCP is the right bridge for Obsidian.** Official Obsidian Sync has no API, but [obsidian-sync-mcp](https://github.com/es617/obsidian-sync-mcp) exposes your vault over HTTP MCP, reading from the same CouchDB that **Self-hosted LiveSync** syncs to. You already run `obsidiansync-couchdb` + `obsidian-sync-mcp` on the VPS — they just need wiring + Cursor Cloud registration.

**Half the solution** = wire Obsidian MCP. **Other half** = git-hosted ops map + service repos (SiteMonitor, secrets manifest).

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

## Phase 2 — Obsidian via MCP (recommended — you already have the stack)

MCP gives cloud agents **live read/write** to vault notes (Bridge, Features, session notes) without a git mirror. Works when your laptop is off, as long as LiveSync has synced to CouchDB.

### Architecture

```
Obsidian (desk/phone)
    │  Self-hosted LiveSync plugin
    ▼
CouchDB (VPS, obsidiansync-couchdb :5984)
    │
    ▼
obsidian-sync-mcp (VPS, :8787/mcp)
    │  HTTPS + MCP_AUTH_TOKEN
    ▼
Cursor Cloud Agent  ←→  obsidian_read / write / search tools
```

### 2.1 Confirm LiveSync is syncing both vaults

In Obsidian → **Self-hosted LiveSync** settings on each vault:

| Vault | Path | CouchDB database name |
|-------|------|------------------------|
| Brain | `00_Brain` | (note exact DB name) |
| Petralian | `40_VSCode/Petralian` | (note exact DB name) |

If E2E encryption is on, you need `COUCHDB_PASSPHRASE` (same as plugin).

### 2.2 Find / fix VPS compose for obsidian-sync

SSH to VPS and locate compose (likely `/opt/obsidian-sync` or similar):

```bash
docker inspect obsidian-sync-mcp --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}'
docker inspect obsidiansync-couchdb --format '{{json .Config.Env}}' | jq .
```

Ensure `obsidian-sync-mcp` has:

```yaml
# docker-compose snippet (adjust paths)
services:
  couchdb:
    image: couchdb:3
    ports:
      - "127.0.0.1:5984:5984"   # keep localhost-only

  obsidian-sync-mcp:
    image: ghcr.io/es617/obsidian-sync-mcp:latest
    ports:
      - "127.0.0.1:8787:8787"   # nginx will proxy publicly
    environment:
      COUCHDB_URL: http://couchdb:5984
      COUCHDB_USER: admin
      COUCHDB_PASSWORD: ${COUCHDB_PASSWORD}
      COUCHDB_DATABASE: obsidian          # match LiveSync
      VAULT_NAME: Petralian               # match LiveSync vault name
      COUCHDB_PASSPHRASE: ${COUCHDB_PASSPHRASE}  # if E2E enabled
      MCP_AUTH_TOKEN: ${MCP_AUTH_TOKEN}   # openssl rand -hex 32
      BASE_URL: https://vault-mcp.petralian.com   # public URL nginx uses
```

**Two MCP instances** (optional): one per vault/DB — Brain + Petralian — or one server with the DB you use most for agent work (start with Petralian project vault).

### 2.3 Expose MCP via nginx (HTTPS + auth)

Add subdomain e.g. `vault-mcp.petralian.com` (aaPanel → reverse proxy → `127.0.0.1:8787`). Let's Encrypt SSL.

MCP endpoint: `https://vault-mcp.petralian.com/mcp`

Do **not** expose CouchDB :5984 publicly — only the MCP server.

### 2.4 Register in Cursor Cloud (required for cloud agents)

Project `.cursor/mcp.json` alone is **not enough** for cloud agents. Add the same server in:

**Cursor Dashboard → Integrations & MCP** (or Cloud Agent environment MCP settings)

```json
{
  "mcpServers": {
    "obsidian-petralian": {
      "url": "https://vault-mcp.petralian.com/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

Store `MCP_AUTH_TOKEN` in the dashboard secret field — **not** committed to git. For local IDE, use `${env:OBSIDIAN_MCP_TOKEN}` in headers if supported.

**Cloud preference:** HTTP MCP is recommended — credentials stay in Cursor backend, not the agent VM.

### 2.4b Also add to repo `.cursor/mcp.json` (local + team)

```json
"obsidian-petralian-remote": {
  "_comment": "Remote vault via LiveSync+CouchDB. Token in dashboard for cloud; env var locally.",
  "url": "https://vault-mcp.petralian.com/mcp",
  "headers": {
    "Authorization": "Bearer ${env:OBSIDIAN_MCP_TOKEN}"
  }
}
```

Keep local `petralian-obsidian` stdio MCP for fast native `D:\` access at desk. Cloud uses the remote URL.

### 2.5 Smoke test

**From cloud agent chat:**
> Read `Operations/AI Session Bridge.md` via obsidian MCP and summarize current priority.

**From local agent:**
> Same — confirm both local stdio and remote HTTP work.

### 2.6 Update session protocol

When MCP is live, cloud agents can follow full session protocol:
- Read Bridge, Summaries, Features via MCP
- Append session notes via `obsidian_append`
- No git mirror required for day-to-day ops

---

## Phase 2b — Vault git mirror (fallback / backup)

Use **in addition to MCP** if you want version history in GitHub, or if MCP setup is blocked.

### Option A — private `petralian/vault-petralian` mirror

Ops subset only; Obsidian remains canonical at desk.

```powershell
cd "D:\Obsidian\Obsidian\40_VSCode\Petralian"
# git init, remote, .gitignore Blog/01 Drafts/, push Operations/ + Features/
```

See git commands in previous revision or Obsidian Git plugin for auto-commit.

**When to use:** audit trail, PR review of ops notes, offline cloud if MCP is down.

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
□ Phase 2 MCP (priority): confirm LiveSync → CouchDB on VPS
□ Wire obsidian-sync-mcp: env vars, nginx vault-mcp.petralian.com, MCP_AUTH_TOKEN
□ Register HTTP MCP in Cursor Dashboard → Integrations & MCP (cloud agents)
□ Add obsidian-petralian-remote to .cursor/mcp.json (local uses OBSIDIAN_MCP_TOKEN env)
□ Smoke test: cloud agent reads Operations/AI Session Bridge.md via MCP
□ Create private petralian/ops with services.yaml + secrets.manifest.yaml
□ Snapshot /opt/sitemonitor → petralian/sitemonitor repo + deploy workflow
□ GitHub Environment production with shared BREVO_API_KEY
□ Cursor Cloud: repositoryDependencies (ops, sitemonitor)
□ Optional fallback: petralian/vault-petralian git mirror for audit trail
□ Vault: append Session Summaries entry linking this handoff when MCP is live
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
