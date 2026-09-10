# Cloud continuity — final handoff (official Obsidian Sync)

> **Updated:** 2026-09-10  
> **Sync:** Official **Obsidian Sync** (retired self-hosted CouchDB / LiveSync on VPS)  
> **Copy-paste for local agent:** `docs/ops/LOCAL-AGENT-INSTRUCTIONS.md`

---

## Facts (do not contradict)

| Topic | Truth |
|-------|--------|
| Obsidian sync | **Official Obsidian Sync** — app-to-app only, **no API** |
| CouchDB on VPS | **Retired** — `obsidiansync-couchdb` + `obsidian-sync-mcp` are legacy; decommission |
| Remote Obsidian MCP via CouchDB | **Not applicable** — do not wire `vault-mcp.petralian.com` to CouchDB |
| Cloud / iPhone vault access | **Private git mirror** (`petralian/vault-petralian`) + Cursor `repositoryDependencies` |
| At desk | Native `D:\Obsidian\...` + local stdio MCP (`petralian-obsidian`) |
| Code + fleet map | `petralian/ops`, `petralian/sitemonitor`, `petralian/Petralian` |

---

## Target architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Desk: Obsidian (canonical) ←→ Official Obsidian Sync        │
│        Cursor desktop + D:\ vault + petralian-obsidian MCP   │
└────────────────────────┬─────────────────────────────────────┘
                         │ Obsidian Git plugin (or end-of-session push)
                         ▼
              ┌─────────────────────────────┐
              │ petralian/vault-petralian  │  private git — ops subset only
              │ Operations/, Features/, _MOC │
              └──────────────┬──────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
petralian/ops          petralian/Petralian    petralian/sitemonitor
(services.yaml)        (site)                 (mon.petralian.com)
     │                       │                       │
     └───────────────────────┴───────────────────────┘
                             ▼
              ┌──────────────────────────────┐
              │ Cursor Cloud + iPhone agents  │
              │ repositoryDependencies: all 4 │
              │ GitHub Environment secrets    │
              └──────────────────────────────┘
```

**MCP on iPhone / cloud:** URL-based servers only (e.g. OpenSEO). Vault is **not** MCP — cloud agents **read the git clone** of `vault-petralian`.

---

## Phase 0 — Retire legacy CouchDB stack (VPS)

```bash
# SSH VPS — find compose dir first
docker inspect obsidian-sync-mcp --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' 2>/dev/null
docker inspect obsidiansync-couchdb --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' 2>/dev/null

# Stop and remove (after confirming no vault depends on it)
cd <compose-dir>   # e.g. /opt/obsidian-sync
docker compose down -v   # -v only if you have backup / Obsidian Sync is sole source

# Optional: remove nginx vhost if vault-mcp was added
# aaPanel → delete vault-mcp.petralian.com site if exists
```

Document in `petralian/ops/services.yaml`:

```yaml
obsidian_sync:
  type: official_obsidian_sync
  note: "No VPS component. Cloud reads petralian/vault-petralian git mirror."
  retired:
    - obsidiansync-couchdb
    - obsidian-sync-mcp
```

---

## Phase 1 — `petralian/vault-petralian` (private git mirror)

**Purpose:** Cloud agents + iPhone-driven cloud agents read Bridge, Features, session notes.

### 1.1 Scope (mirror only)

```
Operations/
  AI Session Bridge.md
  Session Summaries.md
  Open Loops.md
  Sessions/          # optional: rolling window
Features/
_Home.md
_MOC.md
```

**Exclude:** `Blog/01 Drafts/`, `Blog/02 Ready to publish/`, `.obsidian/workspace*`, `.trash/`

### 1.2 One-time setup (PowerShell at desk)

```powershell
cd "D:\Obsidian\Obsidian\40_VSCode\Petralian"

# If not already a git repo for mirror — use a subdirectory or separate clone strategy.
# Recommended: init git IN the vault with careful .gitignore (Obsidian Git plugin does this)

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

### 1.3 Obsidian Git plugin (recommended habit)

1. Install **Obsidian Git** in Petralian vault.
2. Settings → auto-commit interval (e.g. 10–30 min) **or** commit on idle.
3. **Split repos:** If Brain vault also needs mirror later, use separate remote `petralian/vault-brain` — start with Petralian project vault only.

### 1.4 End-of-session rule (manual fallback)

If not using auto-commit: before closing Cursor → `git add Operations/ Features/` → `git commit` → `git push`.

---

## Phase 2 — `petralian/ops` (private fleet map)

Create `github.com/petralian/ops` with:

**`services.yaml`** — see `LOCAL-AGENT-INSTRUCTIONS.md` for full template.

**`secrets.manifest.yaml`** — names only; `BREVO_API_KEY` shared by petralian + sitemonitor.

Link from `memories/repo/index.md` and `AGENTS.md`.

---

## Phase 3 — `petralian/sitemonitor` (private app repo)

Snapshot `/opt/sitemonitor` (+ local `.website-monitor/` if present) → git repo.

Deploy: GitHub Actions SSH → `git pull` → `docker compose up -d`.

Shared `BREVO_API_KEY` from GitHub Environment `production` — never hand-copy to VPS `.env` again.

**Already shipped:** `scripts/fix-website-monitor-emails.sh` on Petralian deploy (symptom fix until repo owns deploy).

---

## Phase 4 — Cursor Cloud environment

Dashboard or commit `.cursor/environment.json`:

```json
{
  "name": "Petralian fleet",
  "install": "npm ci",
  "repositoryDependencies": [
    "github.com/petralian/ops",
    "github.com/petralian/vault-petralian",
    "github.com/petralian/sitemonitor",
    "github.com/petralian/Petralian"
  ]
}
```

Grant the Cloud environment access to all four private repos.

### Cloud bootstrap (add to `AGENTS.md`)

```markdown
## Cloud bootstrap (no D:\ vault)
1. Read `services.yaml` from cloned `ops` dependency
2. Read `Operations/AI Session Bridge.md` from cloned `vault-petralian` dependency
3. Read `memories/repo/open-loops.md` in Petralian repo (machine fallback)
4. SiteMonitor code: `sitemonitor` repo — not `.website-monitor/` in Petralian
5. Do not use CouchDB or obsidian-sync-mcp — retired; official Obsidian Sync has no API
```

### Optional: cloud stdio MCP on git clone

If you want MCP tool names on cloud (not required — native `Read` works):

```json
"obsidian-vault-clone": {
  "command": "npx",
  "args": [
    "-y", "@modelcontextprotocol/server-filesystem",
    "${workspaceFolder}/../vault-petralian"
  ]
}
```

Only after `repositoryDependencies` places `vault-petralian` beside Petralian in the cloud workspace. **Desktop keeps** `petralian-obsidian` → `scripts/obsidian-mcp-server.mjs` for live `D:\` vault.

---

## Phase 5 — GitHub Environment `production`

Secrets: `BREVO_API_KEY`, `CRON_SECRET`, `UNSUBSCRIBE_SECRET`, `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Both `deploy-vps.yml` and `deploy-sitemonitor.yml` use `environment: production`.

---

## MCP cheat sheet (desk vs cloud vs iPhone)

| Server | Transport | Desk | Cloud | iPhone |
|--------|-----------|------|-------|--------|
| OpenSEO | URL | ✅ | ✅ | ✅ |
| Context7 | stdio | ✅ | ❌ | ❌ |
| Serena | stdio | ✅ | ❌ | ❌ |
| petralian-obsidian | stdio → `D:\` | ✅ | ❌ | ❌ |
| vault-petralian | **git clone + Read** | via push | ✅ | ✅ (via cloud agent) |

Register **URL MCPs** in **Cursor Dashboard → Integrations & MCP** for mobile/cloud (see [Cursor MCP docs](https://cursor.com/docs/context/mcp)).

---

## Session context (2026-09-10)

- SiteMonitor emails fixed: stale `BREVO_API_KEY` in `/opt/sitemonitor` Docker; deploy hook `scripts/fix-website-monitor-emails.sh`.
- CouchDB / self-hosted LiveSync **retired** — user on official Obsidian Sync.
- Cloud continuity = **git mirror + ops repo + sitemonitor repo**, not CouchDB MCP.
