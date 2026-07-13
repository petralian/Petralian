---
title: What I Learned Directing AI as My Primary Engineer
slug: what-i-learned-directing-ai-as-my-primary-engineer
date: 2026-07-04
status: published
category: Career
tags:
  - Leadership
  - Agentic AI
  - Program Delivery
  - Enterprise AI
excerpt: "When the agent writes most of the code, the job shifts from typing to operating-system design: rules, file memory, session handoffs, and gates before deploy. Lessons from running that model on production repos."
featured_image: /images/posts/what-i-learned-directing-ai-as-my-primary-engineer.png
featured_image_alt: "Conductor podium facing luminous code panels representing directing AI as primary engineer"
focus_keyword: directing AI as primary engineer
seo_description: "What changes when AI is your primary implementer: operating-system design, file memory, session handoffs, and deploy gates—not model selection alone."
related_posts:
  - training-an-ai-is-like-managing-an-employee
  - composer-2-5-baseline-model-tighter-bootstrap-better-results
  - why-deliberate-file-memory-beats-hoping-agents-remember
image_prompt: "Cinematic 16:9 wide shot of a conductor podium facing an orchestra pit where luminous code panels replace musicians, warm amber key light from above, shallow depth of field, no faces, no logos, no readable text."
image_prompt_variant_1: "Surreal 16:9 shipyard control tower at dusk: captain's chair overlooks robotic cranes moving labeled cargo crates into a dry dock, bioluminescent teal accents, no readable text, no logos."
image_prompt_variant_2: "Bold 16:9 isometric poster: three blocks Rules Memory Footer feeding a central Deploy gate, flat graphic style, risograph grain, copper and slate palette, no logos, no readable text."
---

> **Management habits:** [Training an AI is like managing an employee](/posts/training-an-ai-is-like-managing-an-employee)  
> **Enterprise parallel:** [Why your AI program may fail before it starts](/posts/why-your-ai-program-may-fail-before-it-starts) · [Getting enterprise AI right](/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment)  
> **Stack:** [Composer 2.5 baseline](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results) · [External memory hub](/posts/external-memory-series-guide)

## What does directing AI as a primary engineer mean?

**Directing AI as a primary engineer** means the agent implements most code while I own **requirements, architecture, review, and deploy gates**. The bottleneck moves from typing speed to **operating-system design**: what the agent reads at session start, what it must write at session end, and what evidence blocks a merge.

**Who it is for:** tech leads, staff engineers, and solo builders who already ship with agents and feel variance (skipped rules, lost context, surprise deploys) more than raw model quality.

**What you will learn:** how the role changes, four practices I rely on, where the management metaphor holds, and how this connects to enterprise readiness gates.

---

I did not set out to "manage an AI." I set out to ship multiple production codebases with a small team footprint. Over roughly two years that shifted into a stable pattern: **Cursor agents as the primary implementer**, with me holding product judgment, review, and release discipline.

The surprise was not that agents could write code. It was that **the hard work became infrastructure for repeatability**: rules files, vault handoffs, footer contracts, and explicit "define done" gates. Model upgrades help at the margin. Loose operating systems waste weeks.

This article is the leadership-level summary. For the five delegation habits, read [training an AI like managing an employee](/posts/training-an-ai-is-like-managing-an-employee). For file-level mechanics, read the [external memory series](/posts/external-memory-series-guide).

---

## The problem: implementation got cheap; coordination did not

When the agent types faster than I do, steering committees (even teams of one) still fail the same way enterprise programs fail:

| Failure mode | What it looks like |
|--------------|-------------------|
| **Cold start** | Session 1 follows rules; session 2 ships good code but skips handoff notes |
| **Implicit context** | Constraints live in chat, not in files the next session reads |
| **Model roulette** | Each new frontier model changes instruction-following variance |
| **Deploy without evidence** | "It works locally" without tests, tags, or rollback story |

McKinsey's **State of AI 2025** survey (fieldwork June–July 2025) reports **88%** of organizations use AI in at least one business function, yet only about **one-third** say they are scaling AI across the enterprise, and **39%** attribute any EBIT impact to AI ([McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai)). The gap is not model access. It is **workflow and ownership**.

At individual scale, the same gap shows up as merged PRs that violate architecture because nobody encoded architecture where the agent always looks.

---

## Where this sits: program delivery and accountability

In classic delivery terms:

| Concept | Individual builder version | Enterprise version |
|---------|---------------------------|-------------------|
| **Definition of done** | Tests, footer, vault update | Acceptance criteria, sign-off |
| **RACI** | Human **A** on merge; agent **R** on draft code | Named owners on outputs and errors |
| **Change runway** | Session bootstrap habit | Months of fluency before go-live |
| **Governance** | Rules + CI gates | Policy + operational owners |

Agents should not hold **accountability (A)** for production. I do. The agent can be a fast **responsible (R)** party for drafts if the operating system makes review cheap.

---

## Four practices I rely on

### 1. Treat the IDE as runtime, not a chat window

For [AI-first development](/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow), the IDE is the **runtime**. Whatever loads at session start is the OS. Rules in `.cursor/rules`, repo stubs under `memories/repo/`, and vault prompts are not documentation. They are **boot firmware**.

If I change IDEs or models without porting that OS, I get a fast implementer with amnesia.

### 2. Fix a baseline model policy

I standardized on **Composer 2.5** for implementation work because predictable rule compliance beat frontier roulette ([baseline model post](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results)). CursorBench later gave that habit a cost line. The leadership lesson is separate: **stability of instruction-following** matters more than peak benchmark score for daily shipping.

### 3. File memory beats chat memory

Chat is a briefing that evaporates. [Deliberate file memory](/posts/why-deliberate-file-memory-beats-hoping-agents-remember) means decisions live in paths the next session must read: open loops, session summaries, feature notes.

If I explain a constraint once in chat and nowhere else, I trained myself, not the agent.

### 4. Close the loop every session

Non-trivial sessions end with a **handoff block**: what changed, deploy status, next priority, test plan. That is the individual-scale version of enterprise change management. Skip it and the next session re-derives context from scratch.

---

## Example implementation (how I run it)

**Example implementation — my stack:**

| Layer | What I use |
|-------|------------|
| **IDE** | Cursor with project rules and session protocol |
| **Model** | Composer 2.5 default; escalation rules for rare high-stakes tasks |
| **Memory** | Obsidian vault for operations + `memories/repo/` stubs in git |
| **Quality** | CI, TypeScript build, optional harness CSV for agent sessions |
| **Publish** | Git tags before production deploy; no "push and hope" |

Paths are mine; the pattern is portable: **rules in repo**, **handoffs in a knowledge base**, **human A on merge**.

**Path A (any chat tool):** Three files minimum: (1) bootstrap prompt you paste every session, (2) `DECISIONS.md` for constraints, (3) session log with "next action" at the bottom. No vault required.

```d2
direction: down

YOU: "You\nrequirements + A on merge" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

OS: "Operating system\nrules + memory + footer" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

AGENT: "Agent\nimplements drafts" {
  style.fill: "#f0faf5"
  style.stroke: "#2d9f6f"
  style.border-radius: 8
}

GATE: "Deploy gate\ntests + tag" {
  style.fill: "#f5f8ff"
  style.stroke: "#4a7cff"
  style.border-radius: 8
}

YOU -> OS: "design" { style.stroke-dash: 8 }
OS -> AGENT: "bootstrap" { style.stroke-dash: 8 }
AGENT -> GATE: "PR" { style.stroke-dash: 8 }
GATE -> YOU: "review" { style.stroke-dash: 8 }
```

---

## What changed when I accepted the director role

| Before | After |
|--------|-------|
| Optimized prompts per task | Optimized **repeatable** bootstrap |
| Blamed model on skip behavior | Fixed files the model did not read |
| Measured lines of code | Measured **sessions to done** and rework |
| Ad hoc deploy | Tags, checklists, explicit rollback |

I still write code for taste-critical UI and ambiguous architecture. The agent handles the long middle: boilerplate, refactors, test wiring, doc sync.

---

## Where the management metaphor breaks

Agents do not build rapport or absorb culture from hallway conversation. They do not remember yesterday unless files say so. They will confidently complete the wrong definition of done.

That is why [five management habits](/posts/training-an-ai-is-like-managing-an-employee) all assume **written** examples and **written** outcomes.

---

## Limitations

- This model assumes you can review code and product tradeoffs. It does not remove senior judgment.
- Heavy compliance environments need enterprise gates ([readiness narrative](/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment)), not only personal discipline.
- Tooling changes quickly; the OS pattern outlasts any single IDE feature.

---

## Reader action

1. List what your agent **must read** every session. If the list is "whatever was in chat," fix that first.
2. Pick one **baseline model** for two weeks. Measure skipped rules, not vibes.
3. Add a **session footer** field block to your workflow (even in a plain text file).
4. Pair this with [enterprise readiness gates](/posts/why-your-ai-program-may-fail-before-it-starts) if you lead a team, not only your own repo.

Directing AI as a primary engineer is not abdication. It is **delegation with an operating system**. Build the OS first; then argue about models.

---

**Sources**

1. McKinsey & Company, "The state of AI in 2025: Agents, innovation, and transformation." Global survey published November 2025 (fieldwork June 25–July 29, 2025). https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
