---
title: Training an AI Is Like Managing an Employee
slug: training-an-ai-is-like-managing-an-employee
date: 2026-06-14T00:00:00.000Z
tags:
  - Leadership
  - Agentic AI
  - Program Delivery
  - Generative AI
excerpt: >-
  Five management habits that transfer directly to directing AI agents: show
  examples, write context down, guide in steps, define outcomes, and close the
  loop with review.
featured_image: /images/posts/training-an-ai-is-like-managing-an-employee.png
focus_keyword: managing ai like an employee
seo_description: >-
  A practical framework for directing AI like a strong employee: show examples,
  document context, guide step by step, define outcomes, and close the loop.
image_prompt: >-
  Create a 16:9 conceptual hero image for an article comparing AI direction to
  employee management. Show a manager at a desk reviewing a task board with
  clear instructions flowing to both a human teammate and an AI assistant
  interface. Include visual cues for process clarity: checklist, arrows,
  milestones, and feedback loops. Professional, modern look, neutral palette
  with warm highlights, no logos, no text overlays, no watermarks.
image_prompt_variant_1: >-
  A playful editorial hero image for an article about managing AI like a
  high-performing employee. Show a tiny operations studio where tasks move
  through clear stages: context briefing, examples, step-by-step execution, and
  feedback loops. Include a calm manager coordinating both human and AI
  contributors with visible checkpoints. Friendly technical style, soft shadows,
  warm highlights, 16:9, no logos, no readable text, no watermarks.
image_prompt_variant_2: >-
  A witty split-scene hero image contrasting poor and strong AI management. Left
  side: vague requests, tangled notes, and confused outputs. Right side:
  structured prompts, explicit milestones, review gates, and reliable delivery
  from both human and AI collaborators. Professional editorial illustration with
  subtle humor, cinematic 16:9 framing, no logos, no readable text, no
  watermarks.
featured_image_alt: 'Create a 16:9 conceptual hero image for an article comparing AI direction'
format: hybrid
best_for: >-
  Managers and team leads translating people-management instincts to AI
  workflows
seo_title: Training an AI Is Like Managing an Employee
---
**TL;DR**

- Five management habits that transfer directly to directing AI agents: show examples, write context down, guide in steps, define outcomes, and close the loop with review.



> **Leadership angle:** [What I learned directing AI as my primary engineer](/posts/what-i-learned-directing-ai-as-my-primary-engineer) · [Why AI programs fail before they start](/posts/why-your-ai-program-may-fail-before-it-starts)  
> **Memory stack:** [Three layers of external memory](/posts/three-layer-external-brain-for-ai-first-development) · [Why deliberate file memory beats hoping agents remember](/posts/why-deliberate-file-memory-beats-hoping-agents-remember)  
> **Tooling context:** [VS Code Copilot to Cursor migration](/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow) · [Composer 2.5 as my baseline model](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results)

The most reliable way I have found to improve agent output is to stop treating prompts like magic spells and start treating them like **management**. A capable employee with no briefing, no examples, and no definition of done will still produce something. It will rarely be what you needed.

AI agents behave the same way—except they forget yesterday's briefing entirely. The habits that make onboarding and delegation work for people map cleanly onto [directing AI as a primary implementer](/posts/what-i-learned-directing-ai-as-my-primary-engineer). I use five principles on every non-trivial task.

---

## The problem: vague direction produces confident wrong answers

When a session starts cold, the agent optimizes for the sentence in front of it. It does not know which constraints are sacred, which files are authoritative, or what "done" looks like until you say so. That produces a familiar failure mode:

- A refactor that technically compiles but violates an architectural decision from last week
- A feature that matches the prompt but not the product pattern used everywhere else
- A long reply that sounds complete but never updates the handoff notes the next session needs

GitHub's controlled study with professional developers found those using Copilot completed an identical task **55% faster** than those without it—but that gain depends on the quality of context supplied, not on the model alone [1]. Speed without direction is rework.

---

## Why management metaphors hold up (and where they break)

Employees accumulate institutional memory. Agents do not—unless you **write memory down** in files the next session reads. That is the main caveat: every principle below assumes you externalize context into something durable ([file memory](/posts/why-deliberate-file-memory-beats-hoping-agents-remember), rules, session notes).

Where the metaphor holds:

| Management habit | Agent equivalent |
|------------------|------------------|
| Show a worked example | Point at a file, paste a pattern, link a prior PR |
| Write the playbook | Obsidian notes, `AGENTS.md`, `.cursor/rules` |
| Milestones and check-ins | Step-by-step tasks with explicit review gates |
| Definition of done | Acceptance criteria, tests, footer fields |
| Performance feedback | Correct the output; promote the lesson into a rule file |

Where it breaks: you cannot rely on rapport or implied norms. If it is not written, it did not happen.

---

## Five principles I use on every substantial task

### 1. Show it, then write it down

**Show:** Point the agent at an existing implementation—"match `PostGrid.tsx`" beats "make a responsive grid."

**Write:** Capture decisions that must survive the session. I use a project vault for Operations notes and repo stubs under `memories/repo/` so the next chat can load the same truth. This is layer 2–3 of the [external brain stack](/posts/three-layer-external-brain-for-ai-first-development).

If I explain a constraint once in chat and nowhere else, I have trained myself—not the agent.

### 2. Guide step by step

Large asks become reliable work when decomposed. I sequence: read bootstrap files → confirm plan → implement one slice → verify → update notes.

A single message that says "build the whole feature" invites the agent to skip the bootstrap I depend on. Step-by-step direction is not micromanagement; it is **variance control** on a system with no long-term memory.

### 3. Be clear in the ask

Specificity beats cleverness. Strong asks name:

- **Scope** — files, endpoints, or user flows in bounds
- **Constraints** — what must not change (auth, deploy gates, schema)
- **References** — docs, prior art, style exemplars

Weak ask: "Improve the homepage."  
Strong ask: "Raise mobile LCP on `/` without client-side masonry; keep `PostGrid` server-rendered; run Lighthouse mobile after."

The second version is longer because ambiguity is expensive.

### 4. Expect outcomes (define done before work starts)

Employees need success criteria. Agents need them even more. I state outcomes as verifiable artifacts:

- Tests pass, or a named script exits 0
- A session note exists with goal and git status
- Footer fields filled, including `Obsidian: written ✓` with path

This parallels enterprise program design: [getting the foundation before deployment](/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment) is defining outcomes for the organization, not only for the model.

### 5. Close the loop

Management does not end at handoff. I require:

- A short summary of what changed and what is pending
- Open loops appended to a shared file, not buried in chat
- **Self-improvements** promoted to rules when the same mistake appears twice

On Cursor, that loop is enforced with always-on rules and a canonical footer spec—see the [Copilot → Cursor retrofit](/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow) for how I centralized it.

```d2
direction: right

BRIEF: "1. Show +\nwrite context" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

PLAN: "2. Step-by-step\n3. Clear ask" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  S2: "Milestones"
  S3: "Scope +\nconstraints"
}

DONE: "4. Expected\noutcomes" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

CLOSE: "5. Close loop\nnotes + rules" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

BRIEF -> PLAN
PLAN -> DONE
DONE -> CLOSE
CLOSE -> BRIEF: "next session" {
  style.stroke-dash: 8
  style.stroke: "#9aa3b2"
}
```

The dashed edge is deliberate: the loop is what makes the next briefing cheap.

---

## What changed when I treated agents like reports, not oracles

After I aligned tooling with these habits—[Cursor rules retrofit](/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow), [single baseline model](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results), file memory—three outcomes improved:

1. **Less architectural drift** — decisions live in files the agent reads at session start.
2. **Shorter prompts** — I link to context instead of re-pasting history.
3. **Auditable handoffs** — the next session opens with priority and open loops, not archaeology in chat scrollback.

None of this requires a frontier model. It requires the same discipline I would expect from a strong contractor on day one.

---

## What is managing AI like managing an employee?

Managing AI like an employee means applying delegation habits—show examples, document context, guide in steps, define outcomes, close the loop—to a worker that **resets every session**. The metaphor holds when you externalize memory into files, rules, and handoff notes. It breaks when you rely on rapport or implied norms: if it is not written, the next session did not happen.

---

## Reference

### Quick reference: five management principles

| Principle | Management habit | Agent equivalent |
|-----------|------------------|------------------|
| **1. Show + write** | Worked examples + playbook | File paths, `AGENTS.md`, session notes |
| **2. Step by step** | Milestones and check-ins | Sequenced tasks with review gates |
| **3. Clear ask** | Scope, constraints, references | Explicit bounds and exemplars in prompt |
| **4. Expected outcomes** | Definition of done | Verifiable artifacts (tests, notes, footers) |
| **5. Close the loop** | Performance feedback | Correct output; promote lessons to rules |

---

## Common mistakes (directing AI agents)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Explaining constraints only in chat | Same error every session | Write decisions to rules or `open-loops.md` |
| Single-message "build the feature" | Skipped bootstrap and architecture | Decompose into milestones with review gates |
| Vague asks | Confident wrong answers | Name scope, constraints, and references |
| No definition of done | Output sounds complete but handoff missing | State verifiable outcomes before work starts |
| Skipping the close loop | Next session starts with chat archaeology | Summary, open loops, self-improvements to rules |

---

## FAQ

### Does this require a frontier model?

**No.** Discipline and file memory matter more than model tier. GitHub's Copilot study found large speed gains—but only with quality context supplied [1].

### How does this relate to enterprise AI readiness?

Individual **define done first** discipline parallels organizational gates in [getting enterprise AI right](/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment). Session footers are micro-governance for builders.

### Where should context live?

Durable context belongs in files the agent reads at session start—vault notes, `AGENTS.md`, `.cursor/rules`—not chat scrollback. See the [external brain stack](/posts/three-layer-external-brain-for-ai-first-development).

### What breaks the employee metaphor?

Agents do not accumulate institutional memory unless you write it down. Rapport, implied norms, and "they should remember" do not transfer.

### How do I know the loop is working?

Shorter prompts (you link instead of re-paste), less architectural drift, and auditable handoffs with priority and open loops at session start.

---

### What you can do next

1. Pick one active task and rewrite the ask with scope, constraints, references, and definition of done.
2. Add one **show** reference (file path or doc link) and one **write** destination (session note or `open-loops.md`).
3. Split the next large agent request into three milestones with a review gate after each.
4. If you run programs, not only repos, read [getting enterprise AI right](/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment)—the organizational version of "define outcomes before deployment."

Training an AI is not about finding the perfect prompt template. It is about applying management basics to a worker that resets every session—and building the paperwork so reset stops mattering.

---

**Sources**

1. GitHub, "Research: quantifying GitHub Copilot's impact on developer productivity and happiness." https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/ (55% faster completion in controlled experiment; outcome depends on task context supplied).
*If you're new to Cursor: [50% off your first month](https://cursor.com/referral?code=JP5ARNKSFI2Q) (code `JP5ARNKSFI2Q`). I may earn usage credits; install directly if you prefer.*
