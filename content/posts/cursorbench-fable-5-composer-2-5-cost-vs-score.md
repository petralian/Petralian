---
title: "CursorBench 3.1: Fable 5 Tops the Chart, but Composer 2.5 Wins the Budget"
slug: cursorbench-fable-5-composer-2-5-cost-vs-score
date: 2026-07-02
status: published
category: AI & Building
tags:
  - Agentic AI
  - Developer Tools
  - AI Quality
  - Generative AI
excerpt: Anthropic's Fable 5 leads CursorBench 3.1 at 72.9%, but at $18 per task and 76 steps. I read the table for score per dollar, tokens, and steps, and where open models land.
featured_image: /images/posts/cursorbench-fable-5-composer-2-5-cost-vs-score.png
focus_keyword: CursorBench Fable 5 Composer 2.5 cost
seo_description: "CursorBench 3.1 analysis: Fable 5 Max scores 72.9% but costs $18/task. Composer 2.5 hits 63.2% at $0.55. Compare GLM 5.2, Kimi K2.7 Code, LongCat 2.0."
image_prompt: "Editorial 16:9 chart desk scene: scatter plot of agent scores vs cost with one bright outlier dot in the efficient corner, warm technical lighting, no logos, no readable text."
image_prompt_variant_1: "Tiny auction hall: trophy labeled Max Score priced at a huge stack of coins while a modest toolbox labeled Composer sells for one coin, clever workshop, 16:9."
image_prompt_variant_2: "Split editorial infographic: left tall expensive staircase of agent steps, right short ladder with checkmarks, professional playful tone, 16:9."
---

Anthropic brought Fable 5 back to public Cursor model pickers. Cursor published fresh numbers on [CursorBench 3.1](https://cursor.com/evals): ambiguous, multi-file tasks drawn from real agent sessions. Fable 5 Max sits at the top of the score column.

I read the table the way I read infra bills: not who wins one column, but what you pay per accepted outcome.

On this benchmark, the highest score and the best buy are not the same model.

## The problem: leaderboard scores hide unit economics

Vendor launches train us to look at rank. CursorBench reports four numbers that matter together:

1. **Score** (task success rate on their battery)
2. **Cost per task** (priced from published per-million-token rates)
3. **Tokens per task**
4. **Steps per task** (agent turns until close)

A model can score 73% and still be a bad default if it spends 76 steps and $18 to get there. Another model can land at 63% for $0.55. For daily shipping work, that gap changes how many tasks you can afford in a month.

Cursor notes that results have variance and small score gaps may not be statistically meaningful. Treat the table as directional, not gospel. It is still useful for tradeoff thinking.

## What CursorBench 3.1 measures

Version 3.1 added tasks focused on codebase understanding, bugfinding, planning, and code review. Earlier 3.0 work centered on edit, refactor, and bugfix problems.

That matters when you compare models. A benchmark heavy on multi-step diagnosis rewards models that plan well. It also rewards models that **stop** instead of burning steps on the wrong file.

## Fable 5: performance tier, pricing ladder

Fable 5 ships as a family. On CursorBench 3.1 the spread is wide:

| Model | Score | Cost / task | Tokens / task | Steps / task |
|-------|------:|------------:|--------------:|-------------:|
| Fable 5 Max | 72.9% | $18.02 | 63,842 | 76 |
| Fable 5 Extra High | 72.0% | $13.74 | 48,754 | 63 |
| Fable 5 High | 70.6% | $10.81 | 37,173 | 54 |
| Fable 5 Medium | 69.8% | $8.27 | 28,507 | 47 |
| Fable 5 Low | 64.2% | $5.70 | 18,882 | 36 |

**Raw performance winner:** Fable 5 Max at **72.9%**.

**Cost story:** Max is roughly **33×** more expensive per task than Composer 2.5 ($18.02 vs $0.55) for about **10 percentage points** more score (72.9% vs 63.2%).

**Steps story:** Max takes **76 steps**. Opus 4.7 Max takes **96**. Sonnet 5 Max takes **93 steps** for only **61.2%** score. High step counts are not free. They add latency, context churn, and review fatigue even when the task eventually passes.

If your work is high stakes and failure is expensive, the top Fable tier can be rational. If you run dozens of agent tasks a week, the Max row is a specialty tool, not a default.

## Three efficiency lenses (derived from the table)

I computed three simple ratios from the public CursorBench rows. They are not official Cursor metrics. They help compare models side by side.

### Score per dollar (higher is better)

| Model | Score / $1 |
|-------|-----------:|
| **Composer 2.5** | **114.9** |
| GPT-5.5 Medium | 26.7 |
| Kimi K2.7 Code | 27.4 |
| GPT-5.5 High | 17.4 |
| Fable 5 Low | 11.3 |
| GLM 5.2 High | 20.6 |
| GLM 5.2 Max | 17.6 |
| Fable 5 Max | 4.0 |

Composer 2.5 is an extreme outlier on cost efficiency. Nothing else in the top third of the scoreboard comes close on score per dollar.

### Score per 1K tokens (higher is better)

| Model              | Score / 1K tokens |
| ------------------ | ----------------: |
| **GPT-5.5 Medium** |          **6.53** |
| GPT-5.5 High       |              4.70 |
| Composer 2.5       |              4.17 |
| GPT-5.5 Extra High |              3.59 |
| Fable 5 Medium     |              2.45 |
| GLM 5.2 Max        |              1.06 |
| Sonnet 5 Max       |              0.65 |

GPT-5.5 Medium uses only **9,065 tokens per task** at **59.2%** score. Sonnet 5 Max burns **93,485 tokens** for **61.2%**. That is a brutal token tax for a modest score bump.

### Score per step (higher is better)

| Model           | Score / step |
| --------------- | -----------: |
| **Fable 5 Low** |     **1.78** |
| Composer 2.5    |         1.71 |
| GPT-5.5 Medium  |         1.69 |
| Fable 5 Medium  |         1.49 |
| Kimi K2.7 Code  |         0.75 |
| GLM 5.2 Max     |         0.66 |
| Opus 4.7 Max    |         0.68 |
| Sonnet 5 Max    |         0.66 |

Composer 2.5 and the lighter Fable / GPT-5.5 tiers finish in fewer steps. Heavy Max tiers and several Opus / Sonnet Max configs look expensive per step.

```d2
direction: right

need: "Your need" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

budget: "Daily shipping\nComposer 2.5" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

max: "Must not fail\nFable 5 Medium or High" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

need -> budget: "cost cap" { style.stroke-dash: 8 }
need -> max: "highest score" { style.stroke-dash: 8 }
```

## Composer 2.5: the Pareto surprise

Cursor's chart plots score against average cost. Composer 2.5 sits in the corner you want: **63.2%** score, **$0.55** per task, **15,152 tokens**, **37 steps**.

That is not a perfect score. It beats **27 of 36** listed models on the public table while costing less than a coffee per task in the benchmark's pricing model.

I run Composer 2.5 as my default coding model in Cursor for a related reason: predictable rule compliance and a tighter session bootstrap beat frontier roulette on the work I ship daily. CursorBench gives that habit a cost line item. The model is not just cheaper. It is **efficient** on this task mix.

## GPT-5.5: the token miser

GPT-5.5 Medium (**59.2%**, **$2.22**, **9,065 tokens**, **35 steps**) is the best token budget story in the table. Extra High reaches **64.3%** at **$4.37** with still-reasonable tokens.

If your constraint is context window pressure or API token caps, GPT-5.5 Medium deserves a look. You give up peak score versus Fable Max. You buy back tokens and steps.

## Open models on CursorBench: GLM 5.2 and Kimi K2.7 Code

CursorBench includes two open-weight families I watch closely.

### GLM 5.2 ([Z.ai launch post](https://z.ai/blog/glm-5.2))

Z.ai positions GLM 5.2 for **long-horizon** agent work: **1M-token context**, MIT license, effort levels (High vs Max), and strong vendor-reported scores on FrontierSWE, Terminal-Bench 2.1, and SWE-bench Pro. On their table GLM 5.2 Max lands near Opus 4.8 on several coding benches while leading open source.

**On CursorBench 3.1 (Cursor's harness, not Z.ai's):**

| Model | Score | Cost / task | Tokens / task | Steps / task |
|-------|------:|------------:|--------------:|-------------:|
| GLM 5.2 Max | 54.6% | $3.11 | 51,312 | 83 |
| GLM 5.2 High | 50.7% | $2.46 | 30,621 | 76 |

GLM 5.2 is **cheap versus Fable Max** and **open**. On this benchmark it scores **~9 points below Composer 2.5** while using **more steps** (83 vs 37 on Max). Vendor long-horizon numbers and Cursor session tasks are not the same test. GLM may shine on hour-scale runs that CursorBench does not simulate.

Practical read: GLM 5.2 is a serious open option when you need **1M context** or self-hosting. For Cursor agent sessions on ambiguous repo tasks, the public table does not show it beating Composer 2.5 on score or step efficiency.

### Kimi K2.7 Code ([Moonshot resource page](https://www.kimi.com/resources/kimi-k2-7-code))

Kimi K2.7 Code is an open **coding-focused** agentic model. Moonshot reports gains over K2.6 on Kimi Code Bench v2, Program Bench, and MLS Bench Lite, plus roughly **30% lower thinking-token usage** than K2.6. Thinking mode is required; non-thinking requests fall back to K2.6 in Kimi Code.

**On CursorBench 3.1:**

| Model | Score | Cost / task | Tokens / task | Steps / task |
|-------|------:|------------:|--------------:|-------------:|
| Kimi K2.7 Code | 52.7% | $1.92 | 32,902 | 70 |

K2.7 is **inexpensive** and lands mid-table on score. Score per dollar is strong (**~27**), but **70 steps** for **52.7%** is a lot of agent churn. Moonshot's own benches use Kimi Code CLI with thinking enabled; Cursor's agent loop may not map 1:1.

Practical read: K2.7 Code is compelling for **open-source agent coding** and terminal/IDE workflows Kimi controls end to end. On CursorBench it reads as a budget exploratory model, not a drop-in replacement for Composer 2.5 on score.

## LongCat 2.0: strong vendor benches, no CursorBench row yet

[LongCat 2.0](https://longcat.chat/blog/longcat-2.0/) is Meituan's **1.6T-parameter MoE** agentic coding model (MIT license, **1M context**, ~48B active parameters per token). It ran on OpenRouter for months as **Owl Alpha** before the official launch.

Meituan publishes a full **Evaluations** table on the LongCat site. Unless marked with `*`, scores were measured **in-house under a unified harness**. Asterisk rows cite external vendor numbers. That is more disciplined than a single headline chart, but it is still **not** CursorBench. Read it as a different test battery on a different loop.

### Code agent benchmarks (LongCat vs frontier)

| Benchmark | LongCat-2.0 | Gemini 3.1 Pro | GPT-5.5 | Opus 4.8 |
|-----------|------------:|---------------:|--------:|---------:|
| Terminal-Bench 2.1 | **70.8** | 70.7* | 73.8* | **78.9*** |
| SWE-bench Pro | **59.5** | 54.2* | 58.6* | **69.2*** |
| SWE-bench Multilingual | **77.3** | 76.9* | — | **84.8*** |

`*` = external score per LongCat's table.

**How to read this:**

- **Opus 4.8 leads coding** on Terminal-Bench and both SWE-bench variants in Meituan's comparison set. The gap on SWE-bench Pro is large (**69.2** vs **59.5**).
- **LongCat beats GPT-5.5 on SWE-bench Pro** (**59.5** vs **58.6***) and sits **one tick above Gemini** on the same bench (**54.2***).
- **Terminal-Bench** is tight: LongCat **70.8**, Gemini **70.7***, GPT-5.5 **73.8***, Opus 4.8 **78.9***. LongCat is in the pack, not at the front.
- **SWE-bench Multilingual** is Opus territory (**84.8***). LongCat **77.3** is respectable but not leading.

On pure **software engineering** rows, LongCat looks like a credible open-weight coding model. It does not look like it clears the Opus 4.8 bar on these charts.

### General agent benchmarks

| Benchmark | LongCat-2.0 | Gemini 3.1 Pro | GPT-5.5 | Opus 4.8 |
|-----------|------------:|---------------:|--------:|---------:|
| FORTE | 73.2 | 70.3 | **77.8** | 77.2 |
| BrowseComp | 79.9 | **85.9*** | 84.4* | 84.3* |
| RWSearch | 78.8 | 76.3 | **85.3** | 77.3 |

LongCat is **mid-pack on general agent work**. GPT-5.5 wins **FORTE** and **RWSearch** in this table. Gemini leads **BrowseComp**. LongCat is consistent (high 70s) but not dominant outside coding-specific rows.

### Foundational (selected rows)

| Benchmark | LongCat-2.0 | Gemini 3.1 Pro | GPT-5.5 | Opus 4.8 |
|-----------|------------:|---------------:|--------:|---------:|
| IFEval | 90.0 | **96.1** | 95.0 | 86.0 |
| Writing Bench | 83.8 | 83.7 | 84.7 | 85.2 |
| IMO-AnswerBench | **81.8** | 90.0 | 79.5 | 75.3 |
| GPQA-diamond | 88.9 | **94.3*** | 93.6* | 92.4* |

LongCat is competitive on writing and reasoning subsets. Gemini and GPT-5.5 still lead several foundational rows. This matters if you want one model for **coding plus general research**. LongCat's pitch is narrower: **agentic coding at repo scale**.

### LongCat vs CursorBench (why both tables matter)

**LongCat 2.0 does not appear in the CursorBench 3.1 table** at the time of writing. You cannot yet line it up against Fable 5 or Composer 2.5 on **cost, tokens, and steps per real Cursor session**.

That gap is the whole point of comparing sources:

| Lens | What it measures | LongCat signal |
|------|------------------|----------------|
| **Meituan Evaluations** | SWE-bench, Terminal-Bench, FORTE, etc. | Strong open coding model; trails Opus 4.8 on code rows |
| **CursorBench 3.1** | Ambiguous multi-file tasks from Cursor agent sessions | No row yet; Composer 2.5 at **63.2%** / **$0.55** / **37 steps** |

A model can score **59.5** on SWE-bench Pro and still burn **70+ steps** on a Cursor storefront bug. Or the reverse. Until LongCat ships on Cursor's eval page, treat the vendor charts as **capability marketing** and CursorBench as **IDE economics**.

Practical read:

- **Try LongCat** when you want **open weights**, **1M context**, and **OpenRouter-style API pricing** for repo-scale agent work.
- **Do not drop Composer 2.5** as a Cursor default because LongCat edges GPT-5.5 on one SWE-bench row.
- **Watch for the CursorBench row.** Compare **steps** and **cost per task**, not just score. Open models often look better on vendor harnesses than on agent-loop efficiency.

Early builder commentary outside Meituan's tables is mixed: strong infra story (large domestic training cluster), but some preview users report rough agent edges. Hands-on beats bar charts.

## Models I would not default to (on this table)

These are benchmark-specific callouts, not permanent verdicts:

| Model | Why flag it |
|-------|-------------|
| **Sonnet 5 Max** | 93K tokens, 93 steps, 61.2% score |
| **Opus 4.7 Max** | 96 steps, $11.02/task, 64.8% score |
| **Fable 5 Max** | ~10 points above Composer 2.5, ~33× the cost |
| **GLM 5.2 Max** (on CursorBench) | 83 steps, 54.6% score |

Max tiers can still make sense for one-shot critical work. They are poor defaults for high-volume agent loops.

## How I pick models after reading the table

| Need | Model to try first | Why |
|------|-------------------|-----|
| **Best value on Cursor tasks** | Composer 2.5 | Top-third score, lowest cost, low steps |
| **Tight token budget** | GPT-5.5 Medium | 9K tokens/task, decent score |
| **Highest score, budget open** | Fable 5 Medium | 69.8% at $8.27 (not Max) |
| **Must maximize pass rate** | Fable 5 Max | 72.9% if cost is secondary |
| **Open weights + 1M context** | GLM 5.2 or LongCat 2.0 | GLM on CursorBench today; LongCat strong on vendor SWE-bench, unmeasured on Cursor cost/steps |
| **Open Kimi stack** | Kimi K2.7 Code | Cheap on CursorBench; validate in Kimi Code CLI |

Model choice is one lever. **Context bootstrap** is the other. I benchmark file memory separately because a $0.55 model with a 3K-token gotchas pack can beat a $18 model that reads the wrong layer first. Stack both levers.

## What you can do next

1. Open [CursorBench 3.1](https://cursor.com/evals) and sort by **cost**, not just score.
2. Compute **score per dollar** and **score per step** for the two models you actually use.
3. Run **one real repo task** twice: frontier Max vs your daily model. Log tokens, steps, and whether you shipped.
4. For **LongCat**, read Meituan's Evaluations table (code vs general agent rows) separately from CursorBench. Wait for a Cursor row before judging IDE economics.
5. If you test **GLM 5.2** or **K2.7**, compare Cursor against the vendor's native CLI before trusting launch blog tables.
6. Keep **Composer 2.5** (or GPT-5.5 Medium) as default; promote Fable Max only when failure cost exceeds ~$17 per task of headroom.

The benchmark answered a question vendors often skip: **what does the top score cost in steps and dollars?** On CursorBench 3.1, Fable 5 wins the headline. Composer 2.5 wins the spreadsheet.

---

**Sources**

1. Cursor, "CursorBench 3.1." https://cursor.com/evals
2. Z.ai, "GLM-5.2: Built for Long-Horizon Tasks." https://z.ai/blog/glm-5.2
3. Moonshot AI, "Kimi K2.7 Code." https://www.kimi.com/resources/kimi-k2-7-code
4. Meituan, "Introducing LongCat-2.0" (Evaluations table). https://longcat.chat/blog/longcat-2.0/
