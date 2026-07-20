---
title: 'Cursor Customize for Business Development: Questionnaire to Plan SSOT'
slug: cursor-customize-business-development-ssot-2026
date: 2026-07-16T00:00:00.000Z
tags:
  - Agentic AI
  - Enterprise AI
  - Generative AI
  - Leadership
series: Cursor Customize Series
series_order: 2
excerpt: >-
  For consulting and BD work, a shared questionnaire becomes the single source
  of truth for the business plan - so Cursor drafts stay consistent instead of
  inventing a new strategy every chat.
featured_image: /images/posts/cursor-customize-business-development-ssot-2026.png
focus_keyword: business plan SSOT AI
seo_description: >-
  Use Cursor Customize for BD and consulting work: a collaborator questionnaire
  as SSOT so business-plan drafts stay consistent, clear, and reviewable now.
related_posts:
  - cursor-customize-one-agent-many-workflows-2026
  - cursor-customize-brainstorm-and-personal-agent-2026
  - cursor-customize-blogging-and-project-memory-2026
image_prompt: >-
  Cinematic 16:9: two chairs at a wooden table with a single shared binder open
  between them, soft afternoon window light, sense of alignment not sales
  theater, no logos, no readable text, no faces.
image_prompt_variant_1: >-
  Surreal 16:9 shipyard: a questionnaire clipboard as the keel, business-plan
  planks attaching in sequence, amber dock lights, no readable text.
image_prompt_variant_2: >-
  Bold isometric 16:9 poster: Questionnaire block feeds Plan SSOT cube which
  feeds Draft Proposal / Deck / FAQ outputs, teal and slate risograph, no logos.
format: hybrid
best_for: >-
  Founders, consultants, and operators who need AI-assisted proposals and plans
  that stay consistent across collaborators and drafts
seo_title: 'Cursor Customize for Business Development: Questionnaire…'
featured_image_alt: >-
  Hero illustration for Cursor Customize for Business Development: Questionnaire
  to Plan SSOT
---

> **Series:** [Hub - One Agent, Many Workflows](/posts/cursor-customize-one-agent-many-workflows-2026) · Part 2 of 5 deep dives

## Why BD drafts lose consistency in chat

Business development and consulting prep often drift when positioning lives in one thread, plan prose in another, and collaborator answers in email. The next AI session may invent a third version of the offer because nothing was marked as source of truth.

**Who it is for:** Anyone building a proposal, practice plan, or consulting offer with AI — solo or with a collaborator — who needs consistency more than clever prose.

**What you will learn:** how a questionnaire becomes the SSOT for a business plan, which Customize rules protect that SSOT, and a Path A you can run in any chat tool.

This is not a sales playbook. It is a **memory and consistency** pattern for commercial writing. Positioning for Cursor itself is in [Is Cursor only for developers?](/posts/is-cursor-only-for-developers). The Customize map is in the [series hub](/posts/cursor-customize-one-agent-many-workflows-2026).

---

## The principle: lock decisions before drafts

Write down the decisions first. Use the questionnaire (or equivalent SSOT file) for answers: who, offer, buyer, proof, constraints, commercials. Treat that file as the **single source of truth (SSOT)**. Generate plan sections, decks, and FAQs **from the SSOT**, not from chat memory.

When facts change, update the SSOT first — you can ask the agent to apply structured edits to the questionnaire — then regenerate or revise prose from the updated file.

The durable pattern:

1. Capture answers in a structured questionnaire.
2. Mark that file as SSOT in your rules.
3. Point every draft prompt at the SSOT path.
4. On change: SSOT update → regenerate downstream docs.

The pattern scales from academic outlines to board narrative briefs. The commercial case is where contradictions cost the most trust.

---

## Landscape: where this sits among tools you know

You already know versions of SSOT: a CRM field that must match the deck, a pricing sheet that must match the contract, a requirements doc that must match the backlog. Agile teams protect a product backlog for the same reason - one place to change intent ([Scrum Guide](https://scrumguides.org/scrum-guide.html) frames backlog as ordered work; the lesson here is ordered **truth**).

Chat is a bad SSOT. A questionnaire file is a good one because it is inspectable, shareable with a collaborator, and editable without re-reading a hundred messages.

---

## Collaborator questionnaire → business plan SSOT

For a **consulting opportunity**, I work with a collaborator on a questionnaire that captures the offer, buyer context, proof points, constraints, and open risks. That questionnaire drives the business plan. When we disagree, we change the questionnaire - not three parallel docs.

What the agent is allowed to do:

| Allowed | Not allowed |
|---------|-------------|
| Draft plan sections from questionnaire answers | Invent pricing, logos, client names, or proof |
| Flag unanswered questions before writing | Quietly fill gaps with confident fiction |
| Produce FAQ / deck outlines that cite the SSOT | Create a second strategy that contradicts the SSOT |
| Suggest clarity edits to questions | Treat chat suggestions as approved strategy |

Customize exists to enforce that table without you policing every paragraph.

```d2
direction: down

q: "Questionnaire\n(collaborator answers)"
ssot: "Business plan SSOT\n(locked decisions)"
outs: {
  label: "Derived outputs"
  grid-columns: 2
  plan: "Plan narrative"
  deck: "Deck outline"
  faq: "FAQ"
  email: "Outreach draft"
}

q -> ssot
ssot -> outs
outs -> q: "change answers first" {
  style.stroke-dash: 8
}
```

---

## Example implementation - how I run it

When a consulting opportunity is live, I keep one questionnaire file as SSOT and ask Cursor to draft only against that file. Standing rules say: do not invent commercial terms; list missing answers instead of filling them; keep language consistent with the questionnaire wording unless I ask for a rewrite of a specific field.

A collaborator updates answers; I re-run section drafts. Clarity improves because both of us argue with the same page. I direct the agent to regenerate sections after SSOT edits. I review for tone and accuracy. I do not claim the model "owns" the strategy - humans do.

I keep confidential names and employers out of public writing. On this blog the pattern is enough: questionnaire → plan SSOT → derived drafts.

---

## Customize levers for BD / consulting mode

| Lever | Job in this mode |
|-------|------------------|
| Rules | "SSOT file wins. No invented facts. Flag gaps." |
| Skills | "Regenerate plan section from questionnaire." |
| Commands | "Diff draft against SSOT and list contradictions." |
| Hooks | Optional warn if writing into the wrong folder |
| Subagents | One agent drafts narrative while another builds FAQ - only if both read the same SSOT |
| MCPs | Only if you intentionally bridge a CRM or docs system |

Keep brainstorming separate. Exploration belongs in the [brainstorm / personal agent](/posts/cursor-customize-brainstorm-and-personal-agent-2026) mode until you promote a decision into the questionnaire.

---

## Consistency and clarity: what readers feel

Readers of a plan feel consistency as trust. When the offer name, buyer problem, and proof change between pages, they assume the work is unfinished. SSOT does not make the strategy correct. It makes the strategy **one strategy**.

Clarity comes from better questions. If the questionnaire is vague, every derived draft will be vague. Invest in question design before you invest in Customize automation.

---

## What belongs in the questionnaire

Keep fields few enough to finish. Eight is a good start. Expand only when a blank keeps causing rewrite loops.

| Field | Why it exists |
|-------|---------------|
| Offer in one sentence | Stops title drift across docs |
| Buyer | Keeps "who pays / who uses" honest |
| Problem | Anchors every benefit claim |
| Proof | Blocks invented case studies |
| Scope in / out | Prevents silent scope creep in drafts |
| Pricing posture | Separates list price talk from chat improvisation |
| Risks | Forces known unknowns into the open |
| Open questions | Becomes the next collaborator agenda |

If a field is blank, derived drafts must say so. Silence is how AI invents strategy.

## Collaborator rhythm

A workable rhythm with a collaborator:

1. Agree the questionnaire is SSOT before drafting long prose.
2. Edit answers in the open - comments on fields beat parallel docs.
3. Regenerate or revise only the sections touched by changed answers.
4. Freeze a version before external sharing so outreach matches the plan.

That rhythm is slower than one heroic chat. It is faster than reconciling three contradictory PDFs a week later.

## Path A - any chat tool this afternoon

1. Create a one-page questionnaire with eight fields: Offer in one sentence, Buyer, Problem, Proof, Scope in / out, Pricing posture, Risks, Open questions.
2. Fill it with what you know. Leave blanks blank.
3. Paste into chat: "Draft a two-page plan using only these answers. List every blank as a blocker. Do not invent."
4. When you change your mind, edit the questionnaire first, then ask for a revised plan section.

If that discipline alone reduces contradictions, Cursor Customize is optional glue - not the point.

---

## Limitations

A questionnaire is not legal review, financial advice, or customer research. Collaborators still need a human RACI for who approves changes. AI can smooth language while hiding that an answer is still a guess - your rules must forbid silent gap-filling.

---

## Reader action

Run Path A on a real opportunity or a practice offer. Then open the [series hub](/posts/cursor-customize-one-agent-many-workflows-2026) or jump to [blogging and project memory](/posts/cursor-customize-blogging-and-project-memory-2026) if your next pain is publishing continuity.
