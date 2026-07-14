---
title: 'From VS Code Copilot to Cursor: What Changed in My AI Workflow'
slug: vscode-copilot-to-cursor-what-changed-in-my-ai-workflow
date: 2026-06-27T00:00:00.000Z
status: published
category: AI & Building
tags:
  - Developer Tools
  - Agentic AI
  - Obsidian
  - AI Memory
  - Playbook
excerpt: >-
  Copilot had the same footer spec but dropped it on long chats. Cursor keeps it
  with alwaysApply rules, optional hooks, and a v3.1 mode-based Response Footer
  Contract.
featured_image: /images/posts/vscode-copilot-to-cursor-what-changed-in-my-ai-workflow.png
focus_keyword: VS Code Copilot vs Cursor migration
seo_description: >-
  Why VS Code Copilot forgets session footers but Cursor follows them:
  alwaysApply rules, per-turn re-injection, hooks, and retrofitting Obsidian
  file memory for agent mode.
image_prompt: >-
  Cinematic 16:9 low-angle shot: two translucent IDE panes floating in a dim
  machine room, one pane showing inline code completions and the other an agent
  chat thread, both fed by copper cables into a single glowing archive cabinet
  silhouette, amber and cyan rim light, shallow depth of field, no logos, no
  faces, no readable text.
image_prompt_variant_1: >-
  Surreal 16:9 underwater observatory diorama: portholes reveal VS Code on one
  side and Cursor agent mode on the other, paper-note fish swim into a coral
  filing structure, bioluminescent teal accents, whimsical technical tone, no
  readable text, no logos.
image_prompt_variant_2: >-
  Bold isometric 16:9 poster illustration: exploded schematic of Rules, Hooks,
  Vault, and Footer components launching from a VS Code block into a Cursor
  frame, risograph grain texture, orange and slate palette, graphic not
  photographic, no logos, no readable text.
format: hands-on
best_for: Developers comparing Copilot and Cursor in a real daily workflow
---
**TL;DR**

- Copilot had the same footer spec but dropped it on long chats.
- Cursor keeps it with alwaysApply rules, optional hooks, and a v3.
- 1 mode-based Response Footer Contract.



> **Memory stack background:** [Three layers of external memory](/posts/three-layer-external-brain-for-ai-first-development) · [External Memory series hub](/posts/external-memory-series-guide) · [Your brain was not built for this](/posts/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian)  

## What changes when you move from Copilot to Cursor?

**The shift is enforcement, not vault content:** Copilot loads one large `copilot-instructions.md` at chat scope; Cursor re-injects small `.cursor/rules/*.mdc` files with `alwaysApply: true` on **every agent turn**, plus optional hooks.

**Who it is for:** developers with Obsidian or repo file memory who saw footers disappear on long Copilot threads and want the same spec to survive Cursor Agent loops.

**What you will learn:** mechanical reasons footers drop on Copilot, a retrofit checklist (canonical footer v3.1, Cursor templates), and what still requires human habit.

---

I spent months tuning a VS Code + GitHub Copilot workflow (and still use Copilot for some repos): `.github/copilot-instructions.md`, dual Obsidian vaults, MCP filesystem access to `00_Brain` and per-project notes, session summaries, and a mandatory end-of-reply footer. The vault files and MCP paths were solid. What was not solid was **footer compliance**. Copilot would follow the footer on a fresh chat, then drop it after a few tool-heavy turns. When I moved daily implementation to **Cursor**, the same footer spec started showing up **every work reply** without me nagging.

The problem was not "Copilot vs Cursor features." The problem was **two different enforcement surfaces**. Copilot loads workspace instructions from one file at session scope. Cursor re-injects `.cursor/rules/*.mdc` with `alwaysApply: true` on every agent turn, plus optional hooks that warn when the footer shape is wrong. My Obsidian brain was built for the first model. I had to retrofit it for the second.

---

## Why this migration matters beyond the IDE

If you treat Cursor as "VS Code with a chat panel," you keep paying **session tax**: the agent re-derives deploy rules, forgets open loops, and drops the footer you rely on for handoffs. That tax shows up as:

- Repeated mistakes on constraints you already documented
- Uncommitted work because nothing forced a session note or bridge update
- Two sessions stepping on the same deploy or git state

For [AI-first development](/posts/what-i-learned-directing-ai-as-my-primary-engineer)—where the agent writes most of the code—the IDE is the **runtime**. Whatever the runtime reads at session start is your operating system. Changing IDEs without changing that OS is like swapping laptops but leaving your runbooks on the old machine.

---

## What differs: Copilot workspace vs Cursor agent

| Concern | VS Code + GitHub Copilot (my setup) | Cursor Agent (my setup) |
|---------|--------------------------------------|---------------------------|
| Primary instruction file | `.github/copilot-instructions.md` (auto-loaded) | `.cursor/rules/*.mdc` + `AGENTS.md` + user rules |
| Session shape | Inline chat + completions | Agent mode, tool use, subagents, plan mode |
| Session start injection | Manual read of vault files | `sessionStart` hooks (e.g. write bootstrap snapshot) |
| Memory API | Copilot memories + repo files | Same files, but **no guarantee** the agent read them |
| Footer enforcement | One paragraph in `copilot-instructions.md` (competes with the rest of the file) | Dedicated `response-footer.mdc` with `alwaysApply: true` (+ optional `afterAgentResponse` hook on some repos) |
| Re-injection per turn | Instructions loaded at chat scope; long threads dilute output-format rules | Always-applied rules merged into **every** agent turn's system context |
| Output validation | None (model self-polices) | Hook can count footer fields and warn (Vouch; copy to other repos if needed) |

Copilot rewarded one long instructions file. Cursor rewards **small, always-applied rules** that repeat the non-negotiables: read the bridge, write the session note, append the footer, never skip Obsidian because the user said "code only."

---

## Why Copilot drops the footer and Cursor keeps it

This is the pattern I see in daily use: **VS Code + Copilot forgets the footer; Cursor Agent follows it religiously.** Same spec, same vault, different compliance. The reasons are mechanical, not moral.

**1. One big file vs a dedicated always-on rule**

On Copilot, the footer lives inside `.github/copilot-instructions.md` alongside deploy gates, tag rules, Sentry steps, and methodology. That file can be thousands of tokens. The model treats it as background context. Output format instructions are the first thing sacrificed when the chat fills with diffs, grep results, and error logs.

On Cursor, the footer is its own rule file: `.cursor/rules/response-footer.mdc` with `alwaysApply: true`. Cursor merges that rule into the system prompt **on every agent turn**, not once at chat open. The footer is not a subsection of a manual. It is a first-class constraint.

**2. Session scope vs turn scope**

Copilot workspace instructions attach to the **conversation**. As the thread grows, early instructions lose salience. You see the footer on message three and lose it by message twelve.

Cursor's always-applied rules are designed for **agent loops** that run dozens of tool calls. The rule block comes back each turn. That matches how I actually work: long sessions, many edits, one handoff block at the end.

**3. No post-reply validator on the Copilot path**

On Vouch I added a Cursor hook (`afterAgentResponse`) that counts footer fields and warns when the shape is wrong. Copilot has no equivalent hook surface in my setup. If the model skips the footer, nothing fires until I read the reply manually.

Petralian does not run that hook yet. Even without it, the always-on rule alone was enough to jump from "usually missing" to "almost always present."

**4. Chat-first vs agent-first product shape**

Copilot still optimizes for inline completions and quick chat answers. A ten-line footer at the bottom of every reply is overhead the model learns to skip unless the runtime keeps punishing omissions.

Cursor Agent optimizes for multi-step tasks with tools. Session context at the top and a structured footer at the bottom match how the product expects you to audit work. The model gets rewarded (in my workflow) for looking "done" only when the footer is there.

**5. User rules stack on Cursor**

I also carry footer and session-protocol expectations in **Cursor user rules** (global). Copilot gets workspace instructions plus whatever fits in Copilot's memory feature. Cursor stacks user rules + project rules + `AGENTS.md`. That redundancy is intentional. Footer compliance is too important to live in one file.

None of this means Copilot cannot do footers. It means **I had to stop treating copilot-instructions as sufficient** and copy the enforcement pattern Cursor gives you for free: small rule, always apply, link to one canonical contract.

```d2
direction: right

COPILOT: "Copilot thread" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  BIG: "copilot-instructions\n(whole manual)"
  LATE: "Turn 12: diffs +\nlogs fill context"
}

CURSOR: "Cursor agent turn" {
  grid-columns: 2
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8

  RULE: "response-footer.mdc\nalwaysApply every turn"
  HOOK: "optional validate\nafterAgentResponse"
}

COPILOT -> CURSOR: "same footer spec\ndifferent injection" {
  style.stroke: "#ff6a3d"
}
```

```d2
direction: right

OLD: "VS Code + Copilot" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  CI: "copilot-instructions.md\n(auto-loaded)"
  MCP: "MCP → vault +\n00_Brain"
}

NEW: "Cursor Agent" {
  grid-columns: 2
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8

  RULES: ".cursor/rules/*.mdc\nalwaysApply"
  HOOKS: "sessionStart hook\n→ snapshot file"
  AGENTS: "AGENTS.md\n+ vault MCP"
}

OLD -> NEW: "same vault files\ndifferent enforcement" {
  style.stroke: "#ff6a3d"
}
```

The files in Obsidian did not change on day one. **What had to change was how the IDE was told to read them.**

---

## How I adjusted the Obsidian brain (beyond the repo)

My universal brain lives in `00_Brain`: methodology, deploy playbook, bootstrapping checklists, manual prompts. Project truth lives in `40_VSCode/<Project>/` with Operations notes, Feature notes, and session logs. That split predates Cursor and still works. See [the dual-vault architecture](/posts/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian).

What failed on the Copilot side was **spec fragmentation plus weak footer injection**. The session footer lived in four places with different fields: Deploy Playbook, End of Session prompt, per-project copilot-instructions, and (initially) no Cursor rule at all. Copilot read whichever fragment surfaced early, then ignored output-format rules once the thread got long.

### Retrofit actions (May 2026, contract v3.1 since June)

1. **Canonical footer** — One note: `00_Brain/Conventions/Response Footer Contract.md` (currently **v3.1**: seven named modes A–G instead of a fixed line count). Every work reply opens with **Session context** (3–6 lines) and closes with **Mode: X** plus that mode's fixed fields. Copilot repos **link** here; Cursor repos mirror it in `response-footer.mdc`.

2. **Cursor templates in the brain** — `00_Brain/Templates/cursor/response-footer.mdc` and `session-protocol.mdc` copied into each repo at bootstrap. Retrofit checklist gained **Step 2b: install Cursor rules**. Previously the brain only mentioned Copilot.

3. **Universal prompts cleaned** — `Start of Session.md` had Vouch-only Sentry commands in the "universal" prompt. That erodes trust. Project-specific bootstrap moved to Vouch vault and copilot-instructions; the brain prompt now points to optional project steps.

4. **Deploy Playbook deduped** — Deploy gates stay in Deploy Playbook; footer template removed and linked to the contract.

5. **Per-project sync** — Each active repo got `response-footer.mdc` with `alwaysApply: true`, `AGENTS.md` pointing at the contract, and copilot-instructions reduced to **links only** (no pasted footer template). Optional: `petralian-obsidian` MCP on Petralian for vault writes without leaving the agent.

```d2
direction: right

BRAIN: "00_Brain" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  RFC: "Response Footer\nContract"
  TPL: "Templates/cursor/\n*.mdc"
  METH: "AI Agent\nMethodology"
}

REPO: "Project repo" {
  grid-columns: 2
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8

  CR: ".cursor/rules/"
  AG: "AGENTS.md"
  MR: "memories/repo/"
}

VAULT: "40_VSCode/Project" {
  grid-columns: 2
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8

  BR: "AI Session Bridge"
  SS: "Session Summaries"
  SN: "Sessions/YYYY-MM-DD"
}

BRAIN -> REPO: "copy rules\nlink RFC"
BRAIN -> VAULT: "read at start\nwrite at end"
REPO -> VAULT: "MCP dual-path"
```

This matches the [four-layer memory model](/posts/three-layer-external-brain-for-ai-first-development): chat is layer 1; Operations + repo memory is layer 2; Features + Brain conventions are layer 3; rules + hooks are layer 4 feedback hardened.

---

## Additional detail

### Migration playbook (what I did, in order)

On each repo I touched, the pattern was the same even when the details differed:

- Repos that already had a **session-start hook** only needed the always-on footer rule added.
- Repos that had some Cursor rules but no brain documentation got the vault Operations layer, repo memory stubs, and links to the canonical footer.
- Smaller or idle repos kept dual MCP paths and a minimal vault; Cursor rules wait until the next active session.

That is **copy-paste drift** in reverse: one checklist, applied per repo, instead of one long instructions file that silently inherited the wrong stack (for example, a post-implementation checklist that still mentioned PHP lint on a Next.js site).

Practical order for your own migration:

1. Wire MCP to project vault + `00_Brain` (unchanged requirement). On Petralian, `petralian-obsidian` MCP can write vault notes directly.
2. Copy `Templates/cursor/*.mdc`; replace `<ProjectName>`; verify `alwaysApply: true`.
3. Point `AGENTS.md` and copilot-instructions at the Response Footer Contract. Copilot: link only. Cursor: mirror the contract in rules.
4. Add a `sessionStart` hook only if you have automated inbox/health/git pull (optional).
5. Optional on heavy repos: copy `validate-footer` hook from Vouch for `afterAgentResponse` field counting.
6. Open a **new** Agent chat and confirm the first work reply has Session context + a mode footer (e.g. Mode C for a code edit) with a real Obsidian line.

---

### What improved, and what did not

**Improved**

- Footer and session context survive longer chats when encoded as always-on rules (the main gap vs Copilot).
- One canonical spec (v3.1 modes) reduced contradictory field names (`Obsidian updated` vs `Obsidian: read ✓`).
- Brain bootstrapping docs now mention Cursor explicitly; new projects get rules by default.

**Still hard**

- Hooks inject context; they cannot append the footer to model output. Compliance still depends on rules + habit.
- **Copilot-only repos** still drift unless you keep sessions short or duplicate the always-on pattern some other way.
- Long agent runs can still ignore vault updates if the human does not enforce "code + memory ship together."
- Projects without retrofit still depend on user-level Cursor rules as a safety net.

### Reference

### Quick reference: enforcement surfaces

| Concern | VS Code + Copilot (example) | Cursor Agent (example) |
|---------|----------------------------|-------------------------|
| Primary instructions | `.github/copilot-instructions.md` | `.cursor/rules/*.mdc` + `AGENTS.md` |
| Footer enforcement | Paragraph inside big instructions file | `response-footer.mdc` `alwaysApply: true` |
| Re-injection | Chat scope; dilutes on long threads | Every agent turn |
| Session start | Manual vault reads | `sessionStart` hook → snapshot (optional) |
| Output validation | Model self-polices | Optional `afterAgentResponse` hook |
| Canonical spec | Link to Brain Response Footer Contract v3.1 | Mirror contract in rules |

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|--------------|-----|
| Pasting full footer template into copilot-instructions | Competes with deploy gates; drops first | One canonical contract; link only in Copilot repos |
| Expecting hooks to append footers | Hooks inject context, not model output | Rules + habit; optional validator warns |
| Migrating IDE without Cursor rules copy | Same vault, zero enforcement | Copy `Templates/cursor/*.mdc` per repo |
| Four footer specs in different docs | Contradictory field names | v3.1 modes A–G in one Brain note |
| "Code only" sessions skipping vault | Memory rots; next session amnesiac | Enforce code + memory ship together |
| Treating Cursor as Copilot + chat | Miss agent-first session shape | Session context top + mode footer bottom |

## FAQ

### Did my Obsidian files need to change on day one?

**No.** What changed was **how the IDE enforces reading and writing them**—rules, hooks, and canonical footer.

### Can Copilot match Cursor footer compliance?

**Possible with short chats** or future always-on equivalent. Today: footer rules dilute in long Copilot threads without a dedicated per-turn rule surface.

### What is v3.1 footer modes A–G?

Seven reply shapes with fixed fields—Mode A for pure Q&A (lighter), Mode C–D for code work with Obsidian proof. Spec lives in Brain `Response Footer Contract.md`.

### Do I need the validate-footer hook?

**Optional.** Always-on `response-footer.mdc` alone moved compliance from "usually missing" to "almost always present" in my migration.

### Should I abandon Copilot entirely?

**Not necessarily.** Use Copilot for completions; use Cursor Agent where **session handoffs must stick** ([baseline model companion](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results)).

### What you can do next

If you are on Copilot today and evaluating Cursor:

1. Audit where your **non-negotiables** live (footer, bootstrap order, deploy gate). If they are only in copilot-instructions, plan a Cursor rules copy, not a rewrite from scratch.
2. Centralize the footer in one brain note and link everywhere else.
3. Run one real task in a fresh Agent chat and score the reply: Session context present? Mode footer complete (e.g. Mode C)? Obsidian line filled in with read/write proof?

If you still use Copilot for some repos, **do not expect footer compliance from copilot-instructions alone**. Either keep those chats short, or port the footer into a Cursor-style always-on rule when Copilot adds equivalent support. Until then, treat Copilot as strong for completions and Cursor as the place where session handoffs must stick.

If you already use Cursor but sessions feel amnesiac, the fix is usually not a bigger model. It is **aligning enforcement surfaces** with the file memory you already built. The companion article on [Composer 2.5 as my single baseline model](/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results) explains why I paired this retrofit with a deliberate model choice instead of chasing every frontier release.
