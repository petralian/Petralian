---
title: 'Cursor Cloud Agent Hooks vs Local Hooks: Two Layers of the Same Harness'
slug: cursor-cloud-hooks-vs-local-hooks-2026
date: 2026-07-22T00:00:00.000Z
tags:
  - Agentic AI
  - Developer Tools
  - Enterprise AI
  - Generative AI
excerpt: >-
  Cloud agent hooks (beforeSubmitPrompt, afterAgentThought, subagentStart) run
  on Cursor's side. Local hooks (sessionStart, afterAgentResponse) run on your
  machine. Here is how I use both.
featured_image: /images/posts/cursor-cloud-hooks-vs-local-hooks-2026.png
focus_keyword: Cursor cloud agent hooks
seo_description: >-
  Cursor cloud hooks vs local hooks: beforeSubmitPrompt, afterAgentThought,
  subagentStart vs sessionStart and afterAgentResponse in a lightweight agent
  harness.
related_posts:
  - cursor-lightweight-harness-without-microservice-2026
  - cursor-customize-skills-hooks-orchestration-obsidian-2026
  - cursor-harness-memory-loop-2026
image_prompt: >-
  Cinematic 16:9: two translucent control panels floating over a laptop, upper
  panel cloud-lit cyan, lower panel warm copper desk reflection, cables meet at
  a single agent core, no logos, no readable text, no faces.
image_prompt_variant_1: >-
  Surreal 16:9 split-level workshop: cloud floor with hook levers above,
  basement with local hook gears below, one vertical shaft connecting both,
  violet accent, no readable text.
image_prompt_variant_2: >-
  Bold isometric 16:9 cutaway: Cloud Hooks layer above Local Hooks layer feeding
  one Agent Session block, teal and orange risograph, no logos.
featured_image_alt: >-
  Cinematic 16:9: two translucent control panels floating over a laptop, upper
  panel cloud-lit cyan, lower panel warm copper desk reflection, cables meet at
  a ...
format: hybrid
best_for: >-
  Operators wiring Cursor Customize who need a clear split between cloud-side
  agent hooks and local IDE hooks without turning the repo into a microservice
seo_title: 'Cursor Cloud Agent Hooks vs Local Hooks: Two Layers of the…'
---

> **Harness cluster:** [Lightweight harness](/posts/cursor-lightweight-harness-without-microservice-2026) · [Skills, hooks, orchestration](/posts/cursor-customize-skills-hooks-orchestration-obsidian-2026) · [Memory loop](/posts/cursor-harness-memory-loop-2026)

## Cursor cloud hooks vs local hooks

**Cursor cloud agent hooks** fire around cloud-hosted agent runs: before a prompt is submitted, after an agent thought, when a subagent starts. **Local hooks** fire in your IDE lifecycle: session start, after an agent response, before file edits in some setups.

Both are Customize harness mechanics. They run at different trust boundaries.

**Who it is for:** Anyone adding hooks to a Cursor workspace who needs a plain map of which events belong in the cloud layer versus the local machine layer.

**What you will learn:** a job table for common hook events, how cloud and local hooks compose, what belongs in each layer, and guardrails so hooks stay mechanical rather than strategic.

---

## The problem hooks solve

Agents skip steps when tired humans skip steps. The same close-out gets missed: update Bridge, check draft folder, validate response shape, confirm parallel routing fired.

Hooks are **mechanical reminders** at event boundaries. They are not a place to hide business strategy. Strategy lives in SSOT files and human approval.

Without a split mental model, teams either over-wire local scripts for cloud-only events or expect cloud hooks to reach private files they cannot see. Both patterns weaken the harness.

![Diagram contrasting cloud agent hooks and local IDE hooks.](/images/posts/cursor-cloud-hooks-body-01-hook-layers.png)
*Screenshot: Petralian / Cursor (2026)*

---

## Two layers, one harness

| Layer | Runs where | Typical events | Good for |
|-------|------------|----------------|----------|
| **Cloud agent hooks** | Cursor cloud agent runtime | `beforeSubmitPrompt`, `afterAgentThought`, `subagentStart` | Prompt hygiene, subagent policy, cloud-side telemetry |
| **Local hooks** | Your machine / IDE project | `sessionStart`, `afterAgentResponse` | Bootstrap reads, footer validation, repo-specific checks |

Think of cloud hooks as **airport security for the agent plane**. Local hooks are **your house rules when the plane lands**.

```d2
direction: down

cloud: "Cloud hooks\nbeforeSubmitPrompt\nafterAgentThought\nsubagentStart" {
  style.fill: "#e8f4fc"
}

local: "Local hooks\nsessionStart\nafterAgentResponse" {
  style.fill: "#f5ebe0"
}

agent: "Agent session"
files: "SSOT files\nBridge, rules"

cloud -> agent
agent -> local
local -> files: "bootstrap + close" {
  style.stroke-dash: 8
}
files -> agent: "next session" {
  style.stroke-dash: 8
}
```

---

## Cloud hook jobs (when they win)

**beforeSubmitPrompt** — normalize or block prompts that violate workspace policy before tokens spend. Examples: require initiative name in consulting modes; strip accidental paste of secrets patterns; enforce "read Bridge first" injection.

**afterAgentThought** — observe reasoning phases for logging or guardrails that should not block the user mid-turn. Use sparingly. Heavy logic here adds latency and noise.

**subagentStart** — enforce parallel routing policy: did independent deliverables actually split? Log which subagent type launched. Pair with the independence rule from [orchestration](/posts/cursor-customize-skills-hooks-orchestration-obsidian-2026).

Cloud hooks excel when the **agent runtime** is the system of record for the turn, especially for cloud agents and subagent trees you do not fully control from a local script.

---

## Local hook jobs (when they win)

**sessionStart** — runs when you open a **new Agent chat** (not on every follow-up message). It can inject brain-pack snippets, footer law, vault paths, or "read these three files" without you pasting manually. This is how [lightweight harness](/posts/cursor-lightweight-harness-without-microservice-2026) design stays cheap: one script, one JSON config, no separate service.

**Two levels of "session start" — do not mix them up:**

| Level | What fires | What you get |
|-------|------------|--------------|
| **Light bootstrap** | User `sessionStart` hook (e.g. `session-start-brain.ps1`) | Footer contract, parallel law, pointer to Bridge — automatic on new Agent chat |
| **Full Start of Session** | `/start-session` command or explicit "run session start skill" | Vault reads, session note, roadmap, IDN when planning — still manual by design |

In my daily flow I often type **"run session start skill"** (or `/start-session`) because I want the **full** vault protocol, not just the hook injection. That is intentional: light hooks on every new chat; heavy bootstrap when the work is non-trivial or I have been away.

**Can the full protocol run automatically?**

- **`sessionStart` hook (local)** — yes for **injection**. Wire `~/.cursor/hooks.json` → a script that returns `additional_context` (see Brain template `session-start-brain.ps1`). Fires on **new Agent chat** after a window reload. Advantage: zero typing for footer law and Bridge pointer. Limitation: does not replace reading vault files unless your script summarizes them or you add a `session-prep.ps1` that writes `.cursor/brain-pack.md` first.
- **`beforeSubmitPrompt` (cloud)** — can prepend "read Bridge first" on **first prompt only** if you track turn count in hook state. Advantage: runs even when local hook misfires. Limitation: cloud cannot read your private `D:\` vault paths directly; inject pointers, not full files.
- **Always-on rules** (`session-protocol.mdc`) — partial. The agent *should* follow Start of Session before non-trivial work, but rules compete with your first message unless something injects priority context.
- **What does not exist yet (2026):** a built-in "always run this skill before first reply" toggle separate from hooks. If you want full vault bootstrap without typing, extend `sessionStart` to run `session-prep` / brain-pack generation — not to paste the entire manual prompt every time.

**Advantages of wiring `sessionStart` even when you still use the skill:**

1. New chats get footer and parallel law even if you forget to run the skill.
2. `brain-pack.md` loads once per chat without a 14k paste.
3. Project vs user hooks split: user hook = Brain conventions; project hook = repo footer validator.
4. You keep **choice**: trivial question → skip skill; ship day → run skill or rely on richer brain-pack.

**afterAgentResponse** — validate contracts you care about on every reply: footer shape, forbidden folder writes, missing memory update nudges. `failClosed: false` warnings beat hard stops for editorial rules.

Local hooks excel when the **repo and vault on disk** are the system of record. They can read `.cursor/rules`, run PowerShell or shell checks, and touch project files directly.

---

## Example implementation — how I run it

I treat cloud hooks as **portable policy** that should make sense on any machine running cloud agents. Local hooks are **repo-specific** where needed (footer validator on Petralian; user-level `sessionStart` for Brain bootstrap).

**Typical Petralian setup:** user `sessionStart` injects light context; project `afterAgentResponse` validates footer shape. I still run **Start of Session skill** when I need vault session notes, Bridge refresh, or a planned multi-file pass — the hook does not replace that judgment call.

![Cursor hooks configuration in project settings.](/images/posts/cursor-cloud-hooks-body-02-hooks-settings.png)
*Screenshot: Petralian / Cursor (2026)*

Neither layer stores strategy. Both point back to markdown SSOT: Bridge, open loops, writing guide gates. The [memory loop](/posts/cursor-harness-memory-loop-2026) close step is a human habit; hooks only make skipping it visible.

For program teams: cloud hooks are easier to standardize across seats. Local hooks are where repo owners enforce merge discipline. Document both in your internal runbook; publish only the teaching pattern on the blog.

**Smoke test after hook changes:** Developer → Reload Window → new Agent chat → confirm injected FOOTER LAW line before your first prompt. If missing, check Customize → Hooks (user + project) and re-sync from Brain templates if needed.

---

## What not to put in hooks

| Avoid                               | Do instead                           |
| ----------------------------------- | ------------------------------------ |
| Pricing or model escalation policy  | SSOT + human picker                  |
| Legal/commercial approval           | RACI file + explicit human A         |
| Long markdown injections every turn | sessionStart once + Bridge read rule |
| Secret values in hook scripts       | env vars; never commit keys          |
Hooks should be **boring**. If a hook reads like a blog post, move it to a skill or rule.

![Example hook guardrail checklist for agent sessions.](/images/posts/cursor-cloud-hooks-body-03-hook-guardrails.png)
*Screenshot: Petralian / Cursor (2026)*

---

## Limitations

Cloud hooks cannot assume your private vault layout. Local hooks do not run on a phone capture flow. Mobile handoff still needs files ([Brain handbook](/posts/cursor-obsidian-brain-handbook-2026)).

Hook warnings that fire every turn get ignored. Tune for high-signal misses only.

Cloud and local event names will evolve with Cursor releases. Anchor on **jobs** (pre-submit, post-response, subagent spawn), not on memorizing one JSON schema forever.

---

## Path A: one local reminder without hooks JSON

If you are not ready to wire hooks:

1. Add a line to the top of Bridge: `## Pre-flight: read before acting`
2. Paste your three-file bootstrap list there.
3. Manually run a checklist on session close (Bridge updated? draft folder correct?).

You lack automation but keep the same harness shape. Add user-level `sessionStart` when the checklist slips twice in one week; add `/start-session` when you need full vault protocol after a long break.

---

## What to try this week

List every process miss from the last five sessions. Mark each as **cloud** (agent-turn) or **local** (repo/vault). Implement one hook total — the highest-signal miss — not six at once.

---

## Related reading

- [Lightweight harness without a microservice](/posts/cursor-lightweight-harness-without-microservice-2026)
- [Skills, hooks, orchestration](/posts/cursor-customize-skills-hooks-orchestration-obsidian-2026)
- [Customize hub](/posts/cursor-customize-one-agent-many-workflows-2026)
- [Cursor + Obsidian Brain handbook](/posts/cursor-obsidian-brain-handbook-2026)
