# Obsidian access for cloud agents (read/write)

## What the repo does **not** do

Cloud agents **cannot** turn on Obsidian MCP for you from git alone. These are **desk-only** in `.cursor/mcp.json`:

- `petralian-obsidian` → `scripts/obsidian-mcp-server.mjs` on `D:\Obsidian\…`

There is no `D:\` on the cloud VM.

## What you enable in **Cursor Dashboard** (cloud + iPhone)

1. Open [Cursor Dashboard → Integrations / MCP](https://cursor.com/dashboard).
2. Add **Obsidian** (official URL / hosted MCP) per Cursor’s current Obsidian integration docs.
3. Sign in with the same Obsidian account that syncs your **Petralian** vault.
4. Save. New **cloud agents** on `petralian/Petralian` can then use Obsidian MCP tools for **full vault** read/write (not only the git mirror).

## Fallback without Obsidian MCP (already working)

| Source | Path in cloud workspace |
|--------|-------------------------|
| Git mirror stub/real | `fleet-repos/vault-petralian/Operations/…` |
| In-repo bundle | `cloud-bundle/vault-mirror/Operations/…` |
| Repo memory | `memories/repo/open-loops.md` |

Run `scripts/local-phase-b-vault-mirror.ps1` on your PC and push **`vault-petralian`** so the mirror matches desk.

## Optional stdio MCP on clone (not required)

See `docs/ops/cloud-continuity-handoff.md` — `@modelcontextprotocol/server-filesystem` on `fleet-repos/vault-petralian`. Native `Read`/`Write` in the agent is usually enough on cloud.
