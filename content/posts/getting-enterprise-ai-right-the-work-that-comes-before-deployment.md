---
title: "Getting Enterprise AI Right: The Work That Comes Before Deployment"
slug: getting-enterprise-ai-right-the-work-that-comes-before-deployment
date: 2026-05-21
status: published
category: AI & Technology
tags: ["Enterprise AI", "Digital Transformation", "Program Delivery"]
excerpt: "The organizations that get the most sustained value from enterprise AI share one pattern. They build the foundation before they build the model."
focus_keyword: enterprise AI program
seo_title: "Getting Enterprise AI Right: The Work That Comes Before Deployment"
meta_description: "The organizations that get sustained value from enterprise AI share one pattern: they build the foundation layer before deployment. Here's what that looks like."
featured_image:
featured_image_alt: "A blueprint and open notebook on a clean desk, representing the foundation work required before enterprise AI deployment"
---

> **External Memory Series** — File-based memory for AI-assisted work ([overview](/posts/external-memory-series-guide) · [1 Implementation](/posts/three-layer-external-brain-for-ai-first-development) · [2 Productivity](/posts/obsidian-memory-layers-personal-productivity-beyond-chat) · [3 vs the diagram](/posts/why-file-memory-beats-the-three-layer-diagram-for-builders) · [4 Governance](/posts/why-deliberate-file-memory-beats-hoping-agents-remember))
I had a conversation earlier this year with a CTO who was more than a year into their enterprise AI program. The use cases were well developed. The models were performing well during testing. The vendor had delivered what they committed to. And yet the program was being scoped back - reassigned to a new sponsor, stakeholders reduced and given six months to find something else to present.

When I asked why this happened, she said something I have read variations of across many similar conversations: "We could not roll it out, we were not ready for it."

That phrase is doing a lot of work. And I think it is pointing to the most important conversation in enterprise AI right now - one that gets significantly less airtime than the model conversation.

IBM's Global AI Adoption Index for 2024 found that 42% of enterprise-scale companies reported actively deploying AI, with another 40% exploring or experimenting [1]. The technology story is clearly moving. But deployment rates tell you what organizations are attempting. They do not tell you how those programs are performing once they move beyond the pilot.

The pattern I have seen consistently, from years of leading transformation programs across APAC and from building AI-assisted products myself, is that the organizations extracting sustained value from AI share one thing: they built the foundation layer before they built the model as a deliberate program design choice.

Here is what that foundation actually consists of.

---

## Getting the Frame Right: Productivity Gain Is Not Cost Efficiency

The most important decision most enterprise AI programs make - often before anyone has written a requirements document - is the frame.

Programs built around cost efficiency and programs built around productivity gain look nearly identical in their early stages. Both have use cases, models, vendors, and steering committees. The difference is in the underlying logic: a cost efficiency program measures what gets cut, and a productivity gain program measures what becomes possible.

That difference shapes everything about implementation. A program framed around headcount replacement puts the people with the most relevant domain knowledge in the position of opposing the program's success. They are not being unreasonable. They are responding rationally to the incentive structure in front of them. The result is a program that moves fast through governance and slowly through actual adoption - because the people who understand the domain well enough to catch what the model gets wrong have no reason to engage.

The productivity gain frame inverts that dynamic. If the explicit goal is to free up experienced people to do more of the work that requires their judgment, those people become assets in the program. Their domain knowledge is what makes the AI useful. McKinsey's research on AI-driven organizations consistently finds that the programs generating real and durable revenue impact are those where AI augments high-skill workers [2]. That distinction shows up in every decision from use case selection through to change management.

---

## The Three Layers That Consistently Separate Successful AI Programs

Between a validated use case and a deployed AI program sits a layer of work that most organizations either rush or underinvest in. In my experience, the difference almost always comes down to three things.

**Data readiness.** AI programs inherit whatever data quality problems already exist in the organization, but they surface those problems at scale and in front of stakeholders who were not expecting them. IBM's 2024 research noted that data complexity and quality are among the top barriers organizations cite when AI deployment falls short of expectations [1]. The challenge is not just that the data is imperfect - it almost always is. The challenge is that most organizations discover the full extent of their data preparation requirements when the model makes them visible, rather than before they deploy.

A genuine data audit - not a future-state aspiration but an honest current-state assessment - is one of the most valuable early investments an AI program can make. Not because it resolves the data problem immediately, but because it scopes the preparation work with enough lead time to address it properly.

**Governance structure.** Governance in an AI context is not a compliance checkbox. It is the answer to a set of questions that need to be answered before the first production interaction, not after the first high-visibility output error. Who is accountable when the model makes a wrong decision? What is the correction mechanism, and who owns it? How does the system improve over time?

These questions are structurally different from the governance questions for traditional software. The answer to "who is responsible when the software crashes" is relatively clear. The answer to "who is responsible when the model gives advice that turns out to be wrong" is often genuinely unclear - until something goes wrong, at which point it becomes urgent.

**Change management runway.** Prosci's research into program outcomes found that initiatives with excellent change management were six times more likely to meet or exceed their objectives than those with poor or no change management [3]. That finding is particularly acute for AI programs, where the behavioral change required goes beyond learning a new tool and extends to renegotiating how people work, what they trust, and where their judgment is still the standard.

The minimum viable runway is months, not weeks. Programs that deploy and train simultaneously consistently find that the training does not land - because the tool is already embedded in consequential workflows before users have developed enough fluency to use it well.

---

## Why the Foundation Work Keeps Getting Compressed

Here is the part that I think most coverage of AI program challenges misses entirely.

Most program sponsors are not unaware of these three layers. The data quality conversation has been happening for years. Change management is a standard line item on transformation budgets. Governance frameworks exist in every regulated industry. The reason these layers get compressed is structural, not informational.

Program sponsors are typically under pressure to show visible results on a short timeline. Visible results means deployment. Deployment can happen before the data is fully prepared, before governance owners have been named, before the change plan is mature enough to support adoption. In each case, the individual decision looks defensible - a reasonable response to a real constraint.

The programs that avoid this pattern tend to have one thing in common: a transformation lead with genuine seniority and an explicit mandate to protect the foundation work. Not someone managing the schedule. Someone with the standing to walk into a steering committee and say, credibly, that the program is not yet ready to move - and be heard. That is a leadership role, not a technical one, and it is the role that most enterprise AI programs are not structuring for.

---

## What Getting the Order Right Looks Like in Practice

Before any model goes near a production workflow, three things need to be genuinely in place:

1. **A data audit with a remediation plan attached.** Not a future-state roadmap - a present-state assessment of what data exists, in what condition, and what the gap is between current state and what reliable AI performance actually requires. This conversation frequently surfaces the organization's broader data governance situation, which tends to be more relevant to the program's success than any model selection decision.

2. **A governance framework that names accountable owners.** Not a process map - a named list of people who own specific decisions: outputs, errors, corrections, and improvements, before the first production interaction. The accountability structure shapes every downstream decision about where AI is appropriate and where human judgment remains the standard. (read my contribution to https://www.marketing-interactive.com/rise-of-chief-ai-officers-how-hk-firms-are-institutionalising-ai)

3. **A change plan that starts before go-live.** Built around genuine fluency, not tool announcement. The goal is organizational readiness at the point of deployment - people who understand the tool well enough to use it effectively and catch what it misses. That does not happen in a two-week training sprint. It requires early access, real workflows, genuine feedback loops, and time.

None of this is technically novel. It is the same foundation work that successful technology programs have always required. What makes it feel optional in an AI context is the genuine excitement about what the technology can do - excitement that is mostly justified, and that makes it tempting to move directly to deployment.

---

## What I Think

The enterprise AI programs I find most impressive are not the ones with the most advanced models or the most ambitious use cases. They are the ones that took the foundation work seriously before they took the deployment work seriously. The productivity gains they generate are real, and they tend to compound over time rather than eroding as the initial enthusiasm fades.

I think the "not ready" conversation is the most honest conversation in enterprise AI right now. The technology is capable enough to deliver significant value. The organizations that extract it consistently are the ones that invest in readiness before deployment - and that have someone in the room with the standing to insist on it.

If you are building or planning an enterprise AI program and want to compare notes on where the readiness work sits in your current plan, I am always glad to have that conversation. Feel free to reach out.

---

**Sources:**

1. IBM Institute for Business Value, "Global AI Adoption Index 2024." https://www.ibm.com/thought-leadership/institute-business-value/report/ai-adoption-index
2. McKinsey & Company, "The State of AI in 2024: GenAI adoption spikes and starts to generate value." May 2024. https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
3. Prosci, "The Value of Effective Change Management." Prosci Best Practices in Change Management, 11th edition. https://www.prosci.com/resources/articles/value-effective-change-management
4. BCG, "From Potential to Profit with GenAI." October 2024. https://www.bcg.com/publications/2024/from-potential-to-profit-with-genai
5. MIT Sloan Management Review, "Expanding AI's Impact With Organizational Learning." https://sloanreview.mit.edu/projects/expanding-ais-impact-with-organizational-learning/

**Further Reading:**

- Harvard Business Review, "Reskilling in the Age of AI": https://hbr.org/2023/09/reskilling-in-the-age-of-ai
- Stanford University Human-Centered AI, "AI Index Report 2024": https://aiindex.stanford.edu/report/

---

## Featured Image Prompt (Flux AI)

**Prompt:** A clean architectural editorial composition. A desk surface with a precise architectural blueprint or floor plan partially visible alongside an open notebook. Soft natural light from the left. The feeling is of careful preparation before building something significant. Warm neutral tones, no digital screens, no technology product logos. Cinematic depth of field. No people, no text overlay, no brand marks.

**File name:** enterprise-ai-program-foundation-layers.jpg
**Alt text:** A blueprint and open notebook on a clean desk, representing the foundation work required before enterprise AI deployment

---

## Social Teasers

### LinkedIn Teaser 1

The most interesting conversation in enterprise AI right now is not about which model to use. It is about what needs to be built before you deploy one.

The organizations that get sustained value from AI share one pattern: they take the foundation work seriously before the deployment work. Data readiness, governance structure, change management runway.

I wrote about what that looks like in practice: /posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment

### LinkedIn Teaser 2

"We just weren't ready for it."

I have heard that from a dozen executives across as many enterprise AI programs. In most cases, the technology worked fine. The use cases were sound. What was not ready was the organization.

Here is what getting ready actually looks like: /posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment

### X Teaser 1

Enterprise AI programs do not struggle because the model is not good enough. They struggle because the foundation work - data, governance, change management - gets compressed.

Here is what getting the order right looks like: /posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment

### X Teaser 2

The organizations that extract real value from AI built the foundation before they built the model. Here is what that foundation actually consists of: /posts/getting-enterprise-ai-right-the-work-that-comes-before-deployment
