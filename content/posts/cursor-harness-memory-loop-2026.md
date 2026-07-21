---
title: 'Agent Harness Memory Loop — Four Tiers, Feedback Loop, and Load Gates'
slug: cursor-harness-memory-loop-2026
date: 2026-07-04T00:00:00.000Z
tags:
  - Agentic AI
  - AI Memory
  - Obsidian
  - Playbook
excerpt: >-
  External memory is four tiers in practice — short-term, operational,
  evergreen, and a feedback loop hardened into rules and footers. The harness
  gates when each tier loads so you keep control without token bloat.
featured_image: /images/posts/cursor-harness-memory-loop-2026.png
focus_keyword: Cursor agent harness memory loop
seo_description: >-
  How to gate four tiers of external memory in Cursor — operational, evergreen,
  and feedback loop layers — without loading brain-pack on every question.
  Aligns…
series: Cursor Agent Harness Series
series_order: 2
related_posts:
  - cursor-lightweight-harness-without-microservice-2026
  - three-layer-external-brain-for-ai-first-development
  - why-deliberate-file-memory-beats-hoping-agents-remember
  - external-memory-series-guide
image_prompt: >-
  Cinematic 16:9: three translucent drawers labeled Repo, Brain-Pack, Vault on a
  steel desk with one gate lever in front, cool side light, no readable text, no
  faces.
image_prompt_variant_1: >-
  Surreal 16:9 library: hot warm cold shelves as colored bands, a single
  turnstile before the reading desk, indigo and copper, no logos.
image_prompt_variant_2: >-
  Bold isometric 16:9: stacked memory layers with one arrow through a gate card
  Mode A Skip, risograph teal and cream, no text.
featured_image_alt: 'Cinematic 16:9: three translucent drawers labeled Repo, Brain-Pack,'
format: hands-on
best_for: >-
  Practice leads connecting file memory, Obsidian, and agent loops across
  engagements
seo_title: 'Agent Harness Memory Loop — Four Tiers, Feedback Loop, and…'
---
**TL;DR**

- External memory is four tiers in practice — short-term, operational, evergreen, and a feedback loop hardened into rules and footers.
- The harness gates when each tier loads so you keep control without token bloat.



> **Series:** Cursor Agent Harness (Part 2 of 3)  
> **Part 1:** [Lightweight harness without a microservice](/posts/cursor-lightweight-harness-without-microservice-2026) — you keep model and mode control  
> **Memory foundation:** [Four tiers of external memory](/posts/three-layer-external-brain-for-ai-first-development) · [External Memory series hub](/posts/external-memory-series-guide) · [Governance layer](/posts/why-deliberate-file-memory-beats-hoping-agents-remember)

## What is the harness memory loop?

The **harness memory loop** is how a Cursor agent harness **gates when each memory tier loads**—short-term chat, operational handoffs, evergreen docs, and feedback hardened into rules—so you keep control without pasting 14k tokens on every question.

**Who it is for:** practice leads and operators who already use Obsidian, handoff files, or session summaries and want those files to load on governed work, skip on quick Q&A, and write back at session end.

**What you will learn:** the four-tier map (including Layer 4 feedback), which tier lives in git vs vault, and how session summary lines feed the CSV in [Part 3](/posts/cursor-harness-measurement-2026).

---

## The problem: memory everywhere means tokens everywhere

External memory works when agents read the same files in the same order every session. It fails when every tier loads on every turn: vault Session Summaries, brain-pack gotchas, MCP Obsidian reads, and subagents each re-embedding 14k tokens for a question that needed one paragraph.

The harness from Part 1 is not only when to spawn subagents. It is **when to load which memory tier** — while **you** still own the files, the model choice, and the ship decision.

## Why four tiers (not three)

The [External Memory Series](/posts/external-memory-series-guide) describes the stack as three layers for clarity. In practice there are **four tiers** — and the fourth is the one most diagrams label "feedback loop."

| Tier | Name | What it holds | Harness load gate |
|------|------|---------------|-------------------|
| **Layer 1** | Short-term | Current chat, open files, git diff | Always in context — don't duplicate in brain-pack |
| **Layer 2** | Operational | Session Summaries, Bridge, `NEXT_SESSION.md`, `memories/repo/*`, bootstrap snapshot | **Once** at session start for code work; **skip** for Mode A Q&A |
| **Layer 3** | Evergreen | `Features/*`, `Architecture/*`, shared conventions | On demand for the task area — not every turn |
| **Layer 4** | Feedback hardened | Rules, custom agents, hooks, footer contract, `eval:gate` | **Write** at session end; **read** via `alwaysApply` rules — not a 14k paste |

Layer 4 is not another folder to grep. It is the [Session Continuity System](/posts/why-deliberate-file-memory-beats-hoping-agents-remember) made concrete: session context at the top, v3.1 footer at the bottom, self-improvements with an exact file path, and hooks that regenerate `brain-pack.md` without you re-explaining gotchas every chat.

**brain-pack** is a **warm embed** — mostly Layer 2 facts plus pointers into Layer 3. It is not a substitute for Layer 4. The harness prevents treating brain-pack as "load everything always."

```d2
direction: right

L1: "Layer 1 — Short term" {
  grid-columns: 2
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8

  CHAT: "Agent chat"
  LIVE: "Workspace /\ngit state"
}

L2: "Layer 2 — Operational" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  SUM: "Session\nSummaries"
  MEM: "memories/repo"
  PACK: "brain-pack\n(embed)"
}

L3: "Layer 3 — Evergreen" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  FEAT: "Features/*"
  BRAIN: "Shared\nconventions"
}

L4: "Layer 4 — Feedback" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  RULES: "Rules +\nfooter"
  HOOKS: "Hooks +\neval:gate"
}

GATE: "Harness gate\n(Part 1 policy)" {
  style.fill: "#e8f4f8"
  style.stroke: "#4a90a4"
  style.border-radius: 8
}

GATE -> L2: "code session\nonce" {
  style.stroke: "#ff6a3d"
}
GATE -> L3: "on demand" {
  style.stroke: "#696d84"
  style.stroke-dash: 8
}
L2 -> L4: "session end\nwrites" {
  style.stroke: "#ff6a3d"
}
L4 -> L1: "rules +\nagents" {
  style.stroke: "#696d84"
  style.stroke-dash: 8
}
```

## How harness gates map to tiers

| Session type | L2 operational | L3 evergreen | L4 feedback | Subagents |
|--------------|----------------|--------------|-------------|-----------|
| Mode A Q&A | Skip brain-pack + vault sweep | Skip unless question needs one Feature | Rules only (`alwaysApply`) | No |
| Code work | brain-pack once; Bridge/Summaries on demand | Read relevant `Features/*` | Footer Mode C–D at ship | Per policy table |
| Plan-only | Lighter bootstrap (Mode B footer) | IDN before first edit if 3+ files | No deploy fields | No batch for single scope |

**You stay in control:** the gates are defaults the agent follows. Override with plain language ("skip vault," "read Features/Referrals only," "inline this, no batch").

**Rule of thumb:** native `Read`/`Grep` on vault paths you already have locally. Do not stack MCP + native Read on the same file in one turn.

## Git vs Obsidian vs feedback (Layer 4)

| Content | Tier | Canonical home |
|---------|------|----------------|
| HARNESS-POLICY, eval JSON, CSV schema | L4 + git | `docs/` in repo |
| Session narrative, open loops | L2 | Obsidian `Operations/*` + `memories/repo/` mirror |
| Features, conventions | L3 | Project vault + shared conventions |
| Rules, agents, hooks, footer contract | L4 | `.cursor/rules/`, `.github/agents/`, `AGENTS.md` |

Harness policy in git versions with the app. Session handoff in Obsidian stays human-readable. **Feedback loop** = lessons that graduate into rules (footer **Self-improvements** must cite `path:Lnn` or the write did not happen).

## Additional detail

### Session summary line (Layer 2 → Layer 4 bridge)

Append to `Operations/Session Summaries.md`:

```text
- YYYY-MM-DD HH:MM (Project — **title**) — Harness: direct|batch|test|release; tests_before_ship: yes|no; failure: none|wrong-fix|redeploy; — <outcome>
```

Mirror one row in `docs/harness-session-log.csv` for weekly math (Part 3). The Summary line is Layer 2 narrative; the CSV is Layer 4 instrumentation you review to decide whether to build more orchestration.

```d2
direction: right

START: "Session start" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

GATE: "Harness gate" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  QA: "Mode A"
  CODE: "Code work"
}

L2: "L2 once\nbrain-pack" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

WORK: "Implement\n(you approve)" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

L4: "L4 write\nfooter + rules" {
  style.fill: "#e8f4f8"
  style.stroke: "#4a90a4"
  style.border-radius: 8
}

START -> GATE
GATE.QA -> WORK
GATE.CODE -> L2 -> WORK -> L4
```

### Enable this on another repo

1. Copy `context-budget.mdc` and `HARNESS-POLICY.md` from your reference repo.
2. Point `sessionStart` at your `session-prep` script; generate brain-pack from `memories/repo/`.
3. One Obsidian vault root per project in MCP or native Read.
4. Teach agents: Mode A skips bootstrap; ship sessions write one Summary line.

### Reference

### Quick reference: memory tiers and gates

| Tier | Name | Example content | Harness gate |
|------|------|-----------------|--------------|
| L1 | Short-term | Chat, open files, git diff | Always in context—do not duplicate in brain-pack |
| L2 | Operational | Session Summaries, `memories/repo/*`, brain-pack | **Once** at code session start; **skip** Mode A |
| L3 | Evergreen | `Features/*`, architecture notes | On demand for task area |
| L4 | Feedback | Rules, hooks, footer, `eval:gate` | Write at session end; read via `alwaysApply` rules |

| Session type | L2 | L3 | L4 | Subagents |
|--------------|----|----|-----|-----------|
| Mode A Q&A | Skip | Skip unless one Feature needed | Rules only | No |
| Code work | brain-pack once | Relevant Features | Footer Mode C–D at ship | Per policy table |
| Plan-only | Lighter bootstrap | IDN if 3+ files | No deploy fields | No batch for single scope |

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|--------------|-----|
| Treating brain-pack as "load everything" | Token bloat every turn | brain-pack = warm L2 embed + L3 pointers, not full vault |
| MCP + native Read on same vault file | Double context in one turn | Pick one path per file per turn |
| Skipping Layer 4 writes at session end | Lessons stay in chat only | Footer **Self-improvements** with `path:Lnn` |
| Loading vault sweep for one-line questions | Mode A becomes expensive | Harness gate: skip L2 bootstrap |
| Confusing L2 narrative with L4 instrumentation | Weekly math gets muddy | Summaries in Obsidian; CSV rows in git ([Part 3](/posts/cursor-harness-measurement-2026)) |
| Expecting agents to "remember" without files | Amnesia every new chat | Four tiers with explicit load gates |

## FAQ

### Is Layer 4 a folder I grep?

**No.** Layer 4 is **feedback hardened**: rules, hooks, footer contract, and CI gates—not another directory to paste into every turn.

### How is this different from the three-layer External Memory diagram?

The series uses **three layers for clarity**; in practice there are **four tiers**—the fourth is the feedback loop (rules + footer + eval). See [External Memory hub](/posts/external-memory-series-guide).

### Can I override a memory gate?

**Yes.** Plain language works: "skip vault," "read Features/Referrals only," "inline this, no batch." Gates are defaults, not locks.

### What goes in git vs Obsidian?

**Git:** `HARNESS-POLICY`, eval JSON, CSV schema. **Obsidian:** session narrative, Bridge, open loops. **Both:** `memories/repo/` mirror where you use it.

### Do I need MCP for vault reads?

**No.** Native `Read`/`Grep` on local vault paths is often faster. MCP is for writes or when the agent cannot see the disk path.

### Reader action

Audit your last five agent sessions. Count how many loaded brain-pack or vault files for questions that needed no code. Map your stack to four tiers — if Layer 4 is only "hope the model remembers," add footer + one rule file before adding another memory product. Part 3 shows how to log and review that discipline weekly.
*If you're new to Cursor: [50% off your first month](https://cursor.com/referral?code=JP5ARNKSFI2Q) (code `JP5ARNKSFI2Q`). I may earn usage credits; install directly if you prefer.*
