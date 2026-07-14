---
title: 'Fable 5 Pricing on Cursor: Every Tier Explained (Max to Low)'
slug: fable-5-pricing-cursor-every-tier-explained
date: 2026-07-11T00:00:00.000Z
status: published
tags:
  - Agentic AI
  - Enterprise AI
  - AI Quality
  - Generative AI
excerpt: >-
  Fable 5 ships as five effort tiers on Cursor. CursorBench 3.2 shows how score,
  cost, tokens, and steps change from Max to Low — for anyone approving model
  spend, not pickers chasing rank.
featured_image: /images/posts/fable-5-pricing-cursor-every-tier-explained.png
featured_image_alt: >-
  Five nested brass rings on dark slate with coin stacks beside each ring, macro
  editorial still life, amber keylight, no logos or readable text.
focus_keyword: cursor fable 5 pricing
seo_description: >-
  Fable 5 pricing tiers on Cursor explained: Max through Low with CursorBench
  3.2 score, cost per task, tokens, and steps. Pick the right tier for budget
  vs…
related_posts:
  - cursorbench-3-2-fable-5-composer-2-5-cost-vs-score
  - when-to-escalate-composer-2-5-to-fable-5
  - composer-2-5-baseline-model-tighter-bootstrap-better-results
image_prompt: >-
  Cinematic 16:9 macro photograph of five nested brass rings on dark slate, each
  ring taller toward camera with increasing coin stacks beside them, single
  amber keylight, shallow depth of field, no logos, no readable text.
image_prompt_variant_1: >-
  Surreal 16:9 flea-market stall at night: five labeled glass jars of different
  heights filled with glowing marbles, shortest jar brightest green, tallest jar
  gold, string lights overhead, witty editorial tone, no readable text, no
  logos.
image_prompt_variant_2: >-
  Bold 16:9 isometric poster: five-step staircase labeled only by height blocks
  ascending left to right, cost bars shrinking on lower steps, risograph violet
  and copper texture, no logos, no readable text.
format: hybrid
best_for: >-
  Anyone approving Cursor AI spend who needs Fable tier unit economics before
  picking a default
seo_title: 'Fable 5 Pricing on Cursor: Every Tier Explained (Max to Low)'
---

> **Cluster:** [CursorBench 3.2 cost analysis](/posts/cursorbench-3-2-fable-5-composer-2-5-cost-vs-score) · [When to escalate Composer → Fable](/posts/when-to-escalate-composer-2-5-to-fable-5) · [Composer 2.5 baseline](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results)

## What is Fable 5 pricing on Cursor?

**Fable 5** is Anthropic's agentic model family in Cursor's model picker, offered at **five effort tiers** (Max, Extra High, High, Medium, Low). Each tier trades **task success rate** against **cost per agent task**, **tokens burned**, and **agent steps** until the task closes.

**Who it is for:** **Anyone** comparing Fable 5 tiers in Cursor who sees a leaderboard headline and needs **unit economics** — a founder watching burn rate, a student on a tight budget, an operator setting team defaults.

**What you will learn:** the CursorBench 3.2 ladder from Max to Low, what each tier buys in score and steps, and a default rule: specialty tier for must-not-fail work, budget tier for volume.

---

Vendor launches sell **peak score**. People paying the bill need **cost per agent task**, **tokens**, and **steps** — especially when many sessions share one picker default.

Anthropic returned Fable 5 to public Cursor model pickers in 2026. Cursor publishes side-by-side numbers on [CursorBench 3.2](https://cursor.com/evals). The table below is **benchmarked numbers (from CursorBench 3.2)**. They price tasks from published per-million-token rates on ambiguous, multi-file agent work. Your real bill will differ by prompt, context size, and retries.

## Why tier choice matters more than peak score

A model picker that only shows rank hides four costs:

| Cost type | What breaks if you ignore it |
|-----------|------------------------------|
| **Dollars per task** | You burn budget on tasks that a cheaper tier would pass |
| **Tokens per task** | Context windows fill faster; long sessions stall |
| **Steps per task** | Latency and review fatigue rise even when the task eventually passes |
| **Variance** | Cursor notes small score gaps may not be statistically meaningful |

Fable 5 Max can be rational for one class of work. It is a poor **default** if you run dozens of agent tasks per week.

## The five tiers on CursorBench 3.2

Benchmarked numbers (from [CursorBench 3.2](https://cursor.com/evals)):

| Tier | Score | Cost / task | Tokens / task | Steps / task |
|------|------:|------------:|--------------:|-------------:|
| Fable 5 Max | 70.5% | $17.32 | 103,525 | 72 |
| Fable 5 Extra High | 68.4% | $11.73 | 64,971 | 56 |
| Fable 5 High | 66.5% | $8.77 | 43,747 | 48 |
| Fable 5 Medium | 65.2% | $6.80 | 30,366 | 41 |
| Fable 5 Low | 62.1% | $4.46 | 18,182 | 31 |

**Score spread:** Max to Low is **8.4 percentage points** (70.5% vs 62.1%).

**Cost spread:** Max is roughly **3.9×** Low on cost per task ($17.32 vs $4.46) for that score gap.

**Steps spread:** Max takes **72 steps**; Low takes **31**. Fewer agent turns can mean shorter wall-clock time on step-heavy tasks.

```d2
direction: down

ladder: "Fable 5 tiers\n(CursorBench 3.2)" {
  grid-columns: 2
  max: "Max\n70.5% score\n72 steps" {
    style.fill: "#fff8f5"
    style.stroke: "#ff6a3d"
    style.border-radius: 8
  }
  xhigh: "Extra High\n68.4%" {
    style.fill: "#f5f7fa"
    style.stroke: "#d8dce6"
    style.border-radius: 8
  }
  high: "High\n66.5%" {
    style.fill: "#f5f7fa"
    style.stroke: "#d8dce6"
    style.border-radius: 8
  }
  med: "Medium\n65.2%" {
    style.fill: "#f5f7fa"
    style.stroke: "#d8dce6"
    style.border-radius: 8
  }
  low: "Low\n62.1%\n31 steps" {
    style.fill: "#f0faf5"
    style.stroke: "#2d9f6f"
    style.border-radius: 8
  }
}
```

## Tier-by-tier read

### Fable 5 Max

**Best for:** one-off tasks where failure is expensive (production incident, security-sensitive remediation, executive-visible deliverable).

**Tradeoff:** **$17.32** per benchmark task and **72 steps**. Score per dollar on this table is among the worst rows (~4.1 score per USD when derived from public numbers).

### Fable 5 Extra High and High

**Best for:** high-stakes work with a **cost ceiling** below Max. Extra High lands **68.4%** at **$11.73**; High lands **66.5%** at **$8.77**.

**Tradeoff:** You give up 2.1 to 4.0 points versus Max. You still pay premium prices versus Composer 2.5 on the same benchmark.

### Fable 5 Medium

**Best for:** "better than budget tier" without Max bills. **65.2%** score at **$6.80** and **41 steps**.

**Tradeoff:** Still **~15×** the benchmark cost of Composer 2.5 ($0.44 per task on the same table) for roughly **9.1 points** more score.

### Fable 5 Low

**Best for:** trying Fable economics without Max pricing. **62.1%** at **$4.46** with the **lowest step count** in the Fable family (31).

**Tradeoff:** Lowest Fable score on the table. On derived **score per step**, Low is competitive within the Fable line (~2.0 score per step on public rows).

## How Fable tiers compare to Composer 2.5

On CursorBench 3.2, **Composer 2.5** posts **56.1%** at **$0.44**, **14,286 tokens**, **33 steps**.

| Comparison | Takeaway |
|------------|----------|
| Fable 5 Low vs Composer 2.5 | +6.0 points score for ~10× cost in the benchmark |
| Fable 5 Max vs Composer 2.5 | +14.4 points for ~39× cost |
| Steps | Composer 2.5 (33) matches Fable Low (31); Max more than doubles step count |

**Note:** **Grok 4.5 High** ranks **66.7%** at **$1.51** and **33 steps** on the same table — between Fable High and Medium on score at a fraction of Fable cost. Cursor flags a **training-data caveat** on Grok rows (see [open models](/posts/open-models-cursorbench-3-2-grok-glm-kimi-longcat)).

For **routine program volume**, Composer 2.5 remains the Pareto corner on this benchmark. Fable tiers are **escalation tools**, not replacements for a cost-efficient default. See [when to escalate](/posts/when-to-escalate-composer-2-5-to-fable-5).

## Where this sits in the benchmark landscape

CursorBench measures **realistic Cursor agent sessions** (ambiguous, multi-file). Vendor launch posts and SWE-bench rows measure **different harnesses**. A tier that wins on CursorBench may not rank the same on [SWE-bench](https://www.swebench.com/) or HumanEval-style sets.

Use Fable tier tables for **Cursor session economics**. Use SWE-bench for **repository patch success** comparisons. Do not merge the two without labeling the source.

## Limitations

- CursorBench rows have **variance**; treat small score gaps as directional.
- **Cost per task** uses Cursor's pricing model at publish time; API list prices change.
- Tiers reflect **effort settings**, not separate model weights in every case. Read the picker labels when Cursor updates naming.

## Reader action

1. Open CursorBench 3.2 and confirm the five Fable rows still match.
2. Set **Composer 2.5** (or your budget default) for routine agent work.
3. Pre-pick **one escalation tier** (often Medium or High) for tasks with a defined cost cap.
4. Reserve **Max** for a written trigger list (incident, security, irreversible migration).
5. Read [CursorBench cost analysis](/posts/cursorbench-3-2-fable-5-composer-2-5-cost-vs-score) for score-per-dollar tables across all models.
