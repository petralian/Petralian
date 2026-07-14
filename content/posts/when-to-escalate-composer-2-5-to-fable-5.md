---
title: 'When to Escalate from Composer 2.5 to Fable 5: A Decision Tree'
slug: when-to-escalate-composer-2-5-to-fable-5
date: 2026-07-12
tags:
- Agentic AI
- Enterprise AI
- AI Quality
- Generative AI
excerpt: Composer 2.5 is the CursorBench budget default. Fable 5 tiers buy peak score
  at higher cost. Use this decision tree to escalate only when failure cost justifies
  the line item — for solo work or team policy.
featured_image: /images/posts/when-to-escalate-composer-2-5-to-fable-5.png
featured_image_alt: Green pedestrian signal beside a taller red emergency beacon on
  a concrete wall at dusk, shallow depth of field, no logos or readable text.
focus_keyword: composer 2.5 vs fable 5
seo_description: 'When to escalate from Composer 2.5 to Fable 5 in Cursor: decision
  tree using CursorBench 3.2 cost, steps, and task risk. Avoid 17 USD tasks on routine
  work.'
related_posts:
- cursorbench-3-2-fable-5-composer-2-5-cost-vs-score
- fable-5-pricing-cursor-every-tier-explained
- composer-2-5-baseline-model-tighter-bootstrap-better-results
image_prompt: Cinematic 16:9 photograph of a green pedestrian signal beside a taller
  red emergency beacon on a concrete wall, dusk light, shallow depth of field, no
  logos, no readable text.
image_prompt_variant_1: 'Surreal 16:9 ship bridge diorama: everyday helm wheel at
  deck level and a glass emergency lever under a red dome above, ocean horizon through
  windows, copper accents, no readable text, no logos.'
image_prompt_variant_2: 'Bold 16:9 flowchart poster: diamond gate nodes branching
  to Composer vs Fable paths, flat isometric style, mint and orange palette, risograph
  grain, no logos, no readable text.'
format: hybrid
best_for: Anyone governing Cursor model spend who needs escalation triggers before
  premium tiers become default
---

> **Cluster:** [CursorBench 3.2 analysis](/posts/cursorbench-3-2-fable-5-composer-2-5-cost-vs-score) · [Fable 5 tiers](/posts/fable-5-pricing-cursor-every-tier-explained) · [Composer 2.5 baseline](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results)

## When should you escalate from Composer 2.5 to Fable 5?

Escalate when **failure cost** on a Cursor agent task exceeds the **premium** Fable charges in dollars, tokens, and steps on CursorBench 3.2. Stay on Composer 2.5 for **routine program work** where **56.1%** score at **$0.44** per task is enough.

**Who it is for:** **Anyone** paying for premium Cursor models who wants escalation **rules** before expensive tiers become habit — founders on a budget, students on a thesis, operators governing a shared picker.

**What you will learn:** a gated decision tree for escalation, tier pick rules (Low through Max), and anti-patterns that turn premium models into **unbudgeted default**.

---

Composer 2.5 and Fable 5 answer different questions on [CursorBench 3.2](https://cursor.com/evals). Composer wins **score per dollar** and keeps **33 steps** per task on the public table. Fable 5 Max wins **raw score** (**70.5%**) at **$17.32** and **72 steps**. **Grok 4.5 High** sits between them on score (**66.7%**, **$1.51**, **33 steps**) with a Cursor-flagged training-data caveat.

I use Composer 2.5 as my program default because predictable rule compliance and a tight bootstrap matter for the delivery work I run daily ([baseline model policy](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results)). CursorBench gives that habit a cost line. Fable is an **escalation lane**, not a replacement.

## Why escalation needs gates

Without gates, every hard prompt drifts to the top model. At program scale that produces:

- **Budget bleed** (~17 USD benchmark tasks on routine work)
- **Latency** (72-step runs across a delivery team)
- **Review fatigue** (long agent traces managers must audit)

Gates force you to name **what failure costs the program** before you pay for peak score.

## Benchmarked anchors

Benchmarked numbers (from CursorBench 3.2):

| Model | Score | Cost / task | Steps / task |
|-------|------:|------------:|-------------:|
| Composer 2.5 | 56.1% | $0.44 | 33 |
| Grok 4.5 High* | 66.7% | $1.51 | 33 |
| Fable 5 Low | 62.1% | $4.46 | 31 |
| Fable 5 Medium | 65.2% | $6.80 | 41 |
| Fable 5 High | 66.5% | $8.77 | 48 |
| Fable 5 Max | 70.5% | $17.32 | 72 |

\* Cursor notes Grok 4.5 may have an advantage from Cursor codebase in training data; impact unclear ([evals disclaimer](https://cursor.com/evals)).

**Gap to remember:** Max buys **~14.4 points** over Composer for **~39×** benchmark cost.

## Decision tree

Answer in order. Stop at the first **yes**.

| # | Question | If yes → |
|---|----------|----------|
| 1 | Is the outcome **easily reversible** (rollback, discard draft, re-run)? | Stay on **Composer 2.5** |
| 2 | Is failure **client-facing**, **production-facing**, or **compliance-sensitive**? | Escalate to **Fable 5 High or Max** |
| 3 | Did Composer **fail twice** on the same **task type**? | Escalate one tier (**Low → Medium**) |
| 4 | Does the task need **multi-file planning** across unfamiliar material? | **Fable 5 Medium** |
| 5 | Is the task **exploratory** with a strict **cost cap**? | **Grok 4.5 Low** or **GPT-5.5 Medium** ([work-mode map](/posts/best-cursor-model-by-task-2026)) |
| 6 | Otherwise | **Composer 2.5** |

```d2
direction: down

start: "New agent task" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

reversible: "Easily\nreversible?" {
  style.fill: "#f0faf5"
  style.stroke: "#2d9f6f"
  style.border-radius: 8
}

composer: "Composer 2.5\ndefault" {
  style.fill: "#f0faf5"
  style.stroke: "#2d9f6f"
  style.border-radius: 8
}

risk: "Client, production,\nor compliance?" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

fable: "Fable 5\nHigh or Max" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

start -> reversible: "gate 1" { style.stroke-dash: 8 }
reversible -> composer: "yes" { style.stroke-dash: 8 }
reversible -> risk: "no" { style.stroke-dash: 8 }
risk -> fable: "yes" { style.stroke-dash: 8 }
risk -> composer: "no" { style.stroke-dash: 8 }
```

## Tier selection after you decide to escalate

| Escalation level | Pick | Benchmark cue |
|------------------|------|---------------|
| **Light** | Fable 5 Low | +6 points over Composer, **31 steps**, **$4.46** |
| **Standard** | Fable 5 Medium | **65.2%**, **41 steps**, under **$7** |
| **Heavy** | Fable 5 High | **66.5%**, still below Max cost |
| **Critical** | Fable 5 Max | **70.5%**, accept **~17 USD** and **72 steps** |
| **Budget score bump** | Grok 4.5 High* | **66.7%** near Fable High cost profile; read training caveat |

Full tier ladder: [Fable 5 pricing explained](/posts/fable-5-pricing-cursor-every-tier-explained).

## Anti-patterns

| Anti-pattern | Fix |
|--------------|-----|
| Escalate because the task "feels hard" | Require two Composer failures or a named risk class |
| Stay on Max after the incident clears | Drop back to Composer for follow-up commits |
| Escalate for greenfield scaffolding without fixing context | Fix bootstrap and memory policy first ([baseline post](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results)) |
| Compare only SWE-bench rank | Use CursorBench for session cost ([benchmark lenses](/posts/cursorbench-vs-swe-bench-vs-human-eval)) |

## Example implementation (how I run it)

**Example implementation — my stack:**

- Default model: **Composer 2.5** in Cursor for routine agent sessions.
- Escalation list in a short policy note (`docs/ai-model-escalation.md` or equivalent): client-facing deliverables, production, security, regulated data.
- After a Fable run, log **task type**, **tier**, and **outcome** in the session footer or CSV if you measure harness ROI ([harness measurement](/posts/cursor-harness-measurement-2026)).

**Path A (any chat tool):** Write three escalation triggers on a sticky note. Only change models when a trigger matches.

## Limitations

- Triggers are operational policy, not a guarantee of task success.
- CursorBench costs are modeled; your subscription and usage caps differ.
- **Grok 4.5** rows carry Cursor's training-data caveat; do not treat as a clean apples-to-apples row.
- Open models may fit budget experiments better than Fable Low ([open models](/posts/open-models-cursorbench-3-2-grok-glm-kimi-longcat)).

## Reader action

1. Copy the six-row decision table into your program's AI governance docs.
2. Run ten tasks on Composer 2.5 without opening the Fable picker.
3. Log failures by type; escalate only on rule 2 or 3.
4. Review bills weekly; if Max usage exceeds **5%** of tasks, tighten gates.
