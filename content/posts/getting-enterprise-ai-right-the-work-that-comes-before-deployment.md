---
title: 'Getting Enterprise AI Right: The Work That Comes Before Deployment'
slug: getting-enterprise-ai-right-the-work-that-comes-before-deployment
date: 2026-06-16 00:00:00+00:00
status: published
tags:
- Enterprise AI
- Program Delivery
- Digital Transformation
- Leadership
- Playbook
excerpt: 'Enterprise AI programs that last share one pattern: data readiness, named
  governance owners, and change runway are gates before go-live—not parallel work
  you finish after the demo.'
featured_image: /images/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment.png
featured_image_alt: Isometric cutaway of three enterprise AI foundation layers—data,
  governance, and change—with a deploy capsule waiting above a hold line
focus_keyword: enterprise AI program readiness
seo_description: 'Why enterprise AI programs stall after successful pilots: compressed
  foundation work on data, governance owners, and change runway—and how to get the
  order right.'
image_prompt: Cinematic 16:9 wide shot of a concrete foundation pour at dusk, three
  wooden formwork sections labeled only by shape not text, crane bokeh in background,
  amber floodlights, no people, no logos, no readable text.
image_prompt_variant_1: 'Surreal 16:9 planetarium scene: a model rocket on a launch
  pad held by three visible support pillars made of stacked books and binders, starfield
  dome above, violet and copper accents, no readable text, no logos.'
image_prompt_variant_2: 'Bold 16:9 isometric cutaway: three-layer building foundation
  (data, governance, change) with a small deploy capsule waiting at a hold line above,
  flat graphic style, risograph grain, teal and slate palette, no logos, no readable
  text.'
format: strategic
best_for: Leaders and program owners steering enterprise AI before go-live pressure
  wins
---
**TL;DR**

- Enterprise AI programs that last share one pattern: data readiness, named governance owners, and change runway are gates before go-live—not parallel work you finish after the demo.



> **Diagnostic checklist:** [Why your AI program may fail before it starts](/posts/why-your-ai-program-may-fail-before-it-starts)  
> **Builder parallel:** [What I learned directing AI as my primary engineer](/posts/what-i-learned-directing-ai-as-my-primary-engineer) · [Training an AI is like managing an employee](/posts/training-an-ai-is-like-managing-an-employee)

Enterprise AI programs rarely collapse because the model was the wrong brand. They collapse because the organization **deploys before it is ready**. Readiness is not a mood. It is three foundation checks with named owners: **data**, **governance**, and **change runway**.

McKinsey's **State of AI 2025** global survey (published November 2025; fieldwork June–July 2025) finds **88%** of organizations use AI in at least one business function, up from 78% the prior year. Yet only about **one-third** report scaling AI across the enterprise, and **39%** attribute any EBIT impact to AI [1]. Wide use with thin scaling is the pattern: pilots succeed in sandboxes while production absorbs gaps the foundation was supposed to close.

This article is the full foundation narrative. For a shorter pre-flight checklist, use [why your AI program may fail before it starts](/posts/why-your-ai-program-may-fail-before-it-starts).

---

## The problem: deployment speed wins the budget conversation

Program structures reward visible motion. Steering committees ask for go-live dates. Vendors are contracted on delivery milestones. Data cleanup and change management are line items everyone agrees matter until they compete with a demo on a fixed date.

The structural outcome is predictable: the program reaches a point where use cases look sound in testing, vendors met their statements of work, and rollout still cannot absorb real workflows. Not because the model failed in a lab. Because the organization discovered—in production—what it had not prepared for.

---

## Why the incentive frame matters as much as the roadmap

Before anyone writes a requirements doc, the program picks a story:

| Frame | What gets measured | Who has incentive to help |
|-------|-------------------|---------------------------|
| **Cost efficiency** | Headcount removed, FTE avoided | Domain experts may rationally resist |
| **Productivity gain** | Capacity unlocked, quality improved | Experts become assets; their judgment trains the system |

McKinsey's 2025 survey finds **high performers** disproportionately **redesign workflows** rather than bolt AI onto unchanged processes [1]. Programs framed as augmentation tend to earn expert participation. Programs framed as replacement tend to earn quiet resistance even when the model works in testing.

If your steering deck leads with replacement math, expect slow adoption.

---

## Adoption vs scaling (2025–2026 landscape)

| Signal | McKinsey State of AI 2025 | What it implies |
|--------|---------------------------|-----------------|
| Use AI in ≥1 function | 88% | Access is no longer the bottleneck |
| Scaling across enterprise | ~33% | Most programs remain pilot-weight |
| EBIT impact attributed to AI | 39% | Usage ≠ value |
| Scaling agentic AI | 23% scaling; 39% experimenting [1] | Agents add governance load before deploy |

The readiness work in this article targets the **scaling gap**, not license procurement.

---

## The three foundation layers (gates, not slide bullets)

Between a validated use case and a deployed program sits work most organizations rush or underfund.

### Layer 1: Data readiness with a remediation plan

AI programs inherit existing data quality problems and surface them at scale. When deployment underperforms, post-mortems routinely cite **data complexity and integration**, not only model accuracy [1].

A useful gate is a **current-state audit**: what data exists, in what condition, with named gaps and owners—not a future-state wish list discovered after go-live.

**Fail signal:** "We will clean data after launch."

### Layer 2: Governance that names owners, not only processes

Traditional software has clearer accountability for crashes. Generative outputs raise a different question: who owns corrections, retraining, and escalation when advice is wrong?

A useful gate is a **named owner list** for outputs, errors, corrections, and improvements before the first production interaction—not a RACI template with empty cells waiting for the first incident.

**Fail signal:** "Legal is reviewing the policy" with no operational owner.

### Layer 3: Change runway measured in months

Prosci's research finds initiatives with excellent change management were six times more likely to meet objectives than those with poor or absent change management [2]. AI programs amplify this: users must learn the tool **and** renegotiate when to trust it in consequential workflows.

A useful gate is early access, real workflows, feedback loops, and fluency building **before** go-live—not a two-week training sprint after deployment.

**Fail signal:** Launch and training scheduled in the same week.

```d2
direction: right

DATA: "1. Data audit +\nremediation owners" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

GOV: "2. Named governance\nowners" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

CHANGE: "3. Change runway\n(months)" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

DEPLOY: "Go-live" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

DATA -> GOV
GOV -> CHANGE
CHANGE -> DEPLOY
```

---

## Why foundation work keeps getting compressed

Sponsors are not usually ignorant of data, governance, or change management. Those conversations existed before AI. The compression is **structural**:

- Short horizons reward demos over readiness.
- Each skipped gate looks defensible in isolation ("we can harden governance after pilot").
- Nobody in the steering room has a mandate to delay deployment without being labeled anti-innovation.

Programs that avoid the pattern tend to give a senior transformation lead an explicit job: **protect foundation work as a gate**, not manage a date-driven schedule. That is a leadership role, not a model-selection exercise.

---

## Additional detail

### What getting the order right looks like in practice

Before production traffic, three artifacts should exist:

1. **Data audit with remediation plan** — present-state gaps, owners, and timeline tied to use-case requirements (not a generic data strategy deck).
2. **Governance roster** — named people accountable for outputs, errors, corrections, and improvements (not a process map alone).
3. **Change plan that starts before go-live** — early access, real workflows, feedback loops, and time to build judgment.

None of this is novel. Successful technology programs always required it. AI makes skipping it tempting because the pilot demo can look finished while the organization is not.

For individual builders, the same discipline appears at smaller scale: [file memory and session handoffs](/posts/why-deliberate-file-memory-beats-hoping-agents-remember) are how a one-person AI-directed build avoids the enterprise version of "not ready."

---

### What is enterprise AI program readiness?

Enterprise AI program readiness means the organization can absorb AI in production workflows—not only demo a model. Readiness is evidenced by three gates with named owners: a **present-state data audit** with remediation plan, **governance owners** accountable for outputs and errors before go-live, and a **change runway** measured in months so users build judgment in real workflows. Programs that skip these gates often blame the model when the foundation was never chartered as critical path.

---

### Reference

### Quick reference: three foundation layers

| Layer | Gate artifact | Fail signal |
|-------|---------------|-------------|
| **Data** | Current-state audit + remediation owners | "Clean data after launch" |
| **Governance** | Named owner roster for outputs and errors | Policy in review, no operator |
| **Change** | Early access and real workflows pre go-live | Training in launch week |

---

### Additional detail

### Common mistakes (enterprise AI programs)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Treating foundation as parallel work | Pilot succeeds; scale stalls | Sequence layers as gates, not slide bullets |
| Cost-efficiency steering narrative | Domain experts disengage | Reframe as productivity and judgment |
| Governance as process-only | First incident triggers meetings | Name operational owners before traffic |
| Compressed change runway | Low trust in consequential workflows | Months of fluency building pre launch |
| No mandated gate-holder | Each skip looks reasonable | Charter senior lead to protect foundation |
| Chasing adoption metrics alone | 88% use, 33% scale | Measure gates, not license counts |

---

## FAQ

### What is the difference between this article and the diagnostic checklist?

This is the **full foundation narrative**. [Why your AI program may fail before it starts](/posts/why-your-ai-program-may-fail-before-it-starts) is the shorter pre-flight checklist for steering meetings.

### Who should own the governance layer?

**Operational** owners for outputs, errors, corrections, and retraining—not only legal reviewers. Empty RACI cells fail at first production error.

### How long should change runway be?

**Months**, not weeks. Prosci links excellent change management to six times higher objective attainment [2]. AI users need time to learn when to trust outputs in real workflows.

### Can data quality wait until after go-live?

Production will surface every gap a present-state audit would have caught. Attach owners and dates before the next deploy milestone.

### How does builder discipline relate to enterprise readiness?

[File memory and session handoffs](/posts/why-deliberate-file-memory-beats-hoping-agents-remember) are the individual-scale version of gates—define done and document before deploy.

---

### What you can do next

1. Run the [three-gate diagnostic](/posts/why-your-ai-program-may-fail-before-it-starts) against your current program plan before the next steering meeting.
2. Rewrite the steering narrative from **cost efficiency** to **productivity gain** if domain experts are disengaged.
3. Name one data gap, one governance owner, and one change milestone with dates **before** the next deploy milestone.
4. If you direct builders directly, read [what I learned directing AI as primary engineer](/posts/what-i-learned-directing-ai-as-my-primary-engineer) for the individual-scale version of the same gates.

The technology is capable enough to deliver real value. The programs that compound it treat readiness as sequential gates—not homework you finish after the model works in a sandbox.

---

**Sources**

1. McKinsey & Company, "The state of AI in 2025: Agents, innovation, and transformation." Global survey published November 2025 (fieldwork June 25–July 29, 2025; 1,993 respondents in 105 nations). https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
2. Prosci, "The Value of Effective Change Management." Prosci Best Practices in Change Management, 11th edition. https://www.prosci.com/resources/articles/value-effective-change-management
