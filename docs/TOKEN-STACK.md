# Token stack — Petralian (2026-07-28)

**Routing:** Direct OpenRouter.

## Active MCP (`.cursor/mcp.json`)

| Priority | Server | Use |
|---|---|---|
| P0 | `context7` | Next.js / TinaCMS live docs |
| P1 | `serena` | Symbol-level nav for the site repo |
| P2 | `openseo` | GSC performance + URL inspection, keyword/SERP/backlink research ([setup](https://openseo.so/docs/mcp)) |
| — | `petralian-obsidian` | Vault bridge (fallback; prefer native `Read`/`Write` on `D:\Obsidian\...`) |

### Serena setup

**Config:** `.cursor/mcp.json` → `--project "${workspaceFolder}"` (not a hardcoded `D:\VS Code Projects\...` path).

| Symptom | Fix |
|---------|-----|
| Dashboard: **No projects registered** / **Active Project: None** | Wrong `--project` path — use `${workspaceFolder}`; reload Cursor |
| **Available tools (disabled)** | Project not activated — after reload, agent calls `activate_project` or restart Serena MCP |
| Smoke test | New chat: *"Use Serena get_symbols_overview on src/lib/posts.ts"* |

### Verify Context7 MCP

| Step | Pass criteria |
|------|----------------|
| Reload Cursor | `context7` in MCP list (may show as `project-0-Petralian-context7`) |
| Smoke test | `resolve-library-id` for `Next.js` returns `/vercel/next.js` |

### OpenSEO setup (one-time)

1. **Reload Cursor** after `mcp.json` changes.
2. Approve **OpenSEO login** when Cursor connects to `https://app.openseo.so/mcp`.
3. In [OpenSEO → AI & MCP](https://app.openseo.so/ai): create/select a project for `petralian.com` and connect **Google Search Console**.
4. Optional skills: `npx skills add every-app/open-seo --agent cursor --skill seo-project-setup -y` (or `--skill '*'` for all workflows).

**GSC via OpenSEO:** read-only; no DataForSEO credits. Use for URL inspection batches instead of manual GSC clicks when MCP is connected.

**Paid DataForSEO tools** (keyword volume, SERPs, backlinks): require API key on self-host, or hosted OpenSEO credits — only needed for research workflows, not GSC reads.

### Verify OpenSEO MCP (after auth)

| Step | Pass criteria |
|------|----------------|
| Reload Cursor | `Developer: Reload Window` |
| OAuth | OpenSEO login approved when `openseo` connects |
| GSC | `petralian.com` property linked in [OpenSEO → AI & MCP](https://app.openseo.so/ai) |
| MCP visible | `openseo` appears in Cursor MCP server list (not only in `mcp.json`) |
| Smoke test | New chat: *"List OpenSEO projects and run URL inspection on petralian.com/posts/managed-agent-memory-vs-files-you-control-2026"* |

If auth fails: Cursor **Settings → MCP** → disconnect `openseo` → reconnect.

### Skills installed (repo)

| Skill | Use | Credits |
|-------|-----|---------|
| `seo-project-setup` | Workspace + GSC intake | GSC only |
| `keyword-research` | Intent + target keywords for drafts | DataForSEO if volume/SERP tools used |

**Not installed (add on demand):** `seo-coach`, `keyword-clustering`, `competitive-landscape`, `competitor-analysis`, `link-prospecting`. Install one: `npx skills add every-app/open-seo --agent cursor --skill keyword-clustering -y`. All seven: `--skill '*'`.

**Recommendation:** stay **lean** until GSC MCP is verified; add `keyword-clustering` before the next multi-post publish batch if you want cannibalization checks across `01 Drafts`.
