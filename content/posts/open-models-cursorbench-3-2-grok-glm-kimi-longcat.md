---
title: "Open Models on CursorBench 3.2: Grok 4.5, GLM 5.2, Kimi K2.7, and LongCat"
slug: open-models-cursorbench-3-2-grok-glm-kimi-longcat
date: 2026-07-10
status: published
tags:
  - Agentic AI
  - Enterprise AI
  - AI Quality
  - Generative AI
excerpt: >-
  Open-model launch posts cite SWE-bench; CursorBench cites session cost. Here is
  how to read Grok, GLM, Kimi, and LongCat for buying decisions — not picker hype alone.
featured_image: /images/posts/open-models-cursorbench-3-2-grok-glm-kimi-longcat.png
featured_image_alt: >-
  Three seedlings sprouting from cracked concrete under distinct colored light
  filters, morning mist, macro editorial, no logos or readable text.
focus_keyword: Grok 4.5 Cursor benchmark
seo_description: "Open models on CursorBench 3.2: Grok 4.5 vs GLM 5.2 vs Kimi K2.7 Code with cost and steps, plus LongCat SWE-bench context. Budget picks vs Composer 2.5 on Cursor sessions."
related_posts:
  - cursorbench-3-2-fable-5-composer-2-5-cost-vs-score
  - cursorbench-vs-swe-bench-vs-human-eval
  - best-cursor-model-by-task-2026
image_prompt: "Cinematic 16:9 macro of three different seeds sprouting from cracked concrete, each under a distinct colored gel filter (teal, amber, violet), morning mist, no logos, no readable text."
image_prompt_variant_1: "Surreal 16:9 greenhouse at night: three bioluminescent plants in separate terrariums on a bench, irrigation tubes cross but do not merge, deep green and copper light, no readable labels, no logos."
image_prompt_variant_2: "Bold 16:9 isometric cutaway: three open-source crates on a loading dock with separate bill-of-lading icons, dashed line to a Cursor terminal shape, risograph texture, no logos, no readable text."
format: hybrid
best_for: Anyone comparing open-model vendor claims to Cursor session economics before changing defaults
---

> **Cluster:** [CursorBench 3.2 hub](/posts/cursorbench-3-2-fable-5-composer-2-5-cost-vs-score) · [Benchmark lenses](/posts/cursorbench-vs-swe-bench-vs-human-eval) · [Best model by work mode](/posts/best-cursor-model-by-task-2026)

## What are open models on CursorBench 3.2?

**Open-weight and xAI coding models** (Grok 4.5, GLM 5.2, Kimi K2.7 Code) appear on [CursorBench 3.2](https://cursor.com/evals) with **score, cost, tokens, and steps** per Cursor agent task. **LongCat 2.0** publishes strong **SWE-bench** rows on its vendor site but **no CursorBench row** at the time of writing.

**Who it is for:** **Anyone** comparing open-model launch posts to what Cursor sessions actually cost — founders, students on a budget, operators, and procurement reviewers alike.

**What you will learn:** CursorBench rows for Grok, GLM, and Kimi on the 3.2 battery, how LongCat's vendor table differs, and when public numbers justify a policy change.

---

Open models entered everyday conversations with two stories. Vendors cite **SWE-bench** and **long-context** wins. CursorBench cites **ambiguous multi-file agent sessions** with a **bill attached**.

Those stories overlap. They are not the same test — and you pay for the difference when defaults follow the wrong chart.

## Why open models need two tables

| Source | Measures | Open-model signal |
|--------|----------|-------------------|
| **CursorBench 3.2** | Cursor agent loop, cost, steps; adds instruction-following + tool-use tasks | Budget reality in the IDE |
| **Vendor evaluations** | SWE-bench, Terminal-Bench, etc. | Coding quality under vendor harness |
| **Missing row** | LongCat on CursorBench | Cannot price LongCat per Cursor task yet |

Read both. Do not rank LongCat against Composer on Cursor dollars until a CursorBench row exists.

## CursorBench rows (benchmarked)

Benchmarked numbers (from [CursorBench 3.2](https://cursor.com/evals)):

| Model | Score | Cost / task | Tokens / task | Steps / task |
|-------|------:|------------:|--------------:|-------------:|
| Grok 4.5 High* | 66.7% | $1.51 | 19,521 | 33 |
| Grok 4.5 Medium* | 65.4% | $1.54 | 18,914 | 34 |
| Grok 4.5 Low* | 63.5% | $1.22 | 15,841 | 31 |
| Composer 2.5 (reference) | 56.1% | $0.44 | 14,286 | 33 |
| GLM 5.2 Max | 55.0% | $1.76 | 35,946 | 58 |
| GLM 5.2 High | 51.5% | $1.19 | 21,829 | 49 |
| Kimi K2.7 Code | 49.7% | $1.43 | 31,247 | 58 |

\* Cursor states Grok 4.5 may have an advantage because Cursor codebase snapshot was unintentionally included in training; exact impact unclear ([evals disclaimer](https://cursor.com/evals)).

### Grok 4.5 (xAI)

Grok 4.5 ships as **Low / Medium / High** effort tiers on CursorBench 3.2. **Grok 4.5 High** lands **66.7%** at **$1.51** and **33 steps** — above Composer on score with similar step count, at roughly **3.4×** Composer's benchmark cost.

**Practical read:** Grok is the headline **score-per-dollar challenger** to Fable on the public table, but treat the row as **directional** until you read Cursor's training-data footnote. Do not swap team defaults without validating on real program tasks.

### GLM 5.2 ([Z.ai](https://z.ai/blog/glm-5.2))

Z.ai positions GLM 5.2 for long-horizon agent work with **1M-token context** and MIT licensing. Vendor tables cite FrontierSWE, Terminal-Bench, and SWE-bench Pro.

**On CursorBench 3.2:** GLM 5.2 Max lands **55.0%** at **$1.76** with **58 steps**. That is **~1.1 points below Composer 2.5** with **nearly double** the steps (58 vs 33).

**Practical read:** GLM remains credible when **context length** or **self-hosting** matters. On ambiguous Cursor sessions on the public table, it does not beat Composer on score or step efficiency.

### Kimi K2.7 Code ([Moonshot](https://www.kimi.com/resources/kimi-k2-7-code))

Kimi K2.7 Code targets **agentic coding** with thinking mode required in Kimi Code workflows.

**On CursorBench 3.2:** **49.7%** at **$1.43** and **58 steps**. **Score per dollar** is mid-pack (~35 when derived from public rows), but **58 steps** is heavy agent churn for a sub-50% score.

**Practical read:** Inexpensive exploratory model. Not a drop-in Composer replacement on this harness.

```d2
direction: right

composer: "Composer 2.5\n56.1%\n33 steps\n0.44 USD" {
  style.fill: "#f0faf5"
  style.stroke: "#2d9f6f"
  style.border-radius: 8
}

grok: "Grok 4.5 High*\n66.7%\n33 steps" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

glm: "GLM 5.2 Max\n55.0%\n58 steps" {
  style.fill: "#f5f8ff"
  style.stroke: "#4a7cff"
  style.border-radius: 8
}

kimi: "Kimi K2.7\n49.7%\n58 steps" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

composer -> grok: "score gap*" { style.stroke-dash: 8 }
composer -> glm: "open weight" { style.stroke-dash: 8 }
composer -> kimi: "cost vs churn" { style.stroke-dash: 8 }
```

## LongCat 2.0: vendor SWE-bench strength, no CursorBench row

[LongCat 2.0](https://longcat.chat/blog/longcat-2.0/) is Meituan's agentic coding model (MIT license, **1M context**, MoE architecture). It ran on OpenRouter as Owl Alpha before launch.

Meituan publishes in-house **Evaluations** with SWE-bench and Terminal-Bench rows. Example coding rows from their table (vendor-reported):

| Benchmark | LongCat-2.0 | Notes |
|-----------|------------:|-------|
| SWE-bench Pro | 59.5 | Compared against GPT-5.5 (58.6*) and Gemini (54.2*) in vendor table |
| Terminal-Bench 2.1 | 70.8 | Tight cluster with Gemini 70.7* |
| SWE-bench Multilingual | 77.3 | Opus 4.8 leads at 84.8* in same table |

`*` = external score per LongCat's footnotes.

**CursorBench gap:** LongCat does not appear in CursorBench 3.2 yet. You cannot line it up against Fable 5, Grok 4.5, or Composer on **cost and steps per Cursor session**.

**Practical read:** LongCat is a **watchlist** model for open coding quality. Wait for a CursorBench row before changing Cursor defaults based on vendor SWE-bench alone. See [benchmark comparison](/posts/cursorbench-vs-swe-bench-vs-human-eval).

## Derived efficiency (from public CursorBench rows)

| Model | Score / USD (derived) | Score / step (derived) |
|-------|----------------------:|-----------------------:|
| Composer 2.5 | 127.5 | 1.70 |
| Grok 4.5 Low* | 52.0 | 2.05 |
| Grok 4.5 High* | 44.2 | 2.02 |
| Kimi K2.7 Code | 34.8 | 0.86 |
| GLM 5.2 High | 43.3 | 1.05 |
| GLM 5.2 Max | 31.3 | 0.95 |

Composer 2.5 remains the extreme **score-per-USD** outlier on the table. Grok tiers trade higher benchmark cost for higher score — read Cursor's Grok footnote before treating that as a fair fight.

## When to pick an open model in Cursor

| Situation | Sensible pick |
|-----------|---------------|
| Daily agent tasks on budget | Composer 2.5 |
| Higher score, still under ~2 USD/task | Grok 4.5 Low/Medium* (validate caveat) |
| Open-weight requirement, mid budget | Kimi K2.7 for experiments; watch steps |
| 1M context, self-host path | GLM 5.2 outside Cursor or when context is the bottleneck |
| Vendor SWE-bench leader, no Cursor row | LongCat: monitor; do not assume Cursor economics |

## Limitations

- **Grok 4.5** scores may be inflated by training-data overlap per Cursor's disclaimer.
- Vendor long-horizon scores may use **hour-scale** runs CursorBench does not simulate.
- Moonshot and Z.ai harnesses differ from Cursor's agent loop.
- License and hosting constraints are out of scope for this table; verify terms before production use.

## Reader action

1. Open [CursorBench 3.2](https://cursor.com/evals) and confirm Grok, GLM, and Kimi rows still match.
2. Read the **Grok 4.5** footnote on the evals page before changing defaults.
3. Run one task on Kimi or Grok Low and log **steps** versus Composer on the same prompt.
3. Bookmark LongCat evals; re-check when Cursor adds a row.
4. Read [Fable tier pricing](/posts/fable-5-pricing-cursor-every-tier-explained) if you escalate from budget open models to frontier closed models.
