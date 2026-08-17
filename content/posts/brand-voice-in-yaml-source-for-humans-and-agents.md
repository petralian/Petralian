---
title: 'Brand Voice in YAML: One Source for Humans and Agents'
slug: brand-voice-in-yaml-source-for-humans-and-agents
date: 2026-08-02T00:00:00.000Z
tags:
  - Brand Strategy
  - Generative AI
  - Marketing Technology
  - AI in Marketing
excerpt: >-
  A PDF voice guide agents never open fails at scale. YAML fields for tone,
  banned words, and claim limits give humans and models the same
  machine-readable source.
featured_image: /images/posts/brand-voice-in-yaml-source-for-humans-and-agents.avif
focus_keyword: brand voice YAML AI marketing
seo_description: >-
  Put brand voice in YAML: tone, banned words, and claim limits as one SSOT for
  humans and agents. Complements file-based marketing governance.
related_posts:
  - knowledge-work-engine-marketing-voice-2026
  - knowledge-work-agent-engine-guide-2026
  - petralian-seo-geo-publish-pipeline-2026
featured_image_alt: >-
  Cinematic 16:9 of a tuning fork vibrating beside a typed card on a walnut
  desk.
format: hybrid
best_for: >-
  Marketing ops leads who already govern voice in documents and need the same
  rules readable by agents without duplicating prose guides
---

**TL;DR**

- YAML carries tone, banned words, and claim limits agents can load without parsing a PDF.
- **Nathan voice prevails:** `10_Personal/AI/Nathan's profile.md` loads first; YAML is guardrails, not generic "brand voice."
- Keep narrative positioning in markdown; put interdependent generation rules in one YAML source both humans and models read.

## What brand voice in YAML means

**Brand voice in YAML** means storing tone rules, banned phrases, claim limits, and channel overrides in a structured file both humans and agents load at session start. The PDF style guide can stay for designers. Generation needs a **machine-readable source** that does not require an agent to interpret twenty pages of narrative.

**Who it is for:** brand and content ops leads producing blog, email, and social through multiple AI tools who already accept that voice is a governance problem, not a prompting problem.

**What you will learn:** which fields belong in YAML vs markdown, how this complements (not replaces) the [marketing voice playbook](/posts/knowledge-work-engine-marketing-voice-2026), and Path A for a ten-field voice file today.

![Tuning fork on a desk suggesting aligned human and agent voice.](/images/posts/brand-voice-in-yaml-source-for-humans-and-agents-body-02-tuning-fork.avif)
*Photo: [Thirdman](https://www.pexels.com/photo/close-up-photo-of-a-tuning-fork-6194031/) on Pexels — Petralian (2026)*

## Why PDF voice guides fail agents

Marketing teams already know the failure mode: a beautiful style guide launches, everyone applauds, nobody opens it during generation. Each chat tab invents adjectives. LinkedIn sounds hype; email sounds corporate; the blog sounds like a third brand.

[Marketing and voice at scale](/posts/knowledge-work-engine-marketing-voice-2026) maps Define → Enforce → Measure using markdown files, Golden Circle messaging, and editorial gates. That article owns **workflow**: content-batch routing, channel folders, session bootstrap.

This article owns **structure**: what to put in YAML so the same rules load in Cursor, a headless API, and a freelancer's ChatGPT project without copy-paste drift.

| Artifact | Best for | Weak for |
|----------|----------|----------|
| PDF / slide deck | Human onboarding, design specs | Agent session load |
| Markdown voice guide | Principles, examples, before/after | Strict field validation |
| YAML voice spec | Tone enums, banned lists, numeric caps | Long narrative positioning |

Use both markdown and YAML. Do not duplicate paragraphs across them. Markdown explains **why**. YAML states **what is allowed**.

```d2
direction: down

nathan: "Nathan's profile.md\n(cadence + patterns)"
starr: "Starr: Define → Enforce → Measure"
yaml: "brand-voice.yaml\n(bans + limits)"
slop: "no-ai-slop\n(structure pass)"
guide: "Writing Session Guide\n(positioning + Anti-Pointy)"
draft: "Agent draft"
human: "Human review"

nathan -> draft: "tone wins"
starr -> yaml: "governance map"
yaml -> draft: "constraints"
slop -> draft: "edit pass"
guide -> draft: "checklist"
draft -> human
human -> yaml: "promote new ban"
```

## Fields worth putting in YAML

Start small. Ten explicit fields beat fifty vague bullets.

| Field | Purpose | Example value |
|-------|---------|---------------|
| `tone.primary` | Default adjective set | `direct, specific, constructive` |
| `tone.avoid` | Banned vibe words | `game-changer, leverage, delve, moat` |
| `person.pronoun` | Blog author voice | `first_person_singular` |
| `claims.max_superlatives_per_post` | Hype guardrail | `2` |
| `claims.require_source_for_stats` | Facts discipline | `true` |
| `seo.description_chars` | Align with site SSOT | `min: 140, max: 160` |
| `channels.blog.format` | Site badge mapping | `strategic` |
| `channels.social.max_hashtags` | Channel override | `3` |
| `banned_phrases` | List form | `["in today's fast-paced", "unlock"]` |
| `review.required_sections` | Close-out checklist | `["TL;DR", "Path A", "Limitations"]` |

Numeric ranges should match your parametric file if you have one (`data/*.yaml` in a repo, or equivalent). When SEO limits live in YAML and an agent cites different numbers in prose, you get the same drift class [deliberate file memory](/posts/why-deliberate-file-memory-beats-hoping-agents-remember) warns about.

## Example YAML sketch

*Screenshot: brand voice YAML fields — Petralian (2026)*

```yaml
schema_version: 1
brand: ExampleCo
tone:
  primary: [direct, specific, constructive]
  avoid: [leverage, delve, robust, moat]
person:
  pronoun: first_person_singular
claims:
  max_superlatives_per_post: 2
  require_source_for_stats: true
seo:
  description_chars: { min: 140, max: 160 }
banned_phrases:
  - in today's fast-paced
  - game changer
channels:
  blog:
    format: hybrid
  social:
    max_hashtags: 3
```

Agents read this in one tool call. Humans diff it in git. Neither has to grep a PDF.

![YAML brand voice file with tone, banned words, and claim limits.](/images/posts/brand-voice-in-yaml-source-for-humans-and-agents-body-01-voice-yaml.avif)
*Screenshot: Petralian (2026)*

## How this relates to the marketing playbook

Read the pair in this order:

1. [Knowledge Work Engine Part 3: Marketing](/posts/knowledge-work-engine-marketing-voice-2026) for Golden Circle files, editorial folders, content-batch, and Define → Enforce → Measure governance.
2. This post when you are ready to **extract enforceable fields** into YAML and wire them into rules or API system prompts.

The playbook's `voice-guide.md` can shrink to narrative examples that point at `voice.yaml` for hard rules. [SEO and GEO publish pipeline](/posts/petralian-seo-geo-publish-pipeline-2026) covers public-page legibility and metadata; YAML applies to private generation. Both reward explicit limits over hopeful prose.

## Nathan voice prevails (not generic "brand voice")

YAML and slop lists are **guardrails**. They do not replace a named author voice. On Petralian I write as **I** / **my** — this is a personal blog. Direct. Concrete. No throat-clearing ("Great question," "Hope this helps," "Let's dive in"). Facts from files and ops, not invented stats.

**Canonical source:** `D:\Obsidian\Obsidian\10_Personal\AI\Nathan's profile.md` — short sentences, no em dashes, talk-through tone, operational risk flagging. **Supporting layer:** Brain `System/Nathan/preferences.md` (hedge/filler cuts). **Fleet workflow:** Marketing Copy — Nathan Voice and No Slop convention.

| Rule | YAML can encode | Nathan's profile must teach |
|------|-----------------|----------------------------|
| Pronoun | `first_person_singular` | **I/my** on blog; **we** only in company/team email context |
| Directness | banned throat-clearing phrases | Get to the point; no social pleasantries |
| Concrete | `require_source_for_stats: true` | Numbers from YAML/ops, not chat memory |
| Em dashes | `em_dashes_in_customer_copy: false` | Commas and full stops do the work |
| Teaching frame | `default_audience` enum | Value-first teaching, not dev-tool bro voice |

**Load order matters.** Agents read **Nathan's profile** first, then preferences, then `brand-voice.yaml`. If a YAML field and my voice conflict, **profile wins** and you fix YAML on the next promote pass.

## Example implementation: how I run it

*Screenshot: agent loading voice YAML — Petralian (2026)*

On Petralian I split voice into four layers. **Nathan voice sits on top.**

| Layer | Artifact | Role |
|-------|----------|------|
| **Author voice (wins)** | `10_Personal/AI/Nathan's profile.md` + preferences + Marketing Copy convention | Cadence, patterns; blog **I/my** |
| **Hard constraints** | repo `data/brand-voice.yaml` | Banned words/phrases, pronoun rules, claim limits |
| **Slop patterns** | Brain `00_Brain/Skills/no-ai-slop/` ([Peter Yang no-ai-slop](https://github.com/petergyang/no-ai-slop), MIT) | Detect/edit pass: throat-clearing, faux insights, formatting slop |
| **Narrative + gates** | vault `Blog/00 Writing Session Guide.md` | Positioning, Anti-Pointy rule, SEO/GEO, handoff checklist |

Numeric SEO caps stay in `data/harness-verify.yaml` (`seo_limits`) so agents do not paraphrase character ranges.

When I direct agents to draft posts, the `petralian-writing` skill loads **Nathan's profile first**, then preferences, then YAML, then the Writing Session Guide, then a no-ai-slop detect pass before handoff.

![Agent session start reading brand voice YAML before drafting copy.](/images/posts/brand-voice-in-yaml-source-for-humans-and-agents-body-03-agent-load.avif)
*Screenshot: Petralian (2026)*

## The slop layer (not just YAML lists)

Word bans catch **vocabulary drift**. They miss **structural slop**: binary contrasts, colon reveals, fake-profound kickers, summary-recap endings. Peter Yang's [no-ai-slop](https://github.com/petergyang/no-ai-slop) skill (vendored in Brain) handles that edit/detect workflow. YAML states what not to say; no-ai-slop states how not to structure a paragraph.

Pair both. Do not dump the skill's pattern list into YAML unless you want a 200-line file agents ignore.

## Reference map (one table — details in linked posts)

| Source | Role | Where to read more |
|--------|------|-------------------|
| **Nathan's profile** | Author voice **prevails** — I/my on blog | `10_Personal/AI/Nathan's profile.md` |
| **Starr** | Define → Enforce → Measure governance frame | [Starr voice governance](https://www.thestarrconspiracy.com/insights/guides/ai-content-brand-voice-governance-problem) · [Marketing playbook](/posts/knowledge-work-engine-marketing-voice-2026) |
| **Sprinklr** | Traits → YAML rows (do/don't) | [Sprinklr brand voice](https://www.sprinklr.com/blog/brand-voice/) |
| **no-ai-slop** | Structural edit pass after draft | Brain `00_Brain/Skills/no-ai-slop/` |
| **Writing Session Guide** | Anti-Pointy, positioning, handoff | `Blog/00 Writing Session Guide.md` + annexes |

## Path A: one voice YAML this afternoon

1. Write or maintain your author profile in markdown (I use `10_Personal/AI/Nathan's profile.md`). That file **prevails** over YAML.
2. Copy `data/brand-voice.yaml` from the Petralian repo (or the sketch above) to your shared drive.
3. Map one Sprinklr-style trait to a YAML row (do/don't → `tone.primary` / `tone.avoid`).
4. Vendor [no-ai-slop](https://github.com/petergyang/no-ai-slop) beside it for structural edits.
5. Add five `banned_phrases` your team already jokes about (include **moat** if you are as tired of it as I am).
6. Set `claims.require_source_for_stats: true` if stats have burned you before.
7. Paste profile + YAML into any chat tool: "Nathan's profile wins on conflict; YAML is hard constraints; run no-ai-slop on the draft."
8. After review, add one new ban or limit from the edit. That is the promote step (Starr **Measure** loop).

No Cursor required. You are testing whether structured voice travels better than "sound like our brand."

## Limitations

YAML cannot capture timing, cultural nuance, or legal nuance. High-risk claims still need human review.

Too many fields invite stale config. Review quarterly or when a channel strategy changes.

Freelancers outside your stack may ignore the file. Pair YAML with a one-page markdown example post they can mimic.


## FAQ

### Why put brand voice in YAML?

YAML is **machine-checkable** and diff-friendly; agents read the same tone rules humans edit without scraping marketing decks.

### What belongs in voice YAML versus markdown guides?

YAML: banned phrases, reading level, pronoun rules, capitalization. Markdown: examples, narrative, and teaching.

### Do agents follow voice YAML automatically?

Only if your harness **loads** it at session start and preflight checks cite the path.

### Can voice YAML replace a style guide?

No. It **parameterizes** enforceable rules; the guide still teaches judgment and examples.

### Where does Nathan voice fit?

**Above YAML.** `10_Personal/AI/Nathan's profile.md` loads first (cadence and patterns). Blog body uses **I/my** — personal blog voice. YAML encodes bans and limits agents must not paraphrase. If they conflict, fix YAML after human review.


## What to do next

If you already run the [marketing engine playbook](/posts/knowledge-work-engine-marketing-voice-2026), extract ten enforceable rules into YAML this week. Wire them into one generation path (blog or email only). Measure rework minutes for two weeks. Expand fields only when markdown arguments repeat.

If you are starting cold, read [Part 0: Engine guide](/posts/knowledge-work-agent-engine-guide-2026) for folder layout, then add `voice.yaml` beside `voice-guide.md` before you scale batch content.