---
title: You Already Have an AI Harness in Cursor (Without LangChain)
slug: cursor-lightweight-harness-without-microservice-2026
date: 2026-07-04T00:00:00.000Z
status: published
category: AI & Building
tags:
  - Agentic AI
  - Developer Tools
  - AI Quality
  - Playbook
excerpt: >-
  Terminal-Bench harnesses look like separate products. On a production Shopify
  app I already had subagents, CI gates, and session rules. You keep model and
  mode control — the harness supports routing, tests, and memory gates, not
  autopilot.
featured_image: /images/posts/cursor-lightweight-harness-without-microservice-2026.png
focus_keyword: Cursor agent harness without microservice
seo_description: >-
  How to run a lightweight AI harness in Cursor using rules, subagents, and CI
  checks instead of LangChain or Harbor. Policy table, starter kit, and what not
  to build.
series: Cursor Agent Harness Series
series_order: 1
related_posts:
  - cursor-token-saving-tools-beyond-headroom-2026
  - composer-2-5-baseline-model-tighter-bootstrap-better-results
  - vscode-copilot-to-cursor-what-changed-in-my-ai-workflow
  - three-layer-external-brain-for-ai-first-development
image_prompt: >-
  Cinematic 16:9: a single Composer pane on a workbench surrounded by labeled
  gate cards (Policy, Tests, CI) not a second server rack, copper rim light on
  concrete wall, no logos, no readable text, no faces.
image_prompt_variant_1: >-
  Surreal 16:9 planetarium dome: constellations are subagent icons but one
  bright path labeled Direct Composer, telescope on a rolling cart, deep violet
  and amber accents, no readable text.
image_prompt_variant_2: >-
  Bold isometric 16:9 poster: horizontal gate chain Direct to Batch to Test to
  Ship as flat blocks with checkmarks, risograph texture teal and slate, no
  logos.
format: hands-on
best_for: >-
  Solo builders and small teams who want harness discipline without microservice
  overhead
---
**TL;DR**

- Terminal-Bench harnesses look like separate products.
- On a production Shopify app I already had subagents, CI gates, and session rules.
- You keep model and mode control — the harness supports routing, tests, and memory gates, not autopilot.



> **Series:** Cursor Agent Harness (Part 1 of 3)  
> **Companion:** [Token saving post-mortem](/posts/cursor-token-saving-tools-beyond-headroom-2026) (proxy retired; direct OpenRouter + MCP)  
> **Memory stack:** [Four tiers of external memory](/posts/three-layer-external-brain-for-ai-first-development) (Layer 4 = feedback loop)  
> **Next:** Part 2 memory loop · Part 3 measurement

## What is a Cursor agent harness?

A **Cursor agent harness** is a **lightweight operating system** for AI-assisted coding inside your repo: routing rules, optional subagents, test gates, and CI checks—not a second HTTP orchestrator or LangChain service.

**Who it is for:** developers and tech leads using Cursor Agent who want fewer bad deploys and retry threads without installing Harbor, Redis, or a token proxy.

**What you will learn:** how to name what you already have (policy table, context-budget rule, eval gate), what the harness supports versus what you still control (model, Plan vs Agent, ship approval), and what to defer until measurement proves a gap ([Part 3](/posts/cursor-harness-measurement-2026)).

---

## The problem: benchmark harnesses are not your repo harness

Terminal-Bench ranks agents like LemonHarness and Harbor on hard CLI tasks in Docker. The leaderboard rewards multi-step tool loops and verification. That is useful research. It is also easy to misread as a shopping list: install another orchestrator, add Redis, route every Composer call through a microservice.

On my production Shopify app (React Router 7, Fly.io, Cursor Composer 2.5 direct), the failure mode was different. I did not need a sandbox benchmark. I needed fewer bad deploys, fewer retry threads, and fewer tokens wasted on subagents and session bootstrap when a one-line question would do.

I had already built most of a harness. I had not named it or written a one-page routing policy.

## Why this matters

A second HTTP orchestrator in front of Cursor usually duplicates what Agent mode already does: plan, call tools, observe, revise. Each extra planner or verifier LLM round adds cost. On my traffic, a token proxy experiment hurt OpenRouter cache hit rate without meaningful dollar savings ([companion post](/posts/cursor-token-saving-tools-beyond-headroom-2026)).

What did help was discipline:

- When to use direct Composer vs a batch subagent
- When to run tests before ship
- When to skip a 14k-token brain-pack for a trivial question
- CI checks that cost zero chat tokens

That is a **product harness**: rules, optional subagents, deterministic verifiers. Not Harbor.

## You keep the controls — the harness supports, not overrides

A harness is easy to misread as something that takes over: auto-routing your model, forcing Plan mode, or swapping GLM for Composer behind your back. **That is not what this stack does.**

| Control | Who owns it | What the harness does instead |
|---------|-------------|-------------------------------|
| **Model** (Composer 2.5, GLM 5.2, etc.) | **You** — Cursor dropdown | Nothing. No proxy, no model router. Your [baseline model policy](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results) is a workflow choice, not code that blocks other models. |
| **Mode** (Plan vs Agent) | **You** — Cursor UI | Rules still apply in Plan (`alwaysApply` `.cursor/rules`). Plan-only turns stay advisory: no deploy, lighter bootstrap for simple Q&A. |
| **When to spawn subagents** | **Policy table** — agent follows `HARNESS-POLICY` | Suggests `<project>-batch` only for 3+ tasks; direct Composer for 1–2 file fixes. You can override by saying "do this inline." |
| **When to load memory** | **Harness gates** (Part 2) | Skips brain-pack on Mode A; loads once on code sessions. You still own what is in `memories/` and your vault. |
| **When to ship** | **You** approve deploy | Harness insists on `npm test` / `<project>-test` before release — support, not autopilot. |

**Re-assess** means the agent asks *"Does this task need a subagent, full bootstrap, or tests?"* — not *"Should I change your model?"*

If you pick **Plan + GLM 5.2**, Cursor runs Plan with GLM 5.2. The harness shapes **procedure** (footer Mode B, skip heavy vault sweep for a one-line question, no batch agent on a single file). It does not silently revert you to Composer 2.5 or Agent mode.

```d2
direction: right

YOU: "You\nmodel + mode dropdown" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

CURSOR: "Cursor runtime\nPlan or Agent" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

RULES: "Harness support\n(rules + policy)" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  ROUTE: "Subagent vs\ndirect"
  MEM: "Memory\ngates"
  TEST: "Tests before\nship"
}

PROVIDER: "OpenRouter /\nprovider" {
  style.fill: "#e8f4f8"
  style.stroke: "#4a90a4"
  style.border-radius: 8
}

YOU -> CURSOR
CURSOR -> RULES
CURSOR -> PROVIDER
RULES -> CURSOR: "procedure only\nno model swap" {
  style.stroke: "#696d84"
  style.stroke-dash: 8
}
```

Power stays with you. The harness is the **operating manual** the agent reads — routing table, test gates, memory discipline, CI checks — so support is consistent even when the model or mode changes.

## What was already in the repo

Before I wrote `docs/HARNESS-POLICY.md`, my main app repo already had:

| Pattern | Location | Job |
|---------|----------|-----|
| Orchestrator | `.github/agents/<project>-batch.agent.md` | Split 3+ tasks to workers |
| Worker | `<project>-impl.agent.md` | One scoped change |
| Verifier | `<project>-test.agent.md` + `npm test` | Pass/fail |
| Release gate | `<project>-release-manager` + pre-deploy script | No dirty deploys |
| CI harness | `agent-quality/evals/workflows.json` | Static regression checks on push |
| Session bootstrap | `sessionStart` hook → `brain-pack.md` | Cross-session context |
| Routing prose | `.github/copilot-instructions.md` | When to invoke agents |

Composer 2.5 direct is the default path. Subagents are the heavy path when the table says so.

## Additional detail

### How the lightweight harness works

### 1. One policy page (git, not Obsidian)

`docs/HARNESS-POLICY.md` is a decision table:

| Trigger | Action | Avoid |
|---------|--------|-------|
| Quick question | Direct Composer, skip heavy bootstrap | Batch subagent |
| 1–2 file fix | Direct + docs/symbol MCP | `<project>-batch` |
| 3+ independent tasks | `<project>-batch` | Implement whole list inline |
| Before deploy | `npm test` or `<project>-test` | Trust agent claim alone |
| Deep debug | Main agent + test loop | LangChain on week one |

### 2. Context budget rule (Cursor)

`.cursor/rules/context-budget.mdc` (~25 lines, `alwaysApply: true`) points at the policy. Mode A for Q&A. No subagents on single-file fixes.

### 3. CI verifier (push, not chat)

`npm run eval:gate` runs workflow cases (`fileExists`, `textContains`) against routes and rules that regressed in production. Chat tokens: zero.

### 4. Defer list

`docs/HARNESS-DEFER.md` states what not to build until a CSV baseline proves a gap: LangChain service, Harbor as daily driver, multi-model ensemble.

```d2
direction: right

Q: "User message" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

GATE: "context-budget.mdc\n+ HARNESS-POLICY" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  A: "Mode A\nQ&A"
  B: "Code work"
}

DIRECT: "Composer 2.5\ndirect" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

HEAVY: "Subagent or\ntest gate" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

CI: "eval:gate\non push" {
  style.fill: "#e8f4f8"
  style.stroke: "#4a90a4"
  style.border-radius: 8
}

Q -> GATE
GATE.A -> DIRECT
GATE.B -> DIRECT
GATE.B -> HEAVY
HEAVY -> CI
```

### What I measured (and what I skipped)

Benchmarked claims from Terminal-Bench agents optimize leaderboard score, often with more tokens. I skipped plugging those agents into Cursor; they expect Harbor plus Docker task layouts, not a monolith Shopify repo.

I also skipped a LangChain microservice after the proxy post-mortem: complexity without ROI on chat-heavy sessions.

### What you can copy in one afternoon

1. Add `docs/HARNESS-POLICY.md` (one table).
2. Add `.cursor/rules/context-budget.mdc` (link to policy).
3. Optional: one batch agent + one test agent, not five on day one.
4. Optional: `agent-quality/` or a single `fileExists` script on CI.
5. Add `docs/harness-session-log.csv` for weekly review (Part 3 of this series).
6. Add `docs/HARNESS-DEFER.md` so future-you does not install Redis out of FOMO.

Policy files live in **git** so they diff in PRs. Session narrative stays in Obsidian (Part 2).

### Additional detail

### Reference

### Quick reference: harness artifacts (example implementation)

| Artifact | Example path | Job |
|----------|--------------|-----|
| Routing policy | `docs/HARNESS-POLICY.md` | When to use direct Composer vs batch vs test |
| Context budget | `.cursor/rules/context-budget.mdc` | Mode A skip; link to policy |
| Batch worker | `.github/agents/<project>-batch.agent.md` | 3+ independent tasks |
| Test gate | `npm test` or `<project>-test` agent | Pass/fail before deploy claim |
| CI verifier | `npm run eval:gate` | Static regression on push |
| Defer list | `docs/HARNESS-DEFER.md` | Block orchestration until CSV proves gap |
| Session log | `docs/harness-session-log.csv` | Weekly review ([Part 3](/posts/cursor-harness-measurement-2026)) |

Swap `<project>` for your repo name. Paths are illustrative; the **pattern** is what travels.

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|--------------|-----|
| Installing LangChain/Harbor before naming what you have | Duplicates Agent mode; adds token rounds | Write `HARNESS-POLICY.md` first; list existing subagents and CI |
| Treating harness as model router | You lose control of Composer vs GLM | Harness shapes **procedure** only; model stays in Cursor dropdown |
| Batch subagent on 1–2 file fixes | Wastes tokens and context | Policy table: direct Composer for small scope |
| Loading brain-pack on every question | 14k tokens on Mode A Q&A | `context-budget.mdc`: skip bootstrap for simple Q&A |
| Trusting agent "tests passed" without output | Wrong-fix deploys | `tests_before_deploy=yes` in CSV; run `npm test` yourself |
| Building from Terminal-Bench shopping lists | Benchmark tasks ≠ your repo failures | Measure your failure modes ([Part 3](/posts/cursor-harness-measurement-2026)) |

## FAQ

### Is a harness the same as LangChain or Harbor?

**No.** Those are **research-grade orchestrators** for sandbox benchmarks. A repo harness is **rules + optional subagents + CI** inside git—no second HTTP service in front of Cursor.

### Does the harness change my model or Plan vs Agent?

**No.** You keep the Cursor dropdown and mode. The harness suggests routing (direct vs batch), memory gates, and test-before-ship—it does not auto-swap models.

### How many subagents do I need on day one?

**Zero to two.** One batch worker and one test agent are enough. Add more only when the policy table and CSV show repeated gaps.

### Where do policy files live—Obsidian or git?

**Git** for `HARNESS-POLICY.md`, eval JSON, and CSV schema (diff in PRs). **Obsidian** for session narrative and open loops ([Part 2](/posts/cursor-harness-memory-loop-2026)).

### When should I build Phase 2 orchestration?

When **all** defer gates pass: repeated `wrong-fix` with tests run, subagent overuse on small tasks, and engineering time budget—see `HARNESS-DEFER.md` and [Part 3](/posts/cursor-harness-measurement-2026).

### Reader action

Open your main repo. List what you already have: subagents, test script, deploy gate, CI check, session rules. If the list has three or more rows, you likely have a harness. Write the policy page before you write another service.

Part 2 covers the **four-tier memory loop** (including Layer 4 feedback) without loading everything every turn. Part 3 covers the CSV, OpenRouter dollars, and when to build more.
