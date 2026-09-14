# Obsidian access for cloud agents (read/write)

## “Obsidian” is not in Cursor **Plugins**

The [Plugins](https://cursor.com/dashboard/plugins) marketplace search will show **No Plugins** for Obsidian — that is normal. Vault access is **not** installed from Plugins.

## What works today (no Obsidian MCP)

| Source | Path in cloud workspace |
|--------|-------------------------|
| Git mirror (stub or real) | `fleet-repos/vault-petralian/Operations/…` |
| In-repo bundle | `cloud-bundle/vault-mirror/Operations/…` |
| Repo memory | `memories/repo/open-loops.md` |

Push real vault ops from desk: `scripts/local-phase-b-vault-mirror.ps1` → `petralian/vault-petralian` (private repo).

## Workarounds for fuller vault on cloud

### A — Git mirror (recommended, already wired)

1. Private repo **`petralian/vault-petralian`** (not public Petralian site repo).
2. Obsidian Git on your PC pushes `Operations/`, `Features/`, etc.
3. Cloud install script clones into `fleet-repos/vault-petralian/`.
4. Agents use normal **Read/Write** on those paths — no MCP required.

### B — Filesystem MCP on the clone (optional)

In **Cursor → Settings → MCP** (desktop) or project MCP config, add a stdio server pointing at the clone path after build:

```json
"vault-clone": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace/fleet-repos/vault-petralian"]
}
```

Cloud agents may expose MCP from **Dashboard → Integrations** when Cursor adds/supports project MCP for cloud — check **Integrations**, not Plugins.

### C — Obsidian Official Sync

There is **no API** for agents to read your full synced vault remotely. Sync stays on devices; **git mirror** is the cloud bridge.

## Notion instead?

**No** — for your setup (long-form blog drafts, D2 diagrams, Official Sync, git mirror). Notion adds another silo and weakens the Obsidian → git → cloud path you already built.

**Straightforward path:** stay on Obsidian on desk → run `scripts/local-phase-b-vault-mirror.ps1` → push **`petralian/vault-petralian`** (private) → cloud agents read `fleet-repos/vault-petralian/`. No Plugins MCP required.

## Desk (unchanged)

Native `D:\Obsidian\…` paths — see `docs/TOKEN-STACK.md`. On desk, open **Cursor Settings → MCP** only if you want OpenSEO etc.; vault I/O stays native file tools.
