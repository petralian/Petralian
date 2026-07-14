---
title: Project Management With a File-Based Agent Engine
slug: knowledge-work-engine-project-management-2026
date: 2026-07-06T00:00:00.000Z
status: published
category: Career
tags:
  - Program Delivery
  - Digital Transformation
  - Agentic AI
  - Enterprise AI
  - Playbook
excerpt: >-
  Agile, Scrum, Jira, and Confluence already own execution and narrative. This
  playbook shows where a file-based agent engine fits—iron triangle tradeoffs,
  RAG, RACI, RAID, and applied AI without pretending chat is a program office.
featured_image: /images/posts/knowledge-work-engine-project-management-2026.png
focus_keyword: AI project management agile scrum jira
seo_description: >-
  How a file-based AI engine complements Agile, Scrum, Jira, and Confluence:
  iron triangle, RAG, RACI, RAID, sprint goals, and agent routing for program
  delivery.
series: Knowledge Work Engine Series
series_order: 1
related_posts:
  - knowledge-work-agent-engine-guide-2026
  - knowledge-work-engine-leadership-decisions-2026
  - getting-enterprise-ai-right-the-work-that-comes-before-deployment
image_prompt: >-
  Cinematic 16:9 overhead of a kanban board made of paper cards on a concrete
  desk, three columns only, single brass pen, cool morning light, no readable
  text, no faces.
image_prompt_variant_1: >-
  Surreal 16:9 subway control room: three glowing lines on a map merge into one
  departure board, teal and amber lights, miniature scale, no readable text.
image_prompt_variant_2: >-
  Isometric 16:9 cutaway: inbox tray, bridge folder, milestone flag, task-app
  icon as three connected rooms, risograph orange and gray, no logos.
format: hybrid
best_for: Program and delivery leads running projects where agents are part of the team
---

> **Knowledge Work Engine Series (Part 1)**  
> **Hub:** [Part 0 — Engine guide](/posts/knowledge-work-agent-engine-guide-2026) · **Next:** [Part 2 — Leadership & RACI](/posts/knowledge-work-engine-leadership-decisions-2026)

## What is AI project management in this model?

**AI project management** here does not mean an AI that runs your backlog. It means **humans and agents share the same handoff files**—sprint intent, risks, RACI—while Jira (or similar) stays the execution source of truth. The engine adds operational memory and routing so assistants do not re-derive scope every session.

**Who it is for:** PMs, program leads, and Scrum Masters using Jira/Confluence (or equivalents) with one or more AI tools open daily.

**What you will learn:** where the engine sits vs Agile ceremonies; how RAG, RAID, RACI, and the iron triangle map to files; and applied AI rules that keep agents out of the Accountable column.

---
**TL;DR**

- Agile, Scrum, Jira, and Confluence already own execution and narrative.
- This playbook shows where a file-based agent engine fits—iron triangle tradeoffs, RAG, RACI, RAID, and applied AI without pretending chat is a program office.

## How to start with this playbook

> **Example — how I use this for PM:** One folder per client initiative under my vault (`Initiatives/<name>/`). I open it in Cursor, scaffold with the [Part 0 replication kit](/posts/knowledge-work-agent-engine-guide-2026#replication-kit-give-this-to-an-ai), sync `Bridge.md` to the Jira sprint goal at sprint boundary, and link ticket keys—never mirror the backlog in markdown.

**Full setup (all paths):** [Part 0 — How to get started](/posts/knowledge-work-agent-engine-guide-2026#how-to-get-started) · **Fastest:** [Path A — chat only](/posts/knowledge-work-agent-engine-guide-2026#path-a--chat-only-30-minutes)

| Day one | Action |
|---------|--------|
| 1 | Create `Initiatives/<project>/Bridge.md` — copy sprint goal from Jira into one paragraph |
| 2 | Create `Operations/Session Summaries.md` |
| 3 | Paste Path A bootstrap; ask for a status draft against Bridge only |
| 4 | End session: one summary line + fix Bridge if priority moved |

**Do not** mirror your Jira backlog in markdown. **Do** keep intent, risks, and narrative in Bridge; link ticket keys.

---

## Getting oriented

### The problem: initiatives die in chat threads

Enterprise delivery already runs on **frameworks and systems**: Scrum teams in Jira, status decks in PowerPoint, decisions buried in Confluence, and an AI tab open on the side.

The side tab is where context dies.

- Status lives in Monday's chat and is gone by Wednesday's thread.
- "Open loops" stay mental, so the assistant optimizes the prompt in front of it, not the portfolio.
- Milestones get announced in a standup but never written where the **next** assistant session can read them.

Another PM SaaS does not fix that. Neither does "we are Agile." The gap is **operational memory for agents and humans** (Layer 2 in the [External Memory model](/posts/external-memory-series-guide)) plus **routing** that matches work size.

This article is thought leadership on **where a file-based agent engine plugs into Agile, Scrum, Jira, Confluence, and classic PM artifacts** (iron triangle, RAG, RACI, RAID)—and what it deliberately does **not** replace.

---

### How the engine complements Jira and Confluence

| System | Primary job | Source of truth for |
|--------|-------------|---------------------|
| **Jira** (or Azure DevOps, Linear, etc.) | Work tracking, sprint backlog, flow | *What* is in progress, by whom, by when |
| **Confluence** (or SharePoint, Notion wiki) | Published narrative for humans | *How we explain* process, onboarding, policies |
| **File-based agent engine** | Session continuity + AI routing | *What the assistant must read* to resume; *why* this week matters |

The engine is the **glue** between your official PM stack and the explosion of AI interfaces. It does not compete with Jira's backlog or Confluence's audience-facing docs. It prevents every new chat from re-deriving scope, risks, and sprint intent.

*Three-system model (diagram below is D2; draw as a Venn or stack in any tool).*

```d2
direction: right

jira: "Execution\nJira / ADO" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

wiki: "Narrative\nConfluence / wiki" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

engine: "Agent engine\nBridge + routing" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

human: "Human + team" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
  grid-columns: 2
  lead: "Accountable\ndecisions"
  team: "Responsible\nwork"
}

jira -> human.team: "tickets"
wiki -> human.lead: "policy"
engine -> human: "context-pack\n+ footers"
human -> jira: "status"
human -> engine: "promote\nlessons"
```

**Promotion rule (critical):** If a fact is true for the whole program, it belongs in `_Home.md` or Confluence—not in a Jira comment only. If it is true for this sprint, it belongs in `Bridge.md` **and** may link to a Jira sprint goal field. If it is a one-off task, it belongs in Jira only.

---

## Frameworks and delivery controls

### How classic frameworks map to engine files

Frameworks were designed for **human teams with institutional memory**. Agents have none. The engine gives agents the same artifacts good PMs already maintain—just in a shape optimized for **bootstrap reads** and **session footers**.

| Framework concept | Official home (typical) | Engine file / habit |
|-------------------|-------------------------|---------------------|
| **Product Goal** ([Scrum Guide](https://scrumguides.org/scrum-guide.html)) | Product backlog / roadmap | `_Home.md` — outcome, metrics, horizon |
| **Sprint Goal** | Sprint backlog commitment | `Bridge.md` — "This sprint / this week" + link to Jira sprint |
| **Product / sprint backlog** | Jira ordered list | Jira is source of truth; Bridge links epic keys |
| **Definition of Done** | Team agreement | Layer 4: `Definition-of-Done.md` or Confluence page linked from L4 rules |
| **Increment** | Potentially shippable work | Milestone gate checklist (below) |
| **Retrospective actions** | Team board | `Lessons-Learned.md` → promote to L4 routing rules |
| **Phase gate** (waterfall / hybrid) | SteerCo pack | `Decisions/` + RAG on portfolio index |
| **RAID** | RAID log or risk register | `RAID.md` per initiative |
| **RACI** | Stakeholder matrix | `RACI.md` — see [Part 2](/posts/knowledge-work-engine-leadership-decisions-2026) |
| **Iron triangle** (scope / time / cost) | PM plan, budget | Tradeoff decisions in `Decisions/` when one vertex moves |

### Scrum in one paragraph of alignment

The [2020 Scrum Guide](https://scrumguides.org/scrum-guide.html) defines the **Sprint Goal** as the single objective for the sprint—a commitment that creates focus while allowing negotiation on backlog items **without** changing the goal. That maps cleanly to `Bridge.md`: one paragraph on *why this timebox matters*, with Jira holding the *what*.

Ceremonies stay ceremonies. The engine answers: **what file does the AI read before sprint planning prep, mid-sprint status, or a stakeholder email draft?**

| Ceremony | Engine touch (lightweight) |
|----------|----------------------------|
| Sprint planning | Refresh Bridge sprint goal; link selected epic keys |
| Daily standup | Optional: one line in `Session Summaries` if blockers changed |
| Sprint review | Update `_Home.md` metrics if reality shifted |
| Retrospective | Append `Lessons-Learned.md`; if repeated twice, edit WORK-ROUTING (L4) |

### Kanban and flow

Kanban does not use sprint goals; it uses **WIP limits and cycle time**. Your engine still needs `Bridge.md` for *current priority narrative* (why this column matters now) while Jira columns hold card state. RAG on the portfolio index replaces subjective "how's it going?" with a defined scale (next section).

### Hybrid and scaled agile (SAFe, PI planning, etc.)

At program level, add a **program Bridge** linking multiple team Bridges. PI objectives mirror `_Home.md` at program tier. The engine does not replicate SAFe tooling—it gives **one context-pack per planning session** so AI-assisted briefs do not invent objectives that are not in the file.

---

### Iron triangle: record tradeoffs, not math

Scope, time, and cost are constrained together. When one moves, the others move. Frameworks teach this; chat ignores it.

The engine's job is not to calculate EVM. It is to **record the decision when you moved a vertex**:

```markdown
# Decision: Accept slip on training rollout (scope hold, time +2 weeks)
### Triangle before
Scope: 12 sites | Time: 30 Jun | Cost: fixed cap

### Triangle after
Scope: 10 sites (2 deferred) | Time: 14 Jul | Cost: fixed cap

### Owner
Program director | SteerCo informed YYYY-MM-DD
```

Link from `RAID.md` if the slip was risk-driven. Link Jira fixVersion or milestone if execution tracking lives there.

---

### RAG status: define the scale once

**RAG** (Red / Amber / Green) fails when every leader uses a different definition. Put the scale in `_Home.md` or program standards (Layer 3):

| Color | Meaning (example) |
|-------|-------------------|
| **Green** | On track; no escalation; forecast holds |
| **Amber** | Material risk; mitigation owned; exec aware within 5 days |
| **Red** | Missed commitment or unblock overdue; SteerCo action required |

Portfolio `System/Projects/index.md`:

| Initiative | RAG | Last touched | Jira board | Bridge |
|------------|-----|--------------|------------|--------|
| ... | Amber | YYYY-MM-DD | link | link |

**Applied AI rule:** Status questions load **Bridge + RAG definition only**, not the entire RAID history. Ask the agent for a RAG *recommendation* with evidence bullets; the **Accountable** human sets the color.

---

### RAID: risks, assumptions, issues, dependencies

`Initiatives/<name>/RAID.md` complements Jira risk issue types:

| Row type | Engine holds | Jira holds |
|----------|--------------|------------|
| **Risk** | Probability, impact, narrative, owner | Optional linked issue |
| **Assumption** | What we believe; validation date | — |
| **Issue** | Current blocker story | Blocker ticket |
| **Dependency** | External team / vendor | Dependency ticket or link |

Session prompt for RAID hygiene:

```markdown
Read RAID.md and Bridge.md only.
List: (1) top 3 risks by impact, (2) assumptions past validation date,
(3) issues without owner. Propose edits as a table; do not invent risks.
```

---

### RACI: humans accountable, AI responsible only for drafts

[RACI](https://www.projectmanagement.com/wikis/278207/RACI-Matrix) (Responsible, Accountable, Consulted, Informed) clarifies who decides versus who does. **Applied AI:** the assistant is never **Accountable**. It may be **Responsible** for draft artifacts (status memo, RAID table, slide outline) under human review.

| Role | Human | AI agent |
|------|-------|----------|
| **Accountable** | Named executive or PO | Never |
| **Responsible** | Team, vendor | Draft + analysis when assigned |
| **Consulted** | SMEs | Can simulate prep questions; cite `Stakeholders.md` |
| **Informed** | Distribution list | Engine records who was informed in `Decisions/` |

Maintain `Initiatives/<name>/RACI.md` for recurring workstreams. [Part 2](/posts/knowledge-work-engine-leadership-decisions-2026) goes deeper on governance and commit modes.

---

## Reference

### WORK-ROUTING for program delivery

`Operations/WORK-ROUTING.md` is your **agent analog of a PMO routing table**:

| Situation | Route | Load | Footer |
|-----------|-------|------|--------|
| "What's the status of X?" | Direct | `Bridge.md` + RAG scale | A or B |
| One deliverable (steerco deck, RAID update) | Direct | Bridge + `_Home.md` + RAID | C |
| 3+ parallel workstreams | Batch orchestrator | `context-pack` once | C |
| Phase gate / go-live | Milestone gate | Checklist + RACI A | D |
| Iron triangle change | Decision workflow | `Decisions/` template | D |

**Gate rule:** Do not load `context-pack` or full initiative history for a one-line status question—the same discipline as skipping the session embed on lightweight Q&A ([memory routing](/posts/cursor-harness-memory-loop-2026)).

*Example routing by question size (D2 below; redraw as a flowchart in any tool you use).*

```d2
direction: right

question: "Question\nsize?" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
  grid-columns: 3
  small: "1 line"
  medium: "1 deliverable"
  large: "3+ tracks"
}

routes: "Route" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
  grid-columns: 3
  direct: "Direct +\nBridge"
  direct2: "Direct +\nL3 scope"
  batch: "Orchestrator +\nJSON handoffs"
}

question.small -> routes.direct
question.medium -> routes.direct2
question.large -> routes.batch
```

---

## Running initiatives

### Initiative file layout

```
Initiatives/<name>/
  _Home.md       # Product goal, scope, success metrics, out of scope
  Bridge.md      # Sprint goal / this week, blockers, pending decisions
  RACI.md        # Roles for this initiative
  RAID.md        # Risks, assumptions, issues, dependencies
  Stakeholders.md
  Sessions/
```

**`_Home.md` (Layer 3):** What is this initiative? What is out of scope? What does green mean?

**`Bridge.md` (Layer 2):** What is the current sprint goal or weekly focus? What blocks progress? Link Jira sprint or epic query.

---

### Jira: execution truth stays in Jira

**Do not mirror the backlog in markdown.** Mirror **intent and pointers**.

| Jira object | Engine relationship |
|-------------|----------------------|
| Epic | Linked from `_Home.md`; one-line outcome |
| Sprint | Linked from `Bridge.md`; sprint goal text matches Jira sprint goal field |
| Story / task | Linked from Bridge only when discussing blockers |
| Risk issue | Bidirectional link to `RAID.md` row |
| Comment thread | Not agent bootstrap—too noisy |

**Manual promotion (minimum):** End of sprint, PO copies sprint goal into Bridge and closes the loop in `Session Summaries`.

**Automation (optional):** Jira REST or MCP connector pulls sprint name, goal, and open blocker keys into `context-pack` generation. The engine file remains the **curated** read, not a dump.

**Applied AI:** Workers get epic key + acceptance criteria excerpt, not the entire project history. Same dispatch hygiene as multi-agent software harnesses: short prompts, JSON one-line returns.

---

### Confluence: publish for humans, files for agents

Confluence is optimized for **reading and compliance**, not for **agent bootstrap at 9am Monday**.

| Content type | Confluence | Engine |
|--------------|------------|--------|
| Onboarding / policy | Canonical | Link from L4 rules |
| SteerCo narrative | Published PDF/HTML | Source notes in `Sessions/` |
| Sprint goal | May duplicate Jira | Bridge is agent-first source |
| Decision record | Official for auditors | `Decisions/` draft → promote to Confluence on commit |

Workflow: decide in `Decisions/` → human Accountable approves → publish summary page to Confluence → link back in `_Home.md`. Agents read the **file** during work; stakeholders read **Confluence**.

---

### Applied AI in delivery (thought leadership)

Five principles for program leaders rolling out agents alongside Jira:

1. **Frameworks without files are theater.** Scrum without a visible Sprint Goal is weak; AI without Bridge is worse—the model will invent a goal from chat tone.

2. **Accountability does not transfer.** If RACI says the PO is Accountable, the agent is a drafting tool. Routing must separate **advisory** from **commit** ([Part 2](/posts/knowledge-work-engine-leadership-decisions-2026)).

3. **Batch orchestration is not a second program.** Three AI "workstreams" still need one human orchestrator with RAG visibility—same as three feature teams without a release train.

4. **Token cost follows routing.** Loading Confluence export + Jira dump + email every session burns budget and attention. WORK-ROUTING is cost policy, not bureaucracy.

5. **Definition of Done for AI outputs.** A status memo is not done when it reads well. It is done when RAG color, RAID deltas, and Jira links are verified—a **quality gate**, not vibes.

```d2
direction: right

input: "Ceremony\nor request" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

route: "WORK-\nROUTING" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

artifacts: "Files +\nJira links" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

gate: "Human A\nsign-off" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

output: "Confluence\n/ SteerCo" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

input -> route -> artifacts -> gate -> output
```

---

### Task tracker vs thinking layer

| Layer | Tool | Holds |
|-------|------|-------|
| **Thinking** | Knowledge base + engine files | Why, tradeoffs, decisions, RAID |
| **Doing** | Jira / ADO / Asana | Status, assignee, dates, WIP |

**Session end habit:**

1. One line in `Operations/Session Summaries.md`
2. Update `Bridge.md` if sprint narrative shifted
3. Update Jira tickets for physical next actions
4. Footer Mode C or D

---

### Batch orchestrator (3+ workstreams)

When one initiative has parallel tracks (pilot + policy + training), parent prompt:

```markdown
You are the program orchestrator. Do not paste session history.

Read once: Bridge.md, _Home.md, RACI.md (Accountable names only).

Dispatch one worker per track. Each worker:
- Max 1500 characters
- Track goal, constraints, Jira epic key if any
- Return JSON: {track, rag, blockers, next, jira_keys[]}

Parent outputs SteerCo-ready table. Human Accountable sets RAG.
```

---

### Milestone gate (Mode D)

Before calling a phase "shipped":

- [ ] `_Home.md` success metrics still accurate
- [ ] Iron triangle change recorded in `Decisions/` if scope/time/cost moved
- [ ] RAG updated with evidence
- [ ] RAID: closed risks or explicit accept
- [ ] Jira release / fixVersion matches narrative
- [ ] Confluence summary published if stakeholders expect it
- [ ] `Session Summaries` line written

---

### Beginner: one initiative in 30 minutes

1. Copy templates from [Part 0 hub](/posts/knowledge-work-agent-engine-guide-2026).
2. Fill `_Home.md`: goal, metric, out of scope, RAG definitions.
3. Fill `Bridge.md`: this sprint goal, blocker, link to Jira board.
4. Add three rows to `RAID.md`.
5. Run one advisory session: "Given Bridge and RAID, recommend RAG with evidence."

---

### Advanced: portfolio index

`System/Projects/index.md` with RAG, last touched, Jira link, Bridge path. SteerCo prep becomes reading the index plus Amber/Red Bridges only.

---

### Complex requirements and review gates

### Complex requirements, documentation drift, and review gates

Delivery leads often hit the same cluster of pains: AI feels **unreliable** as specs grow, **documentation falls behind** execution, and **peer review** is a manual side process. The engine does not fix model quality. It **bounds what the assistant sees** and **when a draft becomes official**.

### Complex requirements (without dumping the spec into chat)

| Failure mode | Why it happens | Engine response |
|--------------|----------------|-----------------|
| Invented scope or priority | No stable Sprint Goal / Bridge | `Bridge.md` + Jira sprint goal synced at boundary |
| Wrong-era requirements | Full wiki or ticket export in context | **context-pack**: Bridge + `_Home` + RAID pointers only |
| Confident but wrong status | Agent sets RAG without evidence | Agent proposes; human **Accountable** sets RAG with links |
| Parallel tracks collide | One chat for pilot + policy + training | Batch orchestrator with named **A** per track ([above](#batch-orchestrator-3-workstreams)) |

**Rule:** For large requirement sets, the AI reads **curated handoff files**, not the entire backlog. Detailed specs stay in your tracker or wiki; the engine holds **intent, tradeoffs, risks, and links**.

This is **not** requirements management software. It is **session continuity** so complexity does not get re-explained—or hallucinated—every Monday.

### Documentation drift (what updates when)

Dual maintenance is real. Reduce drift with **fixed promotion moments**, not hope:

| Moment | Update |
|--------|--------|
| **Sprint / phase boundary** | Copy sprint goal into `Bridge.md`; one line in `Session Summaries` |
| **Decision commit** | `Decisions/` file → human **A** approves → publish summary to wiki → link in `_Home.md` |
| **Milestone gate (Mode D)** | [Checklist](#milestone-gate-mode-d): RAG, RAID, Jira release, Confluence if stakeholders expect it |
| **Retrospective** | Lessons → `Lessons-Learned.md`; promote to `WORK-ROUTING` if repeated twice |

**Optional automation:** Jira REST or MCP can pull sprint name, goal, and blocker keys into `context-pack` generation. The curated file remains the **read surface** for agents—not a live mirror of every ticket comment.

### Review before publish (peer input without a new tool)

Formal peer review is not built in. You **attach** it with RACI and modes from [Part 2](/posts/knowledge-work-engine-leadership-decisions-2026):

1. **Agent (R)** drafts status memo, RAID update, or SteerCo outline from Bridge + RAID.
2. **Consulted (C)** reviewers comment on the file or in your existing review channel (email, wiki comment, PR on a git-backed vault)—before commit.
3. **Accountable (A)** runs a **commit** session: record decision or approve publish.
4. **Informed (I)** receive Confluence or distro after publish.

For high-stakes artifacts, add a **reviewer pass**: second prompt that checks only against `voice-guide` + milestone checklist—not a rewrite ([Part 0 hub — reviewer pass](/posts/knowledge-work-agent-engine-guide-2026#advanced-harness-patterns-without-code)).

**Honest tradeoff:** You trade endless chat re-explaining for **five-minute session close** and **sync at ceremony boundaries**. Less magic; more inspectable structure.

---

### Real constraints

- **Dual maintenance** — Bridge and Jira sprint goal can drift; assign one owner to sync at sprint boundary.
- **Confluence lag** — Official narrative may trail files; mark publish date on decisions.
- **Tool sprawl** — Every AI product needs the same bootstrap pointer or silos return.

---

### Quick reference: PM terms in this series

| Term | One-line meaning | Engine file |
|------|------------------|-------------|
| **Iron triangle** | Scope, time, cost constrained together | Tradeoffs in `Decisions/` |
| **RAG** | Red / Amber / Green status | Portfolio index + `Bridge.md` |
| **RAID** | Risks, Assumptions, Issues, Dependencies | `RAID.md` (+ Jira links) |
| **RACI** | Responsible, Accountable, Consulted, Informed | `RACI.md` — [Part 2](/posts/knowledge-work-engine-leadership-decisions-2026) |
| **Sprint Goal** | Single objective for the timebox ([Scrum Guide](https://scrumguides.org/scrum-guide.html)) | `Bridge.md` + Jira sprint field |
| **context-pack** | Curated read once per session | Bridge + summaries + L3 pointers |

---

## Common mistakes (AI + PM)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Mirroring Jira backlog in markdown | Dual maintenance hell | Links only; backlog stays in Jira |
| Dumping Confluence into chat | Wrong tone, wrong age | Curated Bridge + `_Home.md` |
| Letting AI set RAG color | False SteerCo confidence | Agent proposes evidence; human **A** sets color |
| Skipping Sprint Goal in Bridge | AI invents weekly priority | Copy sprint goal at planning |
| Batch workers without RACI | Orphan workstreams | Orchestrator + named Accountable per track |
| Expecting auto-sync from Jira/wiki | Stale or duplicated docs | Curated files + boundary promotion; automation optional |
| Skipping Consulted before SteerCo publish | Single-author AI narrative | RACI **C** review before **A** commits ([Part 2](/posts/knowledge-work-engine-leadership-decisions-2026#peer-review-with-raci-not-a-separate-product)) |

---

## FAQ

### Does Agile conflict with a file-based engine?

**No.** Ceremonies stay in the calendar. The engine answers what files the **AI** reads before planning prep, status drafts, or RAID updates.

### Can SAFe or waterfall programs use this?

**Yes.** Replace sprint goal with phase objective in `Bridge.md`. Program Bridge links team Bridges. Phase gates use the same milestone checklist.

### Should the agent update Jira tickets?

**Only via human approval or existing automation.** The engine links to Jira; it does not replace workflow rules.

### How does this relate to product management?

Product Goal and roadmap fit `_Home.md`. Backlog ordering stays in your PM tool. Same memory tiers.

### What is the minimum setup for one team?

`_Home.md`, `Bridge.md`, `WORK-ROUTING.md`, and Jira sprint goal synced at sprint boundary. Add `RAID.md` when SteerCo asks for risks.

### Does this fix unreliable AI on complex requirements?

**Partially.** It does not improve the model. It reduces **invented scope** by curating what the assistant reads (Bridge, RAID, links—not full backlog dumps) and keeping humans **Accountable** for RAG and publish. See [complex requirements](#complex-requirements-documentation-drift-and-review-gates).

### How do I keep documentation up to date without duplicating Jira?

**Promotion at boundaries**, not continuous mirror: update `Bridge` at sprint start, `Decisions/` on commit, wiki on publish. Link ticket keys; do not copy the backlog into markdown.

### How do I add peer review?

Use RACI **Consulted** before **Accountable** commit, then publish to Confluence for **Informed**. Details in [Part 2 — peer review with RACI](/posts/knowledge-work-engine-leadership-decisions-2026#peer-review-with-raci-not-a-separate-product).

---

### Reader action

Pick one live initiative with a Jira board. Create `_Home.md`, `Bridge.md`, and `RAID.md`. For the next sprint boundary, make Jira sprint goal and Bridge text match.

If session four needs less re-explanation, add `WORK-ROUTING.md` and `RACI.md`—not another AI subscription.

---

### Sources

- [Scrum Guide (2020)](https://scrumguides.org/scrum-guide.html) — Product Goal, Sprint Goal, Definition of Done
- [Scrum.org — Sprint Goal](https://www.scrum.org/resources/what-sprint-goal) — commitment and focus
- [ProjectManagement.com — RACI matrix](https://www.projectmanagement.com/wikis/278207/RACI-Matrix) — role definitions
- [External Memory Series](/posts/external-memory-series-guide) — four tiers
- [Getting Enterprise AI Right](/posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment) — deployment before tooling
