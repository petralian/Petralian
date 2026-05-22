---
title: "What I Learned Directing AI as My Primary Engineer"
slug: what-i-learned-directing-ai-as-my-primary-engineer
date: 2026-05-21
status: draft
category: Ideas
tags: [AI engineering, vibe coding, software development, leadership, Vouch, Gravio]
excerpt: "I built two software products with AI as the primary engineer. Not as an assistant to a team — as the team. Here's the leadership account of what I actually learned."
focus_keyword: directing AI as primary engineer
seo_title: "What I Learned Directing AI as My Primary Engineer"
meta_description: "I built two software products solo with AI as the primary engineer. Here's a first-person leadership account of context management, the efficiency curve, and what enterprise programs should expect."
featured_image:
featured_image_alt: "A single person reviewing and directing AI-generated code builds on multiple monitors"
---

Over the last year, I built two software products — Vouch and Gravio — without a development team. AI wrote the code. I directed the build, made the product decisions, and approved or rejected the output. I went into this as a delivery director, not an engineer — I wanted to understand firsthand what it actually means to run a complex software build with AI as the primary engineer. What I found has changed how I think about enterprise AI programs, and most of it is not in the conversations I see about AI tooling.

---

## The Context Management Layer Is the Job

<!-- SECTION IMAGE: A person at a large desk surrounded by a structured notebook and handwritten notes alongside multiple monitors showing code. Overhead editorial view, natural light, muted tones. No faces, no brand logos. -->

The primary job of someone directing an AI engineer is not reviewing code. It is managing context.

An AI coding assistant does not carry memory between sessions. Left without structure, it optimizes locally — making a technically sound change without awareness of a constraint established in a previous session or a dependency it is not currently examining. The practical result: you spend more time fixing architectural drift than you save on generation.

The work delivering the most value was not describing what to build. It was maintaining a running record of what had been built, why specific decisions were made, and what was off-limits. Architectural decision documents. Explicit rules about what cannot change without review. Systematic context-loading at the start of every session.

> **55% faster** — In a controlled experiment with 95 professional developers, those using GitHub Copilot completed an identical programming task 55% faster than those without it. That gain depends entirely on the quality of context the AI is working with. [1]

A well-maintained context layer is what turns productivity potential into consistent, recoverable output. Without it, the gains are real but fragile.

---

## The Productivity Curve Is Not Linear

<!-- SECTION IMAGE: A clean editorial illustration of a steep logarithmic curve drawn in marker on a whiteboard, with sparse annotations marking "prototyping" at the steep section and "production hardening" at the flat section. Minimal, no faces, muted tones. -->

If you plotted AI's productivity contribution across a full build cycle, the gains look logarithmic: enormous in the early phases, then flattening as you approach production quality.

In prototyping and early scaffolding, AI is exceptional. You can move from a concept to a reviewable prototype in days. McKinsey's analysis of generative AI's economic potential identified software engineering as one of the highest-impact applications, with the most dramatic gains in initial development and testing phases [2].

> **Production is a different conversation.** Edge-case coverage, security hardening, performance under real load, coherence across a system that has grown in genuine complexity — the effort-to-output ratio changes. The proportion of work requiring active human judgment goes up substantially.

The planning implication is direct. If a program's business case is built on the gains at the start of the curve — and those gains are genuinely impressive — the production hardening phase will arrive looking more expensive than planned. Understanding the shape of the curve is what allows you to set stakeholder expectations that hold throughout the program, not just in the first quarter.

---

## What This Changes About Enterprise Programs

<!-- SECTION IMAGE: A focused professional reviewing a printed architectural diagram at a modern office desk, annotating with a pen. Natural light from a large window. No screens visible. Editorial composition, muted tones. -->

The transition to production quality is where the operating model matters most.

What made the difference in my builds was not the model selection. It was the context infrastructure — the external memory, the decision documentation, the architectural governance ensuring the AI was always working with an accurate picture of the whole system.

> **90% more fulfilled, 84% increase in successful builds** — In GitHub's enterprise study with Accenture, 90% of developers felt more fulfilled at work using Copilot, 95% enjoyed coding more, and successful CI builds increased 84%. The quality gains are real — but they depend on the operating model around the tool, not the tool alone. [4]

Stanford HAI's 2026 AI Index confirms that AI coding productivity gains vary significantly with complexity and context [3]. Simple, well-specified tasks: excellent. Complex, context-dependent work in a mature codebase: reliable only with proper context management in place.

The role that becomes more important, not less, is the person with enough technical and commercial understanding to maintain architectural coherence across the full build. Not a prompt engineer. A technical delivery lead who has internalized how to work with AI — what to delegate, what to verify, and when to reset context before continuing.

---

## My Take

Building Vouch and Gravio with AI as the primary engineer was one of the more instructive things I have done. Not because it confirmed that AI is capable — it is — but because it made the operating model question concrete in ways that theoretical conversations about AI development do not.

The productivity gains are real. The context management requirement is also real. The efficiency curve flattens toward production. None of that makes AI a less compelling engineering partner. It makes it a partner that benefits from structured direction — context-rich, and led by someone who understands the business objective well enough to maintain coherence through the full cycle.

Programs that invest in that direction layer will see compounding, sustainable results. Programs treating AI as a drop-in replacement for developer judgment, without context infrastructure, will see gains that are impressive early and inconsistent after that.

If you are directing AI through a build program and want to compare approaches, feel free to reach out.

---

**Sources:**

1. GitHub, "Research: quantifying GitHub Copilot's impact on developer productivity and happiness." September 7, 2022. https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/
2. McKinsey & Company, "The economic potential of generative AI: The next productivity frontier." June 2023. https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier
3. Stanford University Human-Centered AI Institute, "AI Index Report 2026." https://hai.stanford.edu/ai-index
4. GitHub & Accenture, "Research: Quantifying GitHub Copilot's impact in the enterprise with Accenture." May 13, 2024. https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/

**Further Reading:**

- McKinsey & Company, "Superagency in the Workplace: Empowering People to Unlock AI's Full Potential" (January 2025): https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/superagency-in-the-workplace-empowering-people-to-unlock-ais-full-potential
- GitHub, "Survey: The AI wave continues to grow on software development teams" (August 2024): https://github.blog/news-insights/research/survey-ai-wave-grows/

---

## Featured Image Prompt (Flux AI)

**Prompt:** A focused, cinematic wide shot of a single person at a large desk, viewed from slightly above and behind, surrounded by multiple large monitors showing code. Late afternoon natural light. The person is leaning forward, actively reviewing and annotating. The feeling is of thoughtful direction and precision. Clean home office or studio environment, no stock-photo aesthetics. Muted tones, slight grain. No faces visible, no brand logos, no text overlay.

**File name:** directing-ai-as-primary-engineer.jpg
**Alt text:** A person directing AI-generated code builds on multiple monitors, representing the leadership role in AI-assisted software development

---

## Social Teasers

### LinkedIn Teaser 1

Over the last year, I built two software products without a development team. AI wrote the code. I directed the build.

I went into it as a delivery director, not an engineer. What I learned about context management, the shape of the efficiency curve, and what the operating model actually needs to look like — I wrote about it here.

This is not a tutorial. It is a leadership account.

https://petralian.com/what-i-learned-directing-ai-as-my-primary-engineer/

### LinkedIn Teaser 2

The productivity gains from AI-assisted development are real. So is the efficiency curve.

The gains are enormous in the prototyping phase. They flatten, sharply, as you approach production quality. If your program's business case is built on the easy part of the curve, the production hardening phase will arrive looking more expensive than planned.

Here's what I found after a year of directing AI as my primary engineer: https://petralian.com/what-i-learned-directing-ai-as-my-primary-engineer/

### X Teaser 1

I built two software products with AI as the primary engineer, no dev team. The lesson was not about the model. It was about context management.

https://petralian.com/what-i-learned-directing-ai-as-my-primary-engineer/

### X Teaser 2

AI is exceptional at prototyping. It is a different conversation when you are approaching production. Here is what the efficiency curve actually looks like from inside a solo AI-directed build.

https://petralian.com/what-i-learned-directing-ai-as-my-primary-engineer/
