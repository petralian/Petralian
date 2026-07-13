---
title: 'Your Brain Was Not Built for This: Why I Built a Second One in Obsidian'
slug: your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian
date: 2026-05-20T00:00:00.000Z
status: published
category: Career
tags:
  - Leadership
  - Enterprise AI
  - Generative AI
excerpt: ''
featured_image: /images/posts/obsidian-second-brain-graph-view.jpg
seo_description: >-
  Why leadership and knowledge work need an Obsidian second brain—plain
  Markdown, linking, and AI-ready files—not another app that traps what you
  already know.
format: hybrid
best_for: Knowledge workers overwhelmed by context who want a second brain without hype
---

> **External Memory Series** — File-based memory for AI-assisted work ([overview](/posts/external-memory-series-guide) · [1 Implementation](/posts/three-layer-external-brain-for-ai-first-development) · [2 Productivity](/posts/obsidian-memory-layers-personal-productivity-beyond-chat) · [3 vs the diagram](/posts/why-file-memory-beats-the-three-layer-diagram-for-builders) · [4 Governance](/posts/why-deliberate-file-memory-beats-hoping-agents-remember))

**TL;DR**

- What Your Brain Was Not Built for This: Why I Built a Second One in Obsidian covers.
- Who it is for and when to use it.
- Practical next steps after reading.

## What is an Obsidian second brain?

An **Obsidian second brain** is a personal knowledge system built from plain Markdown files on your machine—linked notes, a PARA-style structure, and habits for capture and review—so ideas compound instead of disappearing into email, browser history, or proprietary apps. Unlike cloud note tools, the vault is durable, portable, and readable by every AI assistant you connect to it.

**Who it is for:** Leaders, consultants, and builders who work across many projects and need to retrieve what they already know—not just capture more.

**What you will learn:** Why retrieval fails without a system, how Obsidian compares to OneNote and Notion, a practical vault layout, honest limitations, and why "no built-in AI" is a feature for agent-ready knowledge work. For session continuity with agents, see the [External Memory series](/posts/external-memory-series-guide).

I had a moment a few months ago that I suspect a lot of people in leadership positions will recognize. I was preparing for a client meeting, and I knew I had read something relevant, a framework, a case study, something, but I could not find it. Not in my email. Not in my browser history. Not in the OneNote notebook I was sure I saved it in. It was gone, swallowed by the same digital void that eats every good idea you do not capture immediately. That was the moment I realized I needed an Obsidian second brain, not just another note-taking app.

That frustration is what pushed me to take the second brain concept seriously, and specifically to build my own using Obsidian. Not as a productivity hack, but as an operating model for how I actually work. After months of using Obsidian as the backbone of that system, I think it is worth sharing what I have learned, where it works, and where it does not.

## The Problem Nobody in Leadership Talks About

Here is the thing about information overload that most productivity advice misses: the problem is not that we have too much information. The problem is that we have no reliable system for retrieving what we already know. Tiago Forte, who popularized the Building a Second Brain methodology, puts it simply: your brain is for having ideas, not for holding them. That distinction sounds obvious, but most of us still operate as if remembering is the same as knowing.

The research backs this up. A 2024 study published in Human-Computer Interaction found that personal knowledge management tools significantly reduce cognitive load when users adopt structured capture and retrieval habits, but that the benefits collapse when people treat the tool as a dumping ground rather than a system. In other words, the tool alone does nothing. The system does the work.

For those of us leading transformation programs across multiple clients and verticals, the stakes are higher than just personal convenience. The ability to retrieve the right piece of information at the right moment is not a nice-to-have. It is a competitive advantage.

## Why the Obsidian Second Brain Won Over OneNote and Notion

I spent years in OneNote. It is a solid tool, great for freeform note-taking, decent search, and it integrates cleanly with the Microsoft ecosystem. But over time, I kept running into the same walls. My notes were trapped in a proprietary format. I could not script against them, link them programmatically, or use them as inputs for AI tools. The structure was rigid in all the wrong places and too loose in the places that mattered.

Notion is excellent for team collaboration, but it has the same fundamental problem: your data lives in someone else's cloud, in someone else's format. When the subscription changes or the service pivots, your knowledge goes with it.

Obsidian won for reasons that I think matter more than most people realize when they are choosing a tool:

1.  **Plain Markdown files on your filesystem.** Every note in Obsidian is a .md file sitting in a folder on your machine. No proprietary database. No cloud lock-in. If Obsidian disappears tomorrow, your notes are still there, readable in any text editor on the planet. But here is what really sold me: because they are just files, they become a first-class citizen in every toolchain I already use. My AI coding assistant reads them. My scripts can grep them. My version control tracks them. The vault is not an app, it is a file system that happens to have a beautiful editor on top of it.
2.  **Rich Markdown and internal linking.** Obsidian uses Wikilinks, double-bracket references like digital transformation, that create connections between notes. Over time, those links form a graph of relationships that mirrors how your brain actually associates ideas, not how a folder hierarchy forces you to categorize them. The graph view, which visualizes those connections, is more than a gimmick. It is how I discover that a note I wrote about CRM strategy six months ago connects directly to something I am writing about AI agents today. Combined with full Markdown support, tables, code blocks, callouts, footnotes, the format is expressive enough for serious work, not just quick captures.
3.  **The plugin ecosystem is massive.** Obsidian has over 2,000 community plugins. That sounds like a feature list, but what it really means is that the tool adapts to you, not the other way around. I use plugins for Kanban boards, daily journaling, database views, and integration with VS Code. My vault looks nothing like a default Obsidian setup, and that is the point. The same flexibility is why I think it pairs so well with the kinds of workflows I described in [Mastering AI Prompting Frameworks for Marketers](/posts/mastering-ai-prompting-frameworks-for-marketers-transforming-campaigns-with-the-right-ai-tools), where context quality matters more than tool novelty.

According to Fast Company, Obsidian estimates approximately one million users based on GitHub download counts, with a Discord community of over 110,000 members and a Reddit community ranking in the top 5% of all Reddit communities. That is not Notion-scale, but it is a serious and growing user base for a tool that has taken zero venture capital and remains 100% user-supported.

## How I Actually Organize My Obsidian Second Brain

I am not going to pretend my system was elegant from day one. It was not. I spent weeks over-engineering folder structures, tagging everything, and creating templates I never used. What I eventually landed on is simpler than what I started with, and it works.

My vault is organized around a structure I adapted from the PARA method that Tiago Forte popularizes:

-   **Projects** - active engagements with deliverables and deadlines
-   **Areas** - ongoing responsibilities, client relationships, thought leadership, personal development
-   **Resources** - reference material, frameworks, industry analysis
-   **Archive** - completed or dormant items

But I made it my own. I run a universal Brain vault, 00\_Brain, that holds all my cross-project conventions, AI agent methodology, templates, and bootstrapping rules. Every project or client gets its own vault under 40\_VSCode/, and each project vault links back to the Brain rather than duplicating its rules. That dual-vault architecture means my AI assistants always have access to both project-specific context and universal rules, without either one polluting the other.

The structure looks roughly like this:

```
00_Brain/                    ← universal rules, conventions, templates
  AI Agent Methodology.md
  Conventions/
  Best Practices/
  Bootstrapping/
  System/
    Nathan/                  ← personal context, preferences
    Projects/                ← project index
40_VSCode/
  Petralian/                 ← project-specific vault
    Features/
    Design/
    Architecture/
    Operations/
      Sessions/
  Hermes/
  Gravio/
  ...
```

The critical habit, and the one I see most people skip, is the weekly review. Every week, I review what I captured, link new notes to existing ones, and archive what is no longer active. Without that review, the system degrades into a digital junk drawer within a month. With it, the vault compounds in value over time.

And here is the part most people do not realize: most of that review can be automated. I use AI to surface stale notes, suggest links, and flag orphaned entries. My task manager feeds action items in, and my personal AI assistant handles the routine parts of the review. I will write more about that workflow in a future article, but the point is this, the weekly review does not have to be a manual chore.

## Where Obsidian Falls Short

I think it is important to be honest about the limitations, because it does take effort to get Obsidian going.

**It's built for power users.** PCMag's review noted that Obsidian's flexibility comes at the cost of beginner friendliness, and that many features users want are only available through community plugins, which requires time and technical comfort to set up properly. If you are not willing to invest time in the initial setup, Obsidian will frustrate you.

**Collaboration is not its strength.** If your primary need is real-time team editing, Notion or Google Docs is still the better choice. Obsidian Sync supports shared vaults, but it is designed for individual use, not enterprise collaboration at scale.

## Additional detail

### The AI Question Is Not a Weakness, It Is the Whole Point

One of the most common critiques of Obsidian is that it has no built-in AI. As of 2026, Obsidian's CEO Steph Ango has been explicit that the product prioritizes community and user ownership over AI integration. Most reviewers treat this as a gap.

I think they are looking at it backwards.

Obsidian's power is not that it has AI. Its power is that it is a brain for AI. Because every note is a plain Markdown file on the filesystem, every AI tool I use, Copilot for coding, Hermes for personal management, custom scripts for research, can read and write my vault directly. My AI assistants do not need an API key or a plugin marketplace to access my knowledge. They just open the files.

If Obsidian added its own AI layer, it would inevitably become a walled garden. The AI would only see what Obsidian chooses to expose. The prompts would be locked inside the app. The context would be siloed. Instead, by staying out of the AI business, Obsidian lets me connect every AI tool I use to the same source of truth. My Copilot sessions read my project vaults. Hermes reads my personal context. My deployment scripts read my conventions. All of them write back to the same Markdown files.

That openness matters beyond note-taking. It is the same reason I have been skeptical of platforms that centralize too much control in the product itself, whether that is in AI tooling or in broader operating-model decisions like the ones I covered in [Is Salesforce Becoming Invisible on Purpose, or Becoming Irrelevant?](/is-salesforce-becoming-invisible-on-purpose-or-becoming-irrelevant/).

That is not a missing feature. That is an architectural decision, and I think it is the right one.

### What I Think

A second brain is not a productivity hack. It is an infrastructure decision. Just like enterprises need data governance before they can extract value from AI, individuals need knowledge governance before they can extract value from their own thinking. Obsidian is the best tool I have found for that purpose, and the reason comes down to one thing: it gets out of the way.

Plain Markdown files mean my knowledge is durable, portable, and machine-readable. Internal linking means ideas compound over time instead of rotting in folders. The plugin ecosystem means the tool bends to my workflow, not the other way around. And the absence of built-in AI means every AI tool I use can plug into the same brain without walls.

What matters is the discipline of capturing ideas before they evaporate, the habit of linking those ideas to what you already know, and the commitment to reviewing and pruning the system regularly, even if AI handles most of the routine parts. Obsidian makes those habits possible. It does not make them automatic.

For me, that is the real value of an Obsidian second brain. It does not make me smarter. It makes my thinking easier to retrieve, connect, and compound.

If you are someone who regularly works across multiple projects, markets, or domains, and you are tired of losing ideas you know you had, I would encourage you to try it. Start small, a daily note, a project folder, a handful of links. Let it grow organically. The value compounds, but only if you show up consistently.

If you want to compare notes on how I set up my vault, or discuss whether a second brain approach makes sense for your workflow, feel free to reach out. I am always happy to share what I have learned, including the mistakes.

## Common mistakes

| Mistake | Symptom / risk | Fix |
|---------|----------------|-----|
| Treating the tool as a dumping ground | Cognitive load rises; search fails | Structured capture + weekly review; link new notes to existing ones |
| Over-engineering folders and tags on day one | Templates you never use; abandoned vault | Start with daily note, one project folder, a handful of links |
| Skipping the weekly review | Digital junk drawer within a month | Block 30 minutes weekly to process Inbox and archive stale items |
| Choosing cloud-first tools for AI workflows | Notes trapped; agents cannot read your truth | Plain Markdown on disk; vault as filesystem, not walled garden |
| Expecting Obsidian to make habits automatic | System degrades without discipline | Capture before ideas evaporate; review even if AI handles routine parts |

## FAQ

### What is a second brain?

**An external system for storing and retrieving knowledge** so your biological brain can focus on thinking, not remembering—popularized by Tiago Forte's Building a Second Brain methodology.

### Why Obsidian instead of Notion or OneNote?

**Plain Markdown files you own**, Wikilinks for compounding connections, and no proprietary lock-in—so scripts, git, and AI tools can read the same source of truth.

### Does Obsidian have built-in AI?

**Not as of 2026—and that is intentional.** The vault is a brain *for* AI: any assistant can read and write `.md` files without a vendor API or plugin marketplace gate.

### How does this connect to AI session memory?

**This article is the "why Obsidian" foundation;** the [External Memory series](/posts/external-memory-series-guide) layers handoffs, evergreen notes, and rules for AI-assisted development and productivity.

### Is Obsidian good for teams?

**Individual knowledge work first;** real-time collaboration is better in Notion or Google Docs. Shared vaults exist but are not enterprise-scale editing.

**Sources:**

1.  Tiago Forte, Building a Second Brain: A Proven Method to Organize Your Digital Life and Unlock Your Creative Potential (Atria Books, 2022). [https://www.buildingasecondbrain.com/](https://www.buildingasecondbrain.com/)
2.  Dix, Alan. "The future of PIM: pragmatics and potential." Human-Computer Interaction, Taylor & Francis, June 2024. [https://www.tandfonline.com/doi/pdf/10.1080/07370024.2024.2356155](https://www.tandfonline.com/doi/pdf/10.1080/07370024.2024.2356155)
3.  Obsidian, "Manifesto - Durable." [https://obsidian.md/about](https://obsidian.md/about)
4.  Pyne, Yvette and Stewart, Stuart. "Meta-work: how we research is as important as what we research." British Journal of General Practice, March 2022. [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8884432](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8884432)
5.  Obsidian Community Plugins. [https://community.obsidian.md/](https://community.obsidian.md/)
6.  Newman, Jared. "The cult of Obsidian: Why people are obsessed with the note-taking app." Fast Company, October 13, 2023. [https://www.fastcompany.com/90960653/why-people-are-obsessed-with-obsidian-the-indie-darling-of-notetaking-apps](https://www.fastcompany.com/90960653/why-people-are-obsessed-with-obsidian-the-indie-darling-of-notetaking-apps)
7.  Obsidian, "Manifesto - Independent." [https://obsidian.md/about](https://obsidian.md/about)
8.  Pot, Justin. "Obsidian Review." PCMag, December 7, 2025. [https://www.pcmag.com/reviews/obsidian](https://www.pcmag.com/reviews/obsidian)
9.  Newton, Casey. "Obsidian's CEO on why productivity tools need community more than AI." The Verge, August 18, 2025. [https://www.theverge.com/decoder-podcast-with-nilay-patel/760522/obsidian-ceo-steph-ango-kepano-productivity-software-notes-app](https://www.theverge.com/decoder-podcast-with-nilay-patel/760522/obsidian-ceo-steph-ango-kepano-productivity-software-notes-app)

**Further Reading (Petralian):**

-   [The AI Memory Problem: tools vs files that survive](/posts/the-ai-memory-problem-openclaw-hermes-karpathy-approach-that-survives)
-   [External Memory series](/posts/three-layer-external-brain-for-ai-first-development) — layered handoffs for AI-assisted development (drafts; slugs live on publish)
-   [What I Learned Directing AI as My Primary Engineer](/posts/what-i-learned-directing-ai-as-my-primary-engineer)
-   [Publishing Obsidian Drafts Through GitHub Actions](/posts/publishing-obsidian-drafts-through-github-actions)

**Further Reading (external):**

-   Obsidian Help Documentation: [https://help.obsidian.md/](https://help.obsidian.md/)
-   Tiago Forte, The PARA Method: The Simple System for Organizing Your Digital Life in Seconds (Atria Books, 2023)
-   Wired: "How to Use Obsidian for Writing and Productivity": [https://www.wired.com/story/how-to-use-obsidian-writing-productivity-markdown/](https://www.wired.com/story/how-to-use-obsidian-writing-productivity-markdown/)
