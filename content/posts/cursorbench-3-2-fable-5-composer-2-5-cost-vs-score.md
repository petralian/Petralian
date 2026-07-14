---
title: 'CursorBench 3.2: Fable 5 Tops the Chart, but Composer 2.5 Wins the Budget'
slug: cursorbench-3-2-fable-5-composer-2-5-cost-vs-score
date: 2026-07-02
status: published
tags:
  - Agentic AI
  - Enterprise AI
  - AI Quality
  - Generative AI
excerpt: >-
  Fable 5 Max leads CursorBench 3.2 at 70.5%, but at 17 USD per task and 72
  steps. Grok 4.5 High scores 66.7% at 1.51 USD. Composer 2.5 still wins score per dollar at 56.1% and 0.44 USD.
featured_image: /images/posts/cursorbench-3-2-fable-5-composer-2-5-cost-vs-score.png
focus_keyword: CursorBench 3.2 Fable 5 Composer 2.5 cost
seo_description: >-
  CursorBench 3.2 analysis: Fable 5 Max scores 70.5% but costs 17.32 USD/task.
  Grok 4.5 High hits 66.7%. Composer 2.5 hits 56.1% at 0.44 USD. Compare GLM, Kimi, LongCat.
related_posts:
  - fable-5-pricing-cursor-every-tier-explained
  - when-to-escalate-composer-2-5-to-fable-5
  - open-models-cursorbench-3-2-grok-glm-kimi-longcat
  - best-cursor-model-by-task-2026
image_prompt: >-
  Cinematic 16:9 macro photograph: scatter-plot points carved as glowing marbles
  on a dark slate surface, one small green marble isolated in the efficient
  corner while a tall gold marble towers over a stack of coins, dramatic side
  lighting, shallow depth of field, no logos, no readable text.
image_prompt_variant_1: >-
  Surreal 16:9 flea-market scene: a jeweled trophy on a velvet pedestal priced
  with towering coin stacks while a modest wrench set sits on a folding table
  with a single coin, warm tungsten bulbs overhead, witty editorial tone, no
  readable text, no logos.
image_prompt_variant_2: >-
  Bold 16:9 isometric cutaway poster: a skyscraper staircase of agent steps on
  the left versus a compact stepladder with three checkmarks on the right, flat
  graphic shapes, violet and amber accents, risograph texture, no logos, no
  readable text.
format: hybrid
best_for: Practice leads and commercial operators setting Cursor AI model policy using CursorBench unit economics
---
**TL;DR**

- Fable 5 Max leads CursorBench 3.2 at **70.5%**, but at **$17.32** per task and **72 steps**.
- Grok 4.5 High hits **66.7%** at **$1.51** with a Cursor training-data caveat.
- Composer 2.5 still wins **score per dollar** at **56.1%** and **$0.44**.

When teams scale Cursor across programs, **model defaults become a budget line** — not a hobby for power users. CursorBench 3.2 is one input to that decision: it reports what top scores **cost** in dollars, tokens, and agent steps on real multi-file sessions ([Cursor evals](https://cursor.com/evals)).

Anthropic brought Fable 5 back to public Cursor model pickers. Fable 5 Max sits at the top of the score column — and at the top of the cost column.

## What is CursorBench 3.2?

**CursorBench 3.2** is Cursor's **agent-task benchmark**: success rate, cost per task, tokens per task, and steps per task on ambiguous, multi-file work drawn from real sessions—not a single leaderboard column.

**Who it is for:** practice leads and commercial operators choosing **default models in Cursor** who need **unit economics** (score per dollar, score per step), not vendor launch headlines.

**What you will learn:** why Fable 5 Max and Composer 2.5 answer different questions, three derived efficiency lenses, how **Grok 4.5** fits between Fable and Composer (with Cursor's training caveat), and how open models (GLM 5.2, Kimi K2.7, LongCat) compare on vendor benches vs Cursor rows.

---

I read the table the way I read infra bills: not who wins one column, but what you pay per accepted outcome.

On this benchmark, the highest score and the best buy are not the same model.

## The problem: leaderboard scores hide unit economics

Vendor launches train us to look at rank. CursorBench reports four numbers that matter together:

1. **Score** (task success rate on their battery)
2. **Cost per task** (priced from published per-million-token rates)
3. **Tokens per task**
4. **Steps per task** (agent turns until close)

A model can score 71% and still be a bad default if it spends 72 steps and $17 to get there. Another model can land at 56% for $0.44. For daily shipping work, that gap changes how many tasks you can afford in a month.

Cursor notes that results have variance and small score gaps may not be statistically meaningful. Treat the table as directional, not gospel. It is still useful for tradeoff thinking.

## What CursorBench 3.2 measures

Version 3.2 adds instruction following and advanced tool use on top of 3.1's codebase understanding, bugfinding, planning, and code review tasks.

That matters when you compare models. A benchmark heavy on multi-step diagnosis rewards models that plan well. It also rewards models that **stop** instead of burning steps on the wrong file.

## Fable 5: performance tier, pricing ladder

Fable 5 ships as a family. On CursorBench 3.2 the spread is wide:

| Model | Score | Cost / task | Tokens / task | Steps / task |
|-------|------:|------------:|--------------:|-------------:|
| Fable 5 Max | 70.5% | $17.32 | 103,525 | 72 |
| Fable 5 Extra High | 68.4% | $11.73 | 64,971 | 56 |
| Fable 5 High | 66.5% | $8.77 | 43,747 | 48 |
| Fable 5 Medium | 65.2% | $6.80 | 30,366 | 41 |
| Fable 5 Low | 62.1% | $4.46 | 18,182 | 31 |

**Raw performance winner:** Fable 5 Max at **70.5%**.

**Cost story:** Max is roughly **39×** more expensive per task than Composer 2.5 ($17.32 vs $0.44) for about **14.4 percentage points** more score (70.5% vs 56.1%).

**Steps story:** Max takes **72 steps**. Opus 4.7 Max takes **96**. Sonnet 5 Max takes **93 steps** for only **61.2%** score. High step counts are not free. They add latency, context churn, and review fatigue even when the task eventually passes.

If your work is high stakes and failure is expensive, the top Fable tier can be rational. If you run dozens of agent tasks a week, the Max row is a specialty tool, not a default.

## Three efficiency lenses (derived from the table)

I computed three simple ratios from the public CursorBench rows. They are not official Cursor metrics. They help compare models side by side.

### Score per dollar (higher is better)

| Model | Score / $1 |
|-------|-----------:|
| **Composer 2.5** | **127.5** |
| GPT-5.5 Medium | 26.7 |
| Kimi K2.7 Code | 34.8 |
| GPT-5.5 High | 17.4 |
| Fable 5 Low | 11.3 |
| GLM 5.2 High | 43.3 |
| GLM 5.2 Max | 31.3 |
| Fable 5 Max | 4.1 |

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

## Additional detail

### Composer 2.5: the Pareto surprise

Cursor's chart plots score against average cost. Composer 2.5 sits in the corner you want: **56.1%** score, **$0.44** per task, **14,286 tokens**, **33 steps**.

That is not a perfect score. It remains the **score-per-dollar** outlier on the public table while costing less than a coffee per task in the benchmark's pricing model.

I run Composer 2.5 as my default coding model in Cursor for a related reason: predictable rule compliance and a tighter session bootstrap beat frontier roulette on the work I ship daily. CursorBench gives that habit a cost line item. The model is not just cheaper. It is **efficient** on this task mix.

### GPT-5.5: the token miser

GPT-5.5 Medium (**53.8%**, **$1.51**, **8,522 tokens**, **25 steps**) is the best token budget story in the table. Extra High reaches **58.4%** at **$2.85** with still-reasonable tokens.

If your constraint is context window pressure or API token caps, GPT-5.5 Medium deserves a look. You give up peak score versus Fable Max. You buy back tokens and steps.


### Grok 4.5: score bump with a caveat

**Grok 4.5 High** lands **66.7%** at **$1.51**, **19,521 tokens**, and **33 steps** on CursorBench 3.2 — between Fable High and Medium on score at a fraction of Fable cost. Cursor flags that Grok 4.5 may have an advantage because a Cursor codebase snapshot was unintentionally included in training; exact impact is unclear ([evals disclaimer](https://cursor.com/evals)).

**Practical read:** Grok is the headline **score-per-dollar challenger** to Fable on the public table, but treat the row as **directional** until you validate on your repo and read the footnote. See [open models on CursorBench 3.2](/posts/open-models-cursorbench-3-2-grok-glm-kimi-longcat).

### Open models on CursorBench: GLM 5.2 and Kimi K2.7 Code

CursorBench includes two open-weight families I watch closely.

### GLM 5.2 ([Z.ai launch post](https://z.ai/blog/glm-5.2))

Z.ai positions GLM 5.2 for **long-horizon** agent work: **1M-token context**, MIT license, effort levels (High vs Max), and strong vendor-reported scores on FrontierSWE, Terminal-Bench 2.1, and SWE-bench Pro. On their table GLM 5.2 Max lands near Opus 4.8 on several coding benches while leading open source.

**On CursorBench 3.2 (Cursor's harness, not Z.ai's):**

| Model | Score | Cost / task | Tokens / task | Steps / task |
|-------|------:|------------:|--------------:|-------------:|
| GLM 5.2 Max | 55.0% | $1.76 | 35,946 | 58 |
| GLM 5.2 High | 51.5% | $1.19 | 21,829 | 49 |

GLM 5.2 is **cheap versus Fable Max** and **open**. On this benchmark Max scores **~1 point below Composer 2.5** while using **more steps** (58 vs 33). Vendor long-horizon numbers and Cursor session tasks are not the same test. GLM may shine on hour-scale runs that CursorBench does not simulate.

Practical read: GLM 5.2 is a serious open option when you need **1M context** or self-hosting. For Cursor agent sessions on ambiguous repo tasks, the public table does not show it beating Composer 2.5 on score or step efficiency.

### Kimi K2.7 Code ([Moonshot resource page](https://www.kimi.com/resources/kimi-k2-7-code))

Kimi K2.7 Code is an open **coding-focused** agentic model. Moonshot reports gains over K2.6 on Kimi Code Bench v2, Program Bench, and MLS Bench Lite, plus roughly **30% lower thinking-token usage** than K2.6. Thinking mode is required; non-thinking requests fall back to K2.6 in Kimi Code.

**On CursorBench 3.2:**

| Model | Score | Cost / task | Tokens / task | Steps / task |
|-------|------:|------------:|--------------:|-------------:|
| Kimi K2.7 Code | 49.7% | $1.43 | 31,247 | 58 |

K2.7 is **inexpensive** but lands below Composer on score. Score per dollar is mid-pack (**~35**), and **58 steps** for **49.7%** is heavy agent churn. Moonshot's own benches use Kimi Code CLI with thinking enabled; Cursor's agent loop may not map 1:1.

Practical read: K2.7 Code is compelling for **open-source agent coding** and terminal/IDE workflows Kimi controls end to end. On CursorBench it reads as a budget exploratory model, not a drop-in replacement for Composer 2.5 on score.

### Additional detail

### LongCat 2.0: strong vendor benches, no CursorBench row yet

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

**LongCat 2.0 does not appear in the CursorBench 3.2 table** at the time of writing. You cannot yet line it up against Fable 5 or Composer 2.5 on **cost, tokens, and steps per real Cursor session**.

That gap is the whole point of comparing sources:

| Lens | What it measures | LongCat signal |
|------|------------------|----------------|
| **Meituan Evaluations** | SWE-bench, Terminal-Bench, FORTE, etc. | Strong open coding model; trails Opus 4.8 on code rows |
| **CursorBench 3.2** | Ambiguous multi-file tasks from Cursor agent sessions | No row yet; Composer 2.5 at **56.1%** / **$0.44** / **33 steps** |

A model can score **59.5** on SWE-bench Pro and still burn **70+ steps** on a Cursor storefront bug. Or the reverse. Until LongCat ships on Cursor's eval page, treat the vendor charts as **capability marketing** and CursorBench as **IDE economics**.

Practical read:

- **Try LongCat** when you want **open weights**, **1M context**, and **OpenRouter-style API pricing** for repo-scale agent work.
- **Do not drop Composer 2.5** as a Cursor default because LongCat edges GPT-5.5 on one SWE-bench row.
- **Watch for the CursorBench row.** Compare **steps** and **cost per task**, not just score. Open models often look better on vendor harnesses than on agent-loop efficiency.

Early field commentary outside Meituan's tables is mixed: strong infra story (large domestic training cluster), but some preview users report rough agent edges. Validation on real program tasks beats bar charts alone.

### Models I would not default to (on this table)

These are benchmark-specific callouts, not permanent verdicts:

| Model | Why flag it |
|-------|-------------|
| **Sonnet 5 Max** | 93K tokens, 93 steps, 61.2% score |
| **Opus 4.7 Max** | 96 steps, $11.02/task, 64.8% score |
| **Fable 5 Max** | ~14 points above Composer 2.5, ~39× the cost |
| **GLM 5.2 Max** (on CursorBench) | 58 steps, 55.0% score |

Max tiers can still make sense for one-shot critical work. They are poor defaults for high-volume agent loops.

### How I pick models after reading the table

| Need | Model to try first | Why |
|------|-------------------|-----|
| **Best value on Cursor tasks** | Composer 2.5 | 56.1% score, lowest cost, 33 steps |
| **Tight token budget** | GPT-5.5 Medium | 8.5K tokens/task, decent score |
| **Higher score, budget open** | Grok 4.5 High* or Fable 5 Medium | 66.7% at $1.51* or 65.2% at $6.80 |
| **Must maximize pass rate** | Fable 5 Max | 70.5% if cost is secondary |
| **Open weights + 1M context** | GLM 5.2 or LongCat 2.0 | GLM on CursorBench today; LongCat strong on vendor SWE-bench, unmeasured on Cursor cost/steps |
| **Open Kimi stack** | Kimi K2.7 Code | Cheap on CursorBench; validate in Kimi Code CLI |

Model choice is one lever. **Context bootstrap** is the other. I benchmark file memory separately because a $0.44 model with a 3K-token gotchas pack can beat a $17 model that reads the wrong layer first. Stack both levers.

### Reference

### Quick reference: CursorBench 3.2 pick matrix

| Need | Model to try first | CursorBench signal |
|------|-------------------|-------------------|
| Best value on Cursor tasks | Composer 2.5 | 56.1% · $0.44 · 33 steps · ~128 score/$ |
| Tight token budget | GPT-5.5 Medium | 53.8% · 8.5K tokens/task |
| Higher score, budget open | Grok 4.5 High* | 66.7% · $1.51 · read caveat |
| Must maximize pass rate | Fable 5 Max | 70.5% · $17.32 · 72 steps |
| Open weights + 1M context | GLM 5.2 | Cursor row today; validate long-horizon separately |
| Open Kimi stack | Kimi K2.7 Code | ~$1.43/task; 58 steps on CursorBench |

**Derived ratios (not official Cursor metrics):** score ÷ $ · score ÷ 1K tokens · score ÷ step—compute for the two models you actually use.

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|--------------|-----|
| Defaulting to Fable 5 Max from rank alone | ~39× cost vs Composer 2.5 for ~14 pts | Sort by **cost** and **steps**, not score only |
| Ignoring steps per task | Latency + context churn + review fatigue | Compare score per step |
| Trusting vendor SWE-bench for Cursor economics | Different harness and loop | Wait for CursorBench row (e.g. LongCat) |
| Switching models every sprint | Breaks rule compliance and memory | Pin baseline; escalate manually for review |
| Skipping context bootstrap | Cheap model + wrong memory layer loses | Stack model choice + file memory |
| Treating small score gaps as gospel | Cursor notes variance | Directional tradeoffs, not verdicts |

## FAQ

### Did Fable 5 "win" CursorBench?

**On score:** Fable 5 Max leads at 70.5%. **On budget:** Composer 2.5 leads score per dollar (~128 vs ~4 for Max).

### Is Composer 2.5 "worse" than frontier Max tiers?

**On this task mix:** 56.1% at $0.44 beats most of the table on economics. Max tiers buy peak pass rate when failure cost exceeds ~$17/task headroom.

### How do I use the three efficiency lenses?

Compute **score ÷ $**, **score ÷ 1K tokens**, and **score ÷ step** for your two daily models from [cursor.com/evals](https://cursor.com/evals)—unofficial but useful for side-by-side.

### Why compare LongCat vendor tables to CursorBench?

**Different batteries.** SWE-bench Pro rows do not predict Cursor steps/cost until a CursorBench row exists.

### Does benchmark choice replace harness policy?

**No.** Routing, tests, and memory gates still dominate rework tokens ([harness Part 1](/posts/cursor-lightweight-harness-without-microservice-2026)).

### What you can do next

1. Open [CursorBench 3.2](https://cursor.com/evals) and sort by **cost**, not just score.
2. Compute **score per dollar** and **score per step** for the two models you actually use.
3. Run **one real repo task** twice: frontier Max vs your daily model. Log tokens, steps, and whether you shipped.
4. For **LongCat**, read Meituan's Evaluations table (code vs general agent rows) separately from CursorBench. Wait for a Cursor row before judging IDE economics.
5. If you test **GLM 5.2** or **K2.7**, compare Cursor against the vendor's native CLI before trusting launch blog tables.
6. Keep **Composer 2.5** (or GPT-5.5 Medium) as default; promote Fable Max only when failure cost exceeds ~$17 per task of headroom. Read the **Grok 4.5** training-data caveat before swapping defaults.

The benchmark answered a question vendors often skip: **what does the top score cost in steps and dollars?** On CursorBench 3.2, Fable 5 wins the headline. Composer 2.5 wins the spreadsheet.

---

**Sources**

1. Cursor, "CursorBench 3.2." https://cursor.com/evals
2. Z.ai, "GLM-5.2: Built for Long-Horizon Tasks." https://z.ai/blog/glm-5.2
3. Moonshot AI, "Kimi K2.7 Code." https://www.kimi.com/resources/kimi-k2-7-code
4. Meituan, "Introducing LongCat-2.0" (Evaluations table). https://longcat.chat/blog/longcat-2.0/
