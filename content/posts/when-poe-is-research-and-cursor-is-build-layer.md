---
title: When Poe Is the Research Layer and Cursor Is the Build Layer
slug: when-poe-is-research-and-cursor-is-build-layer
date: 2026-07-30T00:00:00.000Z
tags:
  - Generative AI
  - Agentic AI
  - Developer Tools
  - Obsidian
excerpt: >-
  I run open-ended research in Poe, promote decisions into files, then use
  Cursor to implement in the repo and vault. Splitting layers beats one chat for
  everything.
featured_image: /images/posts/when-poe-is-research-and-cursor-is-build-layer.avif
focus_keyword: Poe research Cursor build
seo_title: 'Poe for Research, Cursor for Build — The Handoff Pattern'
seo_description: >-
  Poe for research, Cursor for build: transcript exports, RESEARCH.md handoffs,
  Obsidian promotion, and when to keep open-ended exploration out of the repo
  agent.
related_posts:
  - is-cursor-only-for-developers
  - grok-4-5-cursor-knowledge-work-2026
  - cursor-conversation-search-vs-bridge-file-2026
featured_image_alt: >-
  Open research journal with abstract diagrams beside an organized workshop
  bench in morning light.
format: hybrid
best_for: >-
  Anyone who researches in Poe or other chat tools and wants file-grounded
  builds in Cursor without context bleed
---

**TL;DR**

- One chat for research and build mixes exploration noise with implementation truth.
- I research in **Poe**, promote decisions into markdown, then **Cursor** implements against the repo and Obsidian vault.

## Research layer, build layer

**Research layer** work is divergent: compare models in Poe, stress-test assumptions, read long threads, export transcripts, draft outlines you may discard. **Build layer** work is convergent: change files, run checks, respect project rules, leave an audit trail. When both happen in one long thread, the model optimizes for the last prompt, not the program outcome.

**Who it is for:** Students, founders, operators, and builders who already split time between a multi-model chat app and an IDE agent. You do not need to be a full-time developer. You do need a **promotion habit** so build sessions start from files, not from memory.

**What you will learn:** when to keep research out of the repo agent, how transcript exports fit the flow, how the lazy handoff works (dump → summarize → build), how I run the split across Poe, Cursor, and Obsidian, and Path A if you only have one chat subscription today.

---

## Why one thread fails both jobs

Chat interfaces reward breadth. Repo agents reward **scoped context**: specific paths, hooks, and prior decisions. Mixing them produces predictable friction:

| Research behavior | Build behavior | Collision |
|-------------------|----------------|-----------|
| "Consider five approaches" | "Implement approach A" | Agent re-opens discarded options |
| Long source summaries | Small diffs | Token burn on stale narrative |
| Hypothetical numbers | Parametric YAML SSOT | Wrong figures ship |
| Voice experiments | Lint and type checks | Style drift in code |

[Is Cursor only for developers?](/posts/is-cursor-only-for-developers) makes the broader case: Cursor wins when **continuity across files** matters. Poe (and Claude, Gemini, etc.) still win when you want a **low-friction sandbox** with model choice and no repo checkout.

The split is **separation of concerns**.

---

## How the two layers connect

![Poe research chat comparing models and pricing before a build handoff.](/images/posts/when-poe-is-research-and-cursor-is-build-layer-body-02-poe-research.avif)
*Screenshot: [Poe](https://poe.com/) research thread — Petralian (2026)*

```d2
direction: down

research: "Research layer\n(Poe, transcripts)" {
  style.fill: "#e8f0f8"
}

handoff: "Handoff artifact\n(RESEARCH.md)" {
  style.fill: "#f8f0e8"
}

vault: "Obsidian vault\n(promoted notes)" {
  style.fill: "#f0f0e8"
}

build: "Build layer\n(Cursor + repo)" {
  style.fill: "#e8f8f0"
}

ship: "Reviewed output\n(PR, draft, deploy)"

research -> handoff: "promote decisions only"
handoff -> vault: "depth + links"
handoff -> build: "session bootstrap"
build -> ship: "human review"
ship -> research: "new questions" {
  style.stroke-dash: 8
}
```

The handoff file is the contract. It holds decisions, rejected options (one line each), sources, and **explicit out-of-scope** notes. It does not hold the entire research transcript — that lives elsewhere until you promote what matters.

---

## Transcript exports: when research already happened

A lot of my research does not start in a blank Poe thread. It starts as a **full export**:

1. **Export** — Poe conversation, call transcript, or long chat log saved as `.md` or `.txt`.
2. **Drop** — drag the file into the repo (e.g. `docs/research-inbox/`) or a vault inbox folder.
3. **Summarize in Cursor** — one session: drop the full export, say **research capture** (or run `npm run research:capture`), point at `00_Brain/Templates/Research Capture.md`, and get a short structured handoff. Redact client names. I skim; I do not transcribe sections by hand.
4. **Organize in Obsidian** — promote durable notes, link to Feature notes or Bridge, add **my** framing (what I actually do on this project, not what the model guessed).
5. **Build** — fresh Cursor session with `RESEARCH.md` + repo rules only.

That last step is where I add depth from **my own flow**: session protocol, parametric YAML, vault paths agents must read. The transcript is raw input; the handoff file is **editorial judgment**.

I do not ask Poe to touch git. I do not ask Cursor to re-read a fifty-page transcript every build session. The promotion step is the work.

---

## Example implementation: how I run it

**Research (Poe):** I pick a model for the question (reasoning vs fast vs long context). I explore, paste primary links, compare answers. When I trust the direction, I **export the thread** — I do not curate the handoff inside Poe.

**Transcript path (common):** Export → drop in repo → Cursor summarizes → I edit → promote to vault.

**Build (Cursor):** Open the workspace. Session start reads Bridge and any `RESEARCH.md` I promoted. I point the agent at specific paths. I review diffs.

*Screenshot: TBD — **How to capture:** Cursor with `RESEARCH.md` and a redacted transcript in context; save as `when-poe-is-research-and-cursor-is-build-layer-body-03-cursor-agent.png` in `Attachments/` — Petralian (2026)*

When I need model variety for research, I treat comparisons like [Grok vs Cursor for knowledge work](/posts/grok-4-5-cursor-knowledge-work-2026) as **input to the brief**, not as parallel build paths.

For "what did we already decide," I use a Bridge file, not transcript search alone. See [conversation search vs Bridge](/posts/cursor-conversation-search-vs-bridge-file-2026).

---

## When to keep research inside Cursor

Stay in one tool when:

- The task is a single-file edit with no external sources.
- Research is already in the repo (issues, specs, prior posts).
- You need a tight loop between search and apply (rename across thirty files).

Split layers when research spans **multiple sessions or devices**, when you use **Poe for model choice**, or when you want browsing/chat without giving an agent wide repo write access.

---

## Handoff template

I do not fill this out manually. The lazy path:

1. **Dump** — export the Poe thread (or drop a transcript) into the repo inbox.
2. **Summarize** — one Cursor session: say **research capture**, or paste the prompt from Brain `_Manual Prompts/Research Capture.md`.
3. **Skim** — fix anything obviously wrong, then promote to vault or leave beside the repo for build.

The **`00_Brain/Templates/Research Capture.md`** note is the shape standard — decisions, rejected options, sources, build scope. Filled example for screenshots: **`00_Brain/Operations/Research Capture — Example.md`**. The agent structures; my job is export, one prompt, and a quick read.

![AI-structured research handoff markdown after summarizing a Poe transcript export.](/images/posts/when-poe-is-research-and-cursor-is-build-layer-body-01-research-md.avif)
*Screenshot: Obsidian — Research Capture template — Petralian (2026)*

Promote when build starts. Archive or delete when shipped.

---

## Path A: one chat tool, two modes

No Cursor required to practice the pattern — still lazy:

1. Export or copy the **whole** research conversation.
2. Paste it into a new chat: "Summarize and structure this for build. Decisions, rejected options, sources, scope only."
3. Start a **new** chat with that summary only. Ask for deliverable X without reopening discarded options.

If build quality jumps on step 3, the layer split was the fix, not a missing model.

---

## Limitations

Two layers still need a promotion step. Without it, handoff files rot or build agents never see them. The summarize pass is cheap; skipping it and pasting raw transcripts into every build chat is not. Research models may hallucinate citations; verify links before handoff. Subscription cost stacks if you pay for Poe plus Cursor plus Obsidian sync.

---

## FAQ

### When should I use Poe versus Cursor?

Use **Poe** (or any research chat) for open exploration, model comparison, and compiling briefs. Use **Cursor** when work must land in **files** with diffs, tests, and repo context.

### What if my research is a long transcript?

Export it, drop it in the repo, and run one **summarize** session in Cursor against your Brain research template. Promote the short handoff. Do not paste the full transcript into every build chat.

### What is a research-to-build handoff file?

A short markdown artifact the **agent structures** from a dump — decisions, constraints, open questions — so the build layer does not re-litigate basics. Not a form you type by hand.

### Can one chat tool do both layers?

It can, but **context bleeds**: research tangents pollute implementation, and repo truth does not persist across sessions without files.

### Do I need Poe specifically?

No. The **pattern** works with any research surface plus any file-grounded editor. Poe is what I use; ChatGPT or Claude fit the same research layer role.

---

## What to do next

Export one Poe thread. Drop it in the repo. Ask Cursor to summarize and structure it using your Brain research template. Open a fresh build session with only that handoff. If the second session ships faster with fewer reversals, adopt the split for that workstream permanently.
