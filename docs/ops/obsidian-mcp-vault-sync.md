# Obsidian MCP: vault git pull and attachments

## Two MCP servers (do not confuse them)

| Server | Where it runs | Cloud agent |
|--------|----------------|-------------|
| **Nate Obsidian** (Dashboard) | **VPS** `obsidian-mcp.petralian.com` — [jclement/obsidian-mcp](https://github.com/jclement/obsidian-mcp) | Yes — `edit_note`, `browse_vault`, markdown |
| **petralian-obsidian-mcp** (`scripts/obsidian-mcp-server.mjs`) | Optional desk Cursor on 4090 | Local only |

Vault files on the server live at `/opt/obsidian-mcp/data/Vault/` (bind mount). They sync **to your PC** via official Obsidian Sync when the desktop is on; they do **not** auto-track `petralian-private` until CI or a script copies attachments in.

**Draft CI mirror:** `petralian-private` workflow `sync-obsidian-mcp-attachments.yml` tar-extracts the full `Blog/01 Drafts/` tree (markdown + attachments) into the vault on every `master` push or manual `workflow_dispatch`. Needs `VPS_*` secrets on the private repo. See `petralian-private/scripts/OBSIDIAN-MCP-VPS-SYNC.md` (no fork of jclement/obsidian-mcp required).

**Optional fork** of jclement/obsidian-mcp only if you need native `git_pull` / `write_attachment` on the hosted MCP without a GitHub push. Desk `petralian-obsidian-mcp` already has:

- `obsidian_git_pull` — `git pull --ff-only origin master` in `40_VSCode/Petralian`
- `obsidian_write_attachment` — write bytes under `Blog/**/Attachments/` from base64

## Sleep / offline 4090

Cloud **Nate Obsidian** stays up on the **VPS** while the 4090 sleeps. Agents can still edit vault markdown and (after CI) see attachments via `browse_vault`.

| Phase | What works |
|-------|------------|
| PC asleep | GitHub merge + **VPS attachment sync workflow** → obsidian-mcp vault |
| PC awake | Obsidian Sync pulls VPS/desktop vault changes to D: |
| Desk only | `petralian-obsidian-mcp` `git_pull` / `write_attachment` on `D:\…\Petralian` |

**Automation:** `petralian/Petralian` workflow `sync-obsidian-drafts-vault.yml` (VPS secrets + `PETRALIAN_PRIVATE_READ_TOKEN`). Optionally copy `VPS_*` to **`petralian-private`** so its workflow runs on every draft push. Cloud agents can run `petralian-private/scripts/cloud-sync-drafts-to-vps.sh` when Actions secrets are missing.

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
