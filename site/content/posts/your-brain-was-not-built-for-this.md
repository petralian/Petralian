---
title: "Your Brain Was Not Built for This: Why I Built a Second One in Obsidian"
slug: your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian
category: Ideas
tags: [obsidian, second-brain, personal-knowledge-management, productivity, AI]
focus_keyword: obsidian second brain
seo_title: "Obsidian Second Brain: Why I Built One (And You Should Too)"
meta_description: "Your brain was not built for modern information overload. Here's why my Obsidian second brain helps me retrieve ideas, context, and insight."
featured_image: obsidian-second-brain-graph-view.png
featured_image_alt: "Obsidian graph view showing interconnected notes in a second brain system"
---

I had a moment a few months ago that I suspect a lot of people in leadership positions will recognize. I was preparing for a client meeting, and I knew I had read something relevant, a framework, a case study, something, but I could not find it. Not in my email. Not in my browser history. Not in the OneNote notebook I was sure I saved it in. It was gone, swallowed by the same digital void that eats every good idea you do not capture immediately. That was the moment I realized I needed an Obsidian second brain, not just another note-taking app.

That frustration is what pushed me to take the second brain concept seriously, and specifically to build my own using Obsidian. Not as a productivity hack, but as an operating model for how I actually work. After months of using Obsidian as the backbone of that system, I think it is worth sharing what I have learned, where it works, and where it does not.

---

## The Problem Nobody in Leadership Talks About

Here is the thing about information overload that most productivity advice misses: the problem is not that we have too much information. The problem is that we have no reliable system for retrieving what we already know. Tiago Forte, who popularized the Building a Second Brain methodology, puts it simply: your brain is for having ideas, not for holding them. That distinction sounds obvious, but most of us still operate as if remembering is the same as knowing.

The research backs this up. A 2024 study published in Human-Computer Interaction found that personal knowledge management tools significantly reduce cognitive load when users adopt structured capture and retrieval habits, but that the benefits collapse when people treat the tool as a dumping ground rather than a system. In other words, the tool alone does nothing. The system does the work.

For those of us leading transformation programs across multiple clients and verticals, the stakes are higher than just personal convenience. The ability to retrieve the right piece of information at the right moment is not a nice-to-have. It is a competitive advantage.

---

## Why the Obsidian Second Brain Won Over OneNote and Notion

I spent years in OneNote. It is a solid tool, great for freeform note-taking, decent search, and it integrates cleanly with the Microsoft ecosystem. But over time, I kept running into the same walls. My notes were trapped in a proprietary format. I could not script against them, link them programmatically, or use them as inputs for AI tools. The structure was rigid in all the wrong places and too loose in the places that mattered.

Notion is excellent for team collaboration, but it has the same fundamental problem: your data lives in someone else's cloud, in someone else's format. When the subscription changes or the service pivots, your knowledge goes with it.

Obsidian won for reasons that I think matter more than most people realize when they are choosing a tool:

1. **Plain Markdown files on your filesystem.** Every note in Obsidian is a .md file sitting in a folder on your machine. No proprietary database. No cloud lock-in. If Obsidian disappears tomorrow, your notes are still there, readable in any text editor on the planet. But here is what really sold me: because they are just files, they become a first-class citizen in every toolchain I already use. My AI coding assistant reads them. My scripts can grep them. My version control tracks them. The vault is not an app, it is a file system that happens to have a beautiful editor on top of it.
2. **Rich Markdown and internal linking.** Obsidian uses Wikilinks, double-bracket references like [[digital transformation]], that create connections between notes. Over time, those links form a graph of relationships that mirrors how your brain actually associates ideas, not how a folder hierarchy forces you to categorize them. The graph view, which visualizes those connections, is more than a gimmick. It is how I discover that a note I wrote about CRM strategy six months ago connects directly to something I am writing about AI agents today. Combined with full Markdown support, tables, code blocks, callouts, footnotes, the format is expressive enough for serious work, not just quick captures.
3. **The plugin ecosystem is massive.** Obsidian has over 2,000 community plugins. That sounds like a feature list, but what it really means is that the tool adapts to you, not the other way around. I use plugins for Kanban boards, daily journaling, database views, and integration with VS Code. My vault looks nothing like a default Obsidian setup, and that is the point. The same flexibility is why I think it pairs so well with the kinds of workflows I described in [Mastering AI Prompting Frameworks for Marketers](/mastering-ai-prompting-frameworks-for-marketers-transforming-campaigns-with-the-right-ai-tools/), where context quality matters more than tool novelty.

According to Fast Company, Obsidian estimates approximately one million users based on GitHub download counts, with a Discord community of over 110,000 members and a Reddit community ranking in the top 5% of all Reddit communities. That is not Notion-scale, but it is a serious and growing user base for a tool that has taken zero venture capital and remains 100% user-supported.

---

## How I Actually Organize My Obsidian Second Brain

I am not going to pretend my system was elegant from day one. It was not. I spent weeks over-engineering folder structures, tagging everything, and creating templates I never used. What I eventually landed on is simpler than what I started with, and it works.

My vault is organized around a structure I adapted from the PARA method that Tiago Forte popularizes:

- **Projects** - active engagements with deliverables and deadlines
- **Areas** - ongoing responsibilities, client relationships, thought leadership, personal development
- **Resources** - reference material, frameworks, industry analysis
- **Archive** - completed or dormant items

But I made it my own. I run a universal Brain vault, 00_Brain, that holds all my cross-project conventions, AI agent methodology, templates, and bootstrapping rules. Every project or client gets its own vault under 40_VSCode/, and each project vault links back to the Brain rather than duplicating its rules. That dual-vault architecture means my AI assistants always have access to both project-specific context and universal rules, without either one polluting the other.

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

---

## Where Obsidian Falls Short

I think it is important to be honest about the limitations, because it does take effort to get Obsidian going.

**It's built for power users.** PCMag's review noted that Obsidian's flexibility comes at the cost of beginner friendliness, and that many features users want are only available through community plugins, which requires time and technical comfort to set up properly. If you are not willing to invest time in the initial setup, Obsidian will frustrate you.

**Collaboration is not its strength.** If your primary need is real-time team editing, Notion or Google Docs is still the better choice. Obsidian Sync supports shared vaults, but it is designed for individual use, not enterprise collaboration at scale.

---

## The AI Question Is Not a Weakness, It Is the Whole Point

One of the most common critiques of Obsidian is that it has no built-in AI. As of 2026, Obsidian's CEO Steph Ango has been explicit that the product prioritizes community and user ownership over AI integration. Most reviewers treat this as a gap.

I think they are looking at it backwards.

Obsidian's power is not that it has AI. Its power is that it is a brain for AI. Because every note is a plain Markdown file on the filesystem, every AI tool I use, Copilot for coding, Hermes for personal management, custom scripts for research, can read and write my vault directly. My AI assistants do not need an API key or a plugin marketplace to access my knowledge. They just open the files.

If Obsidian added its own AI layer, it would inevitably become a walled garden. The AI would only see what Obsidian chooses to expose. The prompts would be locked inside the app. The context would be siloed. Instead, by staying out of the AI business, Obsidian lets me connect every AI tool I use to the same source of truth. My Copilot sessions read my project vaults. Hermes reads my personal context. My deployment scripts read my conventions. All of them write back to the same Markdown files.

That openness matters beyond note-taking. It is the same reason I have been skeptical of platforms that centralize too much control in the product itself, whether that is in AI tooling or in broader operating-model decisions like the ones I covered in [Is Salesforce Becoming Invisible on Purpose, or Becoming Irrelevant?](/is-salesforce-becoming-invisible-on-purpose-or-becoming-irrelevant/).

That is not a missing feature. That is an architectural decision, and I think it is the right one.

---

## What I Think

A second brain is not a productivity hack. It is an infrastructure decision. Just like enterprises need data governance before they can extract value from AI, individuals need knowledge governance before they can extract value from their own thinking. Obsidian is the best tool I have found for that purpose, and the reason comes down to one thing: it gets out of the way.

Plain Markdown files mean my knowledge is durable, portable, and machine-readable. Internal linking means ideas compound over time instead of rotting in folders. The plugin ecosystem means the tool bends to my workflow, not the other way around. And the absence of built-in AI means every AI tool I use can plug into the same brain without walls.

What matters is the discipline of capturing ideas before they evaporate, the habit of linking those ideas to what you already know, and the commitment to reviewing and pruning the system regularly, even if AI handles most of the routine parts. Obsidian makes those habits possible. It does not make them automatic.

For me, that is the real value of an Obsidian second brain. It does not make me smarter. It makes my thinking easier to retrieve, connect, and compound.

If you are someone who regularly works across multiple projects, markets, or domains, and you are tired of losing ideas you know you had, I would encourage you to try it. Start small, a daily note, a project folder, a handful of links. Let it grow organically. The value compounds, but only if you show up consistently.

If you want to compare notes on how I set up my vault, or discuss whether a second brain approach makes sense for your workflow, feel free to reach out. I am always happy to share what I have learned, including the mistakes.

**Sources:**

1. Tiago Forte, Building a Second Brain: A Proven Method to Organize Your Digital Life and Unlock Your Creative Potential (Atria Books, 2022). https://www.buildingasecondbrain.com/
2. Dix, Alan. "The future of PIM: pragmatics and potential." Human-Computer Interaction, Taylor & Francis, June 2024. https://www.tandfonline.com/doi/pdf/10.1080/07370024.2024.2356155
3. Obsidian, "Manifesto - Durable." https://obsidian.md/about
4. Pyne, Yvette and Stewart, Stuart. "Meta-work: how we research is as important as what we research." British Journal of General Practice, March 2022. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8884432
5. Obsidian Community Plugins. https://community.obsidian.md/
6. Newman, Jared. "The cult of Obsidian: Why people are obsessed with the note-taking app." Fast Company, October 13, 2023. https://www.fastcompany.com/90960653/why-people-are-obsessed-with-obsidian-the-indie-darling-of-notetaking-apps
7. Obsidian, "Manifesto - Independent." https://obsidian.md/about
8. Pot, Justin. "Obsidian Review." PCMag, December 7, 2025. https://www.pcmag.com/reviews/obsidian
9. Newton, Casey. "Obsidian's CEO on why productivity tools need community more than AI." The Verge, August 18, 2025. https://www.theverge.com/decoder-podcast-with-nilay-patel/760522/obsidian-ceo-steph-ango-kepano-productivity-software-notes-app

**Further Reading:**

- Obsidian Help Documentation: https://help.obsidian.md/
- Tiago Forte, The PARA Method: The Simple System for Organizing Your Digital Life in Seconds (Atria Books, 2023)
- Wired: "How to Use Obsidian for Writing and Productivity": https://www.wired.com/story/how-to-use-obsidian-writing-productivity-markdown/

## Featured Image Prompt (Flux AI)

**Prompt:** A minimalist, modern digital workspace scene showing a glowing network of interconnected nodes and lines floating above a dark desk surface, representing a knowledge graph. Soft blue and purple ambient lighting. Clean, professional, tech-forward aesthetic. No text, no UI chrome. Cinematic lighting, shallow depth of field, 8k quality. The nodes are subtle, elegant dots connected by thin luminous threads, evoking the feeling of organized thought and interconnected ideas.

**Generation instructions:** Create a 16:9 hero image for the blog header. Aim for a calm, editorial look rather than a generic sci-fi poster. Keep the focal point centered so it reads well in both the article header and blog card thumbnails.

**Acceptance guidelines:**
- No text overlay, watermark, logos, or visible software UI
- Use a clean knowledge-graph metaphor, not a literal screenshot of Obsidian
- Prefer dark slate, graphite, blue, and cyan tones with restrained contrast
- Export as JPG or WebP at 1600x900 minimum
- Keep the final file under a web-friendly size after compression

**Negative prompt:** cluttered interface, floating app windows, legible on-image text, stock-photo people, neon cyberpunk overload, low-resolution blur, watermark

**File name:** obsidian-second-brain-graph-view.png
**Alt text:** Obsidian graph view showing interconnected notes in a second brain system

**WordPress usage note:** Upload as the featured image for the post, preserve the file name slug, and use the alt text verbatim unless the final composition requires a more accurate description.

**Approval prompt template:** Please review the local article at http://localhost:8082/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian/ and let me know if it is approved. If the featured image is still missing, please generate it in the prompt window using the Flux prompt below. Once approved, I will ask whether the live action should be `draft` or `publish`.

## Visual Enhancement Pack (Optional but Recommended)

**Prompt-window request if assets are missing:** Please generate the featured image first. If you want extra visuals for the article, start with the comparison matrix, then the ecosystem chart, then the weekly review loop.

### Visual 1: Tool Comparison Matrix
- **Placement:** After "Why the Obsidian Second Brain Won Over OneNote and Notion"
- **Format:** 2x2 matrix infographic
- **Axes:** `Data ownership: low → high` and `Collaboration-native: low → high`
- **Items to place:** OneNote, Notion, Obsidian, Google Docs
- **Creative brief:** Clean editorial chart, minimal labels, dark slate background, blue/cyan highlight accents, no product logos larger than the data labels

### Visual 2: Obsidian Ecosystem Traction Chart
- **Placement:** After the plugin ecosystem paragraph
- **Format:** Simple bar chart or stat cards
- **Data points:** `2,000+ community plugins` from source [5], `~1,000,000 estimated users`, `110,000+ Discord members`, and `top 5% Reddit community` from source [6]
- **Chart note:** If a chart is not practical, use a four-card stat strip with citations underneath

### Visual 3: Weekly Review Loop Diagram
- **Placement:** After the weekly review paragraph
- **Format:** Four-step loop diagram
- **Steps:** Capture → Link → Review → Archive
- **Creative brief:** Minimal process loop, quiet editorial styling, no fake software screenshots

### Visual 4: Obsidian SWOT Snapshot
- **Placement:** After "Where Obsidian Falls Short"
- **Format:** One-panel SWOT grid
- **Content:** Strengths = plain files, internal links, plugins; Weaknesses = learning curve, weak collaboration; Opportunities = AI bridges, long-term knowledge compounding; Threats = tool sprawl, setup fatigue
- **Use case:** Good fallback if you want one strategic visual instead of multiple diagrams

---

## Social Teasers

### LinkedIn Teaser 1
Your brain was not built for the volume of information you process every day. I spent years losing ideas in OneNote before I realized the problem was not my memory, it was my system.

Here is why I built a second brain in Obsidian, and why plain Markdown files turned out to be the secret weapon I did not know I needed.

https://petralian.com/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian/

### LinkedIn Teaser 2
The most common critique of Obsidian is that it has no built-in AI. I think that is exactly why it works.

When your notes are just Markdown files on your filesystem, every AI tool you use can read them. Copilot, Claude, your own scripts. No API keys, no plugins, no walled gardens.

I wrote about how I use Obsidian as a second brain, and why the absence of AI is the whole point.

https://petralian.com/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian/

### X Teaser 1
Your brain was not built for modern information overload. I built a second one in Obsidian, and plain Markdown files turned out to be the secret.

https://petralian.com/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian/

### X Teaser 2
The best thing about Obsidian? It has no built-in AI. That is not a bug. It is the architecture.

https://petralian.com/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian/
