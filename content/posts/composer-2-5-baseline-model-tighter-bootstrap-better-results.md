---
title: >-
  Composer 2.5 as My Only Coding Model: Cost, Predictability, and a Tighter
  Bootstrap
slug: composer-2-5-baseline-model-tighter-bootstrap-better-results
date: 2026-05-27T00:00:00.000Z
tags:
  - Agentic AI
  - Developer Tools
  - AI Memory
  - Enterprise AI
excerpt: >-
  I run Cursor on Composer 2.5 only—not to save money alone, but to get
  predictable rule compliance. A tighter session bootstrap beat chasing frontier
  models for my workflow.
featured_image: /images/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results.png
focus_keyword: Cursor Composer 2.5 baseline model
seo_description: >-
  Why I use Cursor Composer 2.5 as my only coding model: lower cost, predictable
  footer and rule compliance, and better results from a tighter session…
image_prompt: >-
  Minimal developer workspace with a single model selector pinned to one option,
  beside a neat stack of labeled rule cards and an Obsidian vault notebook—calm
  editorial lighting, no logos, no faces.
image_prompt_variant_1: >-
  Tiny control room with one steady gauge labeled Composer 2.5 and a wall of
  filing drawers for Rules and Vault—one operator chair, warm technical diorama,
  clever not cartoonish.
image_prompt_variant_2: >-
  Split chart scene: left side spinning model roulette wheel with price tags
  flying off; right side straight assembly line with checklist gates—editorial
  contrast, professional playful tone.
featured_image_alt: Minimal developer workspace with a single model selector pinned to one
format: hands-on
best_for: Practice leads standardizing Cursor model policy and tighter agent bootstrap
seo_title: 'Composer 2.5 as My Only Coding Model: Cost,…'
---
**TL;DR**

- I run Cursor on Composer 2.
- 5 only—not to save money alone, but to get predictable rule compliance.
- A tighter session bootstrap beat chasing frontier models for my workflow.



> **Companion piece:** [From VS Code Copilot to Cursor: what changed in my workflow](/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow)  
> **Cost context:** [GitHub Copilot vs OpenRouter pricing](/posts/github-copilot-vs-openrouter-real-cost-comparison-for-developers)  
> **Memory stack:** [Three layers of external memory](/posts/three-layer-external-brain-for-ai-first-development) · [Why deliberate file memory beats hoping agents remember](/posts/why-deliberate-file-memory-beats-hoping-agents-remember)  
> **Direction habits:** [Training an AI is like managing an employee](/posts/training-an-ai-is-like-managing-an-employee)

## What is a Composer 2.5 baseline model policy?

A **baseline model policy** means picking **one implementation model** (here: Cursor Composer 2.5) for weeks—not chasing every frontier release—so rules, footers, and vault handoffs stay **predictable**.

**Who it is for:** practice leads and program directors with an external memory stack (Obsidian, handoff files, session footers) who lose continuity when the model picker changes every sprint.

**What you will learn:** why instruction-following variance hurts file memory, a tightened bootstrap order, tradeoffs accepted, and when manual escalation still makes sense.

---

Every few weeks a new frontier model appears in the model picker. The marketing promise is the same: fewer mistakes, longer context, better reasoning. For a solo builder running multiple production repos with agents as the primary implementer, model roulette has a hidden cost—not just dollars per token, but **inconsistent obedience** to the operating system you spent weeks writing into Obsidian and Cursor rules.

I standardized on **Cursor Composer 2.5 only** for implementation work (for now). Not because it wins every benchmark, but because it is a cost-effective model inside the workflow I control: fixed rules, fixed bootstrap, fixed footer contract, and file memory that does not change when the vendor ships a new badge.

---

## The problem: expensive models do not fix a loose operating system

The failure mode looks like this:

- Session 1 on Model A follows the footer and updates the vault.
- Session 2 on Model B ships good code but skips Obsidian and drops the handoff block.
- Session 3 on Model C argues with deploy rules that live in `00_Brain` because it never read them.

That is not "AI quality." That is **variance in instruction-following** across models—and variance destroys [external memory](/posts/three-layer-external-brain-for-ai-first-development) systems that depend on repeatable session end behavior.

Frontier models can brute-force a refactor. They cannot replace:

- `Operations/AI Session Bridge.md` with current priority
- `memories/repo/open-loops.md` mirrored to the vault
- A ten-line footer with a required `Obsidian:` proof line (`read ✓` / `written ✓` / path)

When those are optional, every model change becomes an uncontrolled experiment.

---

## Why a single baseline model matters for my stack

I am not anti-frontier. I am pro-**controlled experiments**.

Composer 2.5 is Cursor's agent-oriented model in the tier I use daily. Pinning it delivers:

| Goal | How one model helps |
|------|---------------------|
| **Cost ceiling** | No surprise premium-model sessions on large refactors |
| **Predictable tone** | Fewer style swings between replies in one thread |
| **Rule compliance** | The same `.cursor/rules/*.mdc` files were tuned against this model's behavior |
| **Auditability** | Session summaries can say "Composer 2.5" without a footnote of five models |

This parallels the argument in [directing AI as primary engineer](/posts/what-i-learned-directing-ai-as-my-primary-engineer): productivity gains assume a **stable operating model**. Swapping the implementer's brain every sprint is the opposite of stable.

Cost is real but secondary. My [Copilot vs OpenRouter comparison](/posts/github-copilot-vs-openrouter-real-cost-comparison-for-developers) showed that token pricing only matters after you know **how many** tokens your workflow burns. A tighter bootstrap reduces rework tokens—which often beats a "smarter" model that wanders.

---

## What I run (Composer 2.5 + tightened bootstrap)

**Model policy:** Cursor Agent for implementation; **Composer 2.5 only** unless a human explicitly escalates for a one-off review. No automatic model switching, no "let the agent pick."

**Bootstrap order** (unchanged philosophy, stricter enforcement after the [Copilot → Cursor migration](/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow)):

1. `00_Brain` manual prompts (Start of Session)
2. `.claude/NOTES.md` + `NEXT_SESSION.md`
3. `memories/repo/index.md`, `open-loops.md`, `known-gotchas.md`
4. `00_Brain/Conventions/Response Footer Contract.md`
5. Project vault: Session Summaries → AI Session Bridge → relevant Features
6. Session note created **before** code
7. Confirm `.cursor/rules/response-footer.mdc` (`alwaysApply: true`)

```d2
direction: down

START: "New Agent session" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

HOOK: "sessionStart hook\n(optional snapshot)" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

RULES: ".cursor/rules\nalwaysApply" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  FOOT: "response-footer.mdc"
  PROTO: "session-protocol.mdc"
}

READ: "Read vault +\n00_Brain" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

WORK: "Composer 2.5\nimplements" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

END: "Footer +\nvault write" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

START -> HOOK
HOOK -> RULES
RULES -> READ
READ -> WORK
WORK -> END
END -> START: "next session" {
  style.stroke-dash: 8
  style.stroke: "#9aa3b2"
}
```

The loop at the bottom is deliberate: the footer is not politeness. It is how the **next** Composer session knows what happened.

---

## How tighter bootstrap produced better results (without a frontier upgrade)

After I centralized one footer spec and copied always-on Cursor rules into each repo, three behaviors improved on Composer 2.5:

1. **Session context blocks** at the top of work replies—three to six lines from session summaries and a "current priority" note—reduced "what was I doing?" restarts.
2. **Mandatory proof in the footer** that notes were read or updated (`read ✓` / `written ✓` / path) cut the fiction where the agent claimed memory ran but wrote nothing.
3. **Self-improvements with file citations** (`path:Lnn` or `None`) pushed lessons into rules files instead of chat-only apologies.

None of that requires GPT-5-class reasoning. It requires **repeated structure** on a model that follows structure reliably at the task sizes I use: multi-file edits, note updates, scripted checks, handoff files.

Where Composer 2.5 still struggles, I document the gap in a gotchas file and narrow the task—rather than switching models mid-session and blaming the toolchain.

---

## Additional detail

### Tradeoffs I accept

**What I give up**

- One-shot "genius refactor" sessions that occasionally land on frontier models
- Benchmark bragging rights in social posts
- Model-specific plugins that only run on one provider's latest release

**What I keep**

- A note system that survives IDE and model churn ([tool-agnostic files](/posts/the-ai-memory-problem-openclaw-hermes-karpathy-approach-that-survives))
- Comparable session handoffs across every repo that uses the same bootstrap
- Bills that scale with **work done**, not with **model curiosity**

**When I might escalate manually**

- Security review on unfamiliar dependency trees
- One-off architecture critique where I want a second model as reviewer—not implementer

That escalation is intentional and rare. Implementation stays on Composer 2.5.

---

### What improved after a better session start

The win was not a secret feature in Composer 2.5. It was **starting every session the same way**—and staying on one model long enough for that habit to stick. After I fixed session start:

| Advantage | What it means in practice |
|-----------|---------------------------|
| **Less re-explaining** | The agent opens with a short recap of last priority and today's goal. I stop pasting "here's where I left off" into chat. |
| **Clearer handoffs** | A fixed end-of-reply checklist records what changed, whether deploy is pending, and whether notes were updated. |
| **Fewer repeat mistakes** | Open loops and gotchas live in files read at start—not buried in a thread from last week. |
| **Lower rework cost** | One bootstrap checklist on one model burns fewer tokens than re-teaching rules every time the model picker changes. |

Optional extras help but are not required to get most of the benefit:

- **Always-on Cursor rules** — Small files that repeat non-negotiables (read handoff notes, append the footer) so they survive long chats.
- **Session-start hook** — A script that writes a snapshot (git status, inbox, health) into a file the agent reads first; useful for ops-heavy apps, optional for simpler repos.
- **One canonical footer spec** — One markdown note defines the footer; every other doc links to it so fields do not drift.

The limiting factor was never "the model cannot code." It was **sessions that skipped session start** because rules lived in five places. Tightening session start on one model beat upgrading to a frontier model on a loose bootstrap.

### Reference

### Quick reference: bootstrap order (example)

| Step | Artifact | Purpose |
|------|----------|---------|
| 1 | `00_Brain` Start of Session prompt | Methodology gate |
| 2 | `.claude/NOTES.md`, `NEXT_SESSION.md` | Repo handoff |
| 3 | `memories/repo/index.md`, `open-loops.md`, `known-gotchas.md` | Operational memory |
| 4 | Response Footer Contract (Brain) | v3.1 modes A–G |
| 5 | Vault: Summaries → Bridge → Features | Project truth |
| 6 | Session note **before** code | Inspectable narrative |
| 7 | `.cursor/rules/response-footer.mdc` (`alwaysApply`) | Per-turn enforcement |

**Model policy (example):** Agent implementation = Composer 2.5 only; human escalates for one-off security/architecture **review**, not inline implementation swaps.

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|--------------|-----|
| Switching models mid-session for "smarter" fixes | Breaks footer and vault habit | Narrow task; document gap in gotchas |
| Footer rules buried in 3k-token copilot-instructions | Format rules drop first | Dedicated `response-footer.mdc` alwaysApply |
| Skipping session start on "small" tasks | Re-explaining burns more than bootstrap | Mode B minimum; skip only true Mode A Q&A |
| Expecting frontier model to replace file memory | Good code, no handoff | Mandatory Obsidian proof line in footer |
| Auto model routing in harness | You lose auditability | Human picks model; harness shapes procedure |
| Benchmark chasing without compliance metrics | Vanity wins, drift continues | Measure footer + vault writes for two weeks |

## FAQ

### Is Composer 2.5 the best coding model?

**Not on every benchmark.** It is the best **controlled** model for my stack: cost ceiling, rule compliance, and comparable session handoffs.

### When should I escalate to another model?

**Rare, intentional review:** unfamiliar dependency trees, one-off architecture critique—as **reviewer**, not default implementer.

### Does one model save money by itself?

**Indirectly.** Tighter bootstrap and fewer rework tokens often beat a pricier "smarter" model on a loose OS ([cost context](/posts/github-copilot-vs-openrouter-real-cost-comparison-for-developers)).

### How does this relate to CursorBench?

Composer 2.5 scores well on **score per dollar** on CursorBench 3.2 ([analysis](/posts/cursorbench-3-2-fable-5-composer-2-5-cost-vs-score))—one line item, not the whole argument.

### What if Composer 2.5 cannot do a task?

Document in `known-gotchas.md`, split scope, or escalate for review—**do not** rotate models every turn.

### What you can do next

1. **Pick one implementation model** for two weeks. Measure footer compliance and vault writes, not vibe.
2. **Centralize your footer** in one brain note; link from Cursor rules and copilot-instructions.
3. **Copy the Cursor templates** from `00_Brain/Templates/cursor/` on your next retrofit—or add a user-level Cursor rule as a safety net until every repo has them.
4. Read the [migration article](/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow) if you are still straddling VS Code Copilot and Cursor with one note system.

If your sessions still feel forgetful after that, add **structure** before you add model cost. Composer 2.5 is my proof of concept—not because it is magic, but because my setup treats memory and rules as part of shipping, not as optional documentation.
*If you're new to Cursor: [50% off your first month](https://cursor.com/referral?code=JP5ARNKSFI2Q) (code `JP5ARNKSFI2Q`). I may earn usage credits; install directly if you prefer.*
