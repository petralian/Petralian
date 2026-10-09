# Obsidian MCP: vault git pull and attachments

## Two MCP servers (do not confuse them)

| Server | Where it runs | Cloud agent |
|--------|----------------|-------------|
| **Nate Obsidian** (Dashboard) | Your PC when Obsidian MCP bridge is up | Yes — `edit_note`, `browse_vault`, markdown |
| **petralian-obsidian-mcp** (`scripts/obsidian-mcp-server.mjs`) | Local Cursor on 4090 box | Only if you add it to MCP config while online |

**Nate Obsidian** is maintained by Cursor/Obsidian; this repo cannot patch it. **`petralian-obsidian-mcp`** is yours; we added:

- `obsidian_git_pull` — `git pull --ff-only origin master` in `40_VSCode/Petralian`
- `obsidian_write_attachment` — write bytes under `Blog/**/Attachments/` from base64

## Sleep / offline 4090

When the PC sleeps, **no MCP reaches the vault**. That is expected.

| Phase | What works |
|-------|------------|
| PC asleep | Cloud agents commit/merge **`petralian-private`** on GitHub only |
| PC awake, Obsidian open | Nate Obsidian markdown sync; optional **Obsidian Git pull on startup** catches binaries |
| PC awake, local Cursor + petralian MCP | Agent (or you) can call `obsidian_git_pull` or `obsidian_write_attachment` |

A self-hosted GitHub runner on the 4090 has the **same sleep problem** — not a substitute for always-on infra.

**Sleep-safe catch-up:** Obsidian Git → **Pull on startup** (one-time setting). After wake, attachments from overnight agent merges appear without a manual pull habit.

## Desk CLI

```powershell
node scripts/obsidian-mcp-cli.mjs git-pull master
node scripts/obsidian-mcp-cli.mjs write-attachment "Blog/01 Drafts/Attachments/slug.avif" --file D:\path\to\slug.avif
```

## Cloud agent workflow (when Nate Obsidian is online)

1. Merge images to `petralian-private` `master`.
2. MCP markdown sync on drafts.
3. **If** `petralian-obsidian-mcp` is wired on an awake machine: `obsidian_git_pull` then `browse_vault` verify.
4. **Else:** rely on pull-on-startup; verify attachments next session.

To get `git_pull` on **Nate Obsidian** for cloud-only sessions, request it from Cursor (same behavior as `obsidian_git_pull` here).
