# Fleet / continuity phase status (2026-09-14)

| Phase | Status | Owner / blocker |
|-------|--------|-----------------|
| **0 Inventory** | Done in repo docs | Desk: confirm Hermes domains in `ops/services.yaml` |
| **A Retire CouchDB stack** | **Open** | SSH VPS — `docker compose down` obsidian-sync |
| **B vault-petralian mirror** | **Partial** | Private repo exists; **desk** `local-phase-b-vault-mirror.ps1` + Obsidian Git |
| **C ops repo** | **Done** (bootstrap) | Expand `services.yaml` on desk if inventory changes |
| **D sitemonitor in git** | **Open** | Import `/opt/sitemonitor` from VPS |
| **E GitHub `production` env** | **Open** | Add `BREVO_API_KEY` (+ others) in repo secrets / environment |
| **F Cursor Cloud** | **Done** | Build in progress after install script paste; fleet paths work |
| **F2 Desk MCP cleanup** | **Open** | Desk: native vault I/O per LOCAL-AGENT-INSTRUCTIONS |
| **G Vault write-back** | **Open** | Close loops in Obsidian after above |

## Immediate (email)

1. GitHub secret **`BREVO_API_KEY`** = Brevo key **petralian.com** (suffix `7fWKhP`).
2. Re-run **Fix SiteMonitor emails** after bash fix on `master` (bad substitution fixed).
3. Log must show `valid=yes` for Brevo suffix.

## Public repo

See [`public-repo-safety.md`](public-repo-safety.md) — no keys in git; keep ops/vault/sitemonitor private.
