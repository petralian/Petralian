---
title: 'Measure Your Cursor Harness — CSV, CI, and OpenRouter Dollars'
slug: cursor-harness-measurement-2026
date: 2026-07-04 00:00:00+00:00
status: published
tags:
  - Agentic AI
  - Developer Tools
  - AI Quality
  - Playbook
excerpt: >-
  Do not build Phase 2 orchestration until Phase 0 data says so. Layer 4
  feedback — CSV, footer Agents line, eval gate — plus weekly OpenRouter checks
  beat benchmark leaderboard anxiety.
featured_image: /images/posts/cursor-harness-measurement-2026.png
focus_keyword: measure Cursor agent harness ROI
seo_description: >-
  How to measure a Cursor agent harness with session CSV logs, CI eval gates,
  and OpenRouter spend. When to defer LangChain or Harbor based on real failure
  modes.
series: Cursor Agent Harness Series
series_order: 3
related_posts:
  - cursor-lightweight-harness-without-microservice-2026
  - cursor-harness-memory-loop-2026
  - github-copilot-vs-openrouter-real-cost-comparison-for-developers
  - three-layer-external-brain-for-ai-first-development
image_prompt: >-
  Cinematic 16:9: spreadsheet notebook beside a CI pipeline light and a single
  OpenRouter receipt on a drafting table, warm desk lamp, no readable numbers,
  no faces.
image_prompt_variant_1: >-
  Surreal 16:9 observatory: CSV rows as star trails, eval gate as a shutter
  before a telescope, deep blue and amber, no text.
image_prompt_variant_2: >-
  Bold isometric 16:9: three panels Log CI Dollars connected by arrows,
  risograph slate and mint, no logos.
format: hands-on
best_for: Program leads measuring whether a Cursor harness improves output and spend
---

> **Series:** Cursor Agent Harness (Part 3 of 3)  
> **Part 1:** [Lightweight harness](/posts/cursor-lightweight-harness-without-microservice-2026) — you keep model and mode control  
> **Part 2:** [Four-tier memory loop](/posts/cursor-harness-memory-loop-2026)  
> **Cost context:** [Copilot vs OpenRouter pricing](/posts/github-copilot-vs-openrouter-real-cost-comparison-for-developers)
## What is harness measurement?

**Harness measurement** is the **Layer 4 feedback loop** for a Cursor agent stack: a session CSV, CI eval gates, footer audit fields, and weekly OpenRouter checks—so you defer LangChain or Harbor until real failure modes justify the build.

**Who it is for:** practice leads and program directors who already have harness policy ([Part 1](/posts/cursor-lightweight-harness-without-microservice-2026)) and memory gates ([Part 2](/posts/cursor-harness-memory-loop-2026)) and need evidence before adding orchestration.

**What you will learn:** what to log in week 1, how `eval:gate` costs zero chat tokens, an honest ROI formula, and when `HARNESS-DEFER.md` should block Phase 2 work.

---
**TL;DR**

- Do not build Phase 2 orchestration until Phase 0 data says so.
- Layer 4 feedback — CSV, footer Agents line, eval gate — plus weekly OpenRouter checks beat benchmark leaderboard anxiety.


## The problem: you cannot optimize what you do not log

Leaderboard harnesses report accuracy on fixed tasks. Your repo has different failure modes: wrong fix after tests were skipped, batch subagent on a one-file tweak, deploy without `npm test`, OpenRouter spend creeping up while cache hit drops.

Without a one-week baseline, every new tool looks rational. With Layer 4 instrumentation — CSV rows, footer **Agents** line, CI eval — defer lists write themselves. **You** still decide whether to build more; the harness only surfaces evidence.

## Why Phase 0 before Phase 2

`docs/HARNESS-DEFER.md` says: do not build `scripts/agent-harness.mjs` or plug Harbor until **all** gates pass — repeated `wrong-fix` rows with tests already run, subagent overuse on small tasks, and engineering time budget.

Measurement is cheaper than a microservice. It also respects your control: no auto-install of orchestrators when the CSV says failure modes are `none`.

## What to log (week 1)

`docs/harness-session-log.csv` columns:

`date, task_type, subagent_used, tests_before_deploy, openrouter_usd_notes, failure_mode, notes`

Log every real session. No synthetic benchmark runs.

This is **Layer 4 feedback** in spreadsheet form — the same tier as footer contracts and `eval:gate`, not Layer 2 narrative. Compare weekly; promote patterns into rules when the same `failure_mode` repeats.

### Week 1 review checklist

- [ ] Subagents only on rows tagged `batch`?
- [ ] Every deploy row has `tests_before_deploy=yes`?
- [ ] `failure_mode` mostly `none`?
- [ ] OpenRouter Activity flat or down vs prior week (same model)?

## CI harness (zero chat tokens)

```bash
npm run eval:validate   # workflows.json paths exist
npm run eval:gate         # score vs baseline.json
```

Add cases for **your** repeat regressions. Examples from my Shopify app work: Prisma migration discipline, feed-widget sync, storefront API debug rule.

```d2
direction: right

SESSION: "Real session" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

CSV: "harness-session-log.csv" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

REVIEW: "Weekly review" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

CI: "eval:gate\non push" {
  style.fill: "#e8f4f8"
  style.stroke: "#4a90a4"
  style.border-radius: 8
}

DEFER: "HARNESS-DEFER\ngates" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

SESSION -> CSV -> REVIEW
CI -> REVIEW
REVIEW -> DEFER
```

## Additional detail

### ROI formula (honest, not leaderboard)

```
net_benefit = (failed_sessions_avoided × avg_session_cost)
            + (deploy_rollbacks_avoided × rollback_cost)
            − (extra_orchestration_tokens × price)
            − (engineering_hours × your_rate)
```

If `net_benefit` is negative after four weeks and failure modes are `none`, the harness is already enough. Stop shopping for Harbor.

### Footer and summaries (Layer 4 — no new contract lines)

Use existing v3.1 footer fields from the [Session Continuity System](/posts/why-deliberate-file-memory-beats-hoping-agents-remember):

- **Agents:** `none — direct Composer`, `<project>-batch`, etc. — proves which harness path ran; does **not** change your model
- **Verified:** `harness: tests_before_ship=yes|no`

Session Summaries prefix (Part 2) is Layer 2. Footer + CSV + `eval:gate` are Layer 4. Together they close the feedback loop: session → evidence → weekly review → defer or promote to rules.

### Reference

### Quick reference: measurement fields

| Field / command | Purpose |
|-----------------|---------|
| `docs/harness-session-log.csv` | One row per real session |
| Columns: `date`, `task_type`, `subagent_used`, `tests_before_deploy`, `openrouter_usd_notes`, `failure_mode`, `notes` | Week 1 baseline |
| `npm run eval:validate` | Confirm `workflows.json` paths exist |
| `npm run eval:gate` | Score vs `baseline.json` on push |
| Footer **Agents:** | `none — direct Composer`, `<project>-batch`, etc. |
| Footer **Verified:** | `harness: tests_before_ship=yes\|no` |
| `docs/HARNESS-DEFER.md` | Phase 2 blockers |

**ROI sketch:** `net_benefit = (failed_sessions_avoided × avg_session_cost) + (deploy_rollbacks_avoided × rollback_cost) − (extra_orchestration_tokens × price) − (engineering_hours × your_rate)`

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|--------------|-----|
| Building orchestration before week 1 CSV | Every tool looks rational without data | Log every real session; no synthetic benchmarks |
| Logging only wins, not `failure_mode` | Cannot promote patterns to rules | Include `none`, `wrong-fix`, `redeploy` honestly |
| Skipping `tests_before_deploy` on deploy rows | CSV lies about quality gates | Require `yes` before ship claims |
| Chasing leaderboard harness scores | Terminal-Bench ≠ your repo | Measure your failure modes |
| Ignoring OpenRouter Activity while adding middleware | Proxy may lower cache hit % | Compare direct vs proxied weekly ([token post-mortem](/posts/cursor-token-saving-tools-beyond-headroom-2026)) |
| Adding footer fields for harness only | Contract drift | Use existing v3.1 **Agents** and **Verified** lines |

## FAQ

### How long is Phase 0?

**One week** of real sessions minimum. Log every work session; review subagent use, deploy tests, failure modes, and spend.

### What failure modes justify Phase 2?

Repeated **`wrong-fix`** rows **with tests already run**, subagent overuse on small tasks, and budget for engineering time—all gates in `HARNESS-DEFER.md`.

### Does `eval:gate` use chat tokens?

**No.** It runs on CI push. Add cases for **your** repeat regressions (routes, rules, migration discipline).

### Should I log OpenRouter dollars in the CSV?

**Yes, as notes** (`openrouter_usd_notes`)—enough to spot creep week over week on the same model, not accounting-grade precision.

### When is the harness "enough"?

When four weeks show `failure_mode` mostly `none`, subagents only on `batch` rows, and `net_benefit` negative for more orchestration—**stop shopping for Harbor**.

### Reader action

Create `docs/harness-session-log.csv` today. Log this week's sessions. Run `eval:gate` once. If you have three or more `wrong-fix` rows with tests run, re-read `HARNESS-DEFER.md`. Otherwise ship the policy and stop building orchestrators.
