---
title: How I Run Cursor With One Obsidian Brain Across Many Projects
slug: cursor-obsidian-brain-handbook-2026
date: 2026-07-08T00:00:00.000Z
tags:
  - Obsidian
  - Agentic AI
  - Enterprise AI
  - AI Memory
  - Playbook
excerpt: >-
  I stopped copying AI rules into every engagement. One Brain vault, native file
  reads, hooks, and a sync script align personal site, Shopify app, job
  applications, and client work — one memory system for program delivery.
featured_image: /images/posts/cursor-obsidian-brain-handbook-2026.png
featured_image_alt: "Desk with one labeled Obsidian notebook feeding multiple project"
focus_keyword: Cursor Obsidian multi project setup
seo_description: >-
  Run Cursor with one Obsidian Brain across many projects: personal site,
  Shopify app, job applications, and client engagements. Workspaces, native
  reads,…
related_posts:
  - three-layer-external-brain-for-ai-first-development
  - cursor-lightweight-harness-without-microservice-2026
  - vscode-copilot-to-cursor-what-changed-in-my-ai-workflow
  - why-file-memory-beats-the-three-layer-diagram-for-builders
image_prompt: >-
  Editorial 16:9 overhead desk: one thick Obsidian-style notebook labeled Brain
  with arrows to five slim repo folders on a laptop, copper accent light, no
  logos, no readable text, no faces.
image_prompt_variant_1: >-
  Isometric 16:9: central vault cube with sync arrows to repo blocks, hook icons
  as small gate cards, teal and slate risograph texture, no readable text.
image_prompt_variant_2: >-
  Split scene 16:9: left chaotic duplicate sticky notes per repo; right single
  hub note with clean workspace windows, professional contrast, no logos.
format: hybrid
best_for: >-
  Anyone running Cursor across multiple contexts who wants one external memory
  system without rebuilding rules per folder
seo_title: How I Run Cursor With One Obsidian Brain Across Many…
---

## How do I run Cursor with one Obsidian Brain across many projects?

**Who it is for:** **Anyone** running Cursor across **multiple projects** who is tired of re-teaching the agent every switch — personal site, coursework, Shopify app, job search, client work, side tools — and wants one Brain that travels with you.

**What you will learn:** one Brain vault, native file reads on a local drive, hooks, a sync script, and when MCP is optional. Code-heavy readers get one labeled implementation block; everyone else gets the portable Path A at the end.

This is **memory governance for AI work** at human scale: one canonical rulebook, thin project notes, mechanical sync — the same pattern whether the output is a blog post, a merchant playbook, or a deploy.

I stopped copying AI rules into every folder. One Brain vault, native reads, hooks for session habits, and a sync script keep **Petralian (personal site), Vouch (Shopify app), job-application workspaces, client engagements, and open-source tools** aligned without routing every read through MCP.

> **Companion (in my vault):** Cursor User Handbook — daily workflow for humans  
> **Memory model:** [Three layers of external memory](/posts/three-layer-external-brain-for-ai-first-development)  
> **Harness framing:** [Lightweight harness in Cursor](/posts/cursor-lightweight-harness-without-microservice-2026)

## The problem I was tired of fixing

Every time I opened a different project, the agent behaved like it had never met me. Session footers were wrong. Deploy or publish rules lived in three places. I pasted the same Start of Session prompt until my thumbs hurt. When I fixed something for one client or engagement, the others drifted.

The failure mode was not the model. It was **memory architecture**: no single source of truth, no feedback loop from vault to IDE, and too much faith in chat context — whether the engagement is a site deploy, a Shopify app, or client delivery.

## What I built instead

I run **one universal Brain vault** (conventions, templates, session prompts) plus thin **project vaults** (features, sessions, deploy or publish notes). Work lives in normal folders on disk — git repos for code, Obsidian vaults for applications, client work, and writing. Cursor opens **one project per window** via a `.code-workspace` file when the surface is a repo; for vault-only work I still use one window per major engagement so rules resolve cleanly.

Agents read Brain and project notes with **native file tools** (`Read` / `Grep` on absolute paths under my vault folder). When the vault sits on the same machine as the repos, that is faster and more reliable than routing every read through an Obsidian MCP server. I still keep a brain MCP entry in `~/.cursor/mcp.json` as a fallback for writes and edge cases, but daily work does not depend on it.

**Rules** (`.cursor/rules/*.mdc`) encode footer shape and session protocol. **User hooks** (`~/.cursor/hooks.json`) inject bootstrap context at session start and validate footers after each reply. **Skills and slash commands** (`/start-session`, `/end-session`, `/writing-session`) cover the long breaks. A **sync script** copies Brain templates into every manifest repo when I change the canonical copy.

That is the whole loop: edit once in Brain → sync → reload Cursor → every repo matches.

### Example implementation — my stack

| Piece | How I run it |
|-------|----------------|
| Brain vault | `~/Obsidian/Brain/` — universal methodology, footer contract, templates |
| Project vaults | `~/Obsidian/projects/<name>/` — features, Bridge, session notes (per engagement) |
| Code repos | `~/code/<repo>/` — e.g. personal site, Shopify app, open-source tools |
| Non-repo engagements | Job-application vaults and client work — same Brain rules, no public names in blog copy |
| Workspaces | `<Project>.code-workspace` at repo root when the project is a git repo |
| Vault reads | Native `Read` / `Grep` on `~/Obsidian/...` when vault and IDE share one machine |
| Sync | `~/Obsidian/Brain/scripts/sync-cursor-stack.ps1` + manifest `cursor-projects.json` |
| Exception | One larger app repo keeps extra brain-pack tiers and a prep script; that detail stays in that project vault, not copied into Brain |

Paths are illustrative — map `~/Obsidian` and `~/code` to wherever your vault and repos actually live.

## Daily workflow (what I actually do)

1. Open the workspace for the engagement I am on (e.g. `Petralian.code-workspace` for the personal site, `Vouch.code-workspace` for the Shopify app, or a vault folder for job-application or client work).
2. Start Agent chat. Hooks run; I do not paste Start of Session unless I have been away for weeks or something is broken.
3. Type the task. The agent reads vault files from disk when it needs context.
4. Scan the reply footer — every work reply should declare a **Mode** (A through G) and numbered fields. If it does not, I say so immediately.
5. Optional end of day: `/end-session` or ask for End of Session vault updates.

This is boring on purpose. Boring means I am not debugging the harness during a deploy.

## What is wired in Cursor (example implementation)

Technical inventory for readers who operate the stack — one block; the portable pattern is Path A below.

| Layer | Location | Role |
|-------|----------|------|
| Footer + session rules | Each repo `.cursor/rules/` | Always-on agent behavior |
| User hooks | `~/.cursor/hooks.json` | Bootstrap + footer validation |
| Skills | `~/.cursor/skills/` | Session start/end, writing sessions |
| Commands | `~/.cursor/commands/` | Same flows, slash-invoked |
| Subagents | `~/.cursor/agents/` | Vault writer, code reviewer, footer auditor |
| Project skill | e.g. `example-repo/.cursor/skills/publish-site/` | Repo-specific publish path |
| Workspaces | `<Repo>.code-workspace` | One window, one repo |

One larger app repo is the exception: it keeps extra brain-pack tiers and a session prep script because that surface area demands it. The universal flow lives in Brain; app-specific detail stays in that project vault, not duplicated across Brain.

## Native reads vs MCP (the correction worth making)

Early docs in my vault said “vault via MCP” everywhere. That made sense when MCP felt like the only bridge. When the **vault and repos share one local machine**, native reads are the better default.

| Action | What I use |
|--------|------------|
| Read Brain / project vault | Native `Read` / `Grep` on absolute paths |
| Write vault notes | Native `Write` or MCP |
| Repo code | Native workspace tools |
| Library docs | Context7 / Serena per repo `TOKEN-STACK` |

If your vault is on the same machine as Cursor, try native reads first. Reserve MCP for remote vaults, mobile-only workflows, or tools that truly require it.

## The sync loop (how Brain changes reach every repo)

Canonical templates live under `Brain/Templates/cursor/` in my vault. When I change footer rules or session protocol:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "~/Obsidian/Brain/scripts/sync-cursor-stack.ps1"
```

Then **reload the Cursor window** and confirm **Customize → Hooks** lists `sessionStart` and `afterAgentResponse`.

Manifest file `cursor-projects.json` defines full-tier repos (full protocol) and light-tier repos (lighter bootstrap). Add a repo to the manifest once; the script handles the copy.

## Path A — if you do not have my exact stack

You do not need ten repos or a fixed drive letter. The portable pieces:

1. **One canonical folder** for universal agent rules (footer contract, session habits).
2. **Thin per-project notes** — features and publish/deploy truth, not duplicated methodology.
3. **One Cursor window per major project** — rules resolve cleanly (repo or vault).
4. **A sync or copy step** when canonical rules change (script, symlink, or shared `packages/agent-rules`).
5. **Hooks or a fixed rule** so footers and bootstrap are not optional memory.

Start with footer shape + session start/end files. Add hooks when copy-paste fatigue returns. Add MCP only if native reads are impossible. Steps 1–2 and 5 alone deliver consistent briefs, research packs, and session handoffs without a full repo setup.

## What I would not do again

- Duplicate Response Footer Contract into every project vault.
- Multi-root workspaces with vault + code unless you enjoy ambiguous rule precedence.
- Assume MCP is required for every vault read on a local disk.
- Bury evergreen truth in session logs instead of updating feature notes (Zettelkasten discipline applies to the vault agents read).

## Where this sits in the larger memory model

This post is **Layer 4** in practice: Brain templates → repo rules → hooks → git. The [three-layer diagram](/posts/three-layer-external-brain-for-ai-first-development) explains session vs operational vs evergreen notes. This handbook is the **IDE wiring** on top — how Cursor actually loads and enforces that memory.

## Next for me

- Smoke-test hooks after each Brain template change (footer Mode line visible in new chat).
- Optional: retire light-tier `session-bootstrap-snapshot.mdc` if hooks stay stable for two weeks.

The short human version (daily workflow, footer recovery phrases, profiles vs workspaces) lives in my Brain vault under **Operations → Cursor User Handbook**, linked from `_Home` so agents and I land on the same page.
*If you're new to Cursor: [50% off your first month](https://cursor.com/referral?code=JP5ARNKSFI2Q) (code `JP5ARNKSFI2Q`). I may earn usage credits; install directly if you prefer.*
