---
title: >-
  The AI Memory Problem: OpenClaw, Hermes, Karpathy, and the Approach That
  Actually Survives
slug: the-ai-memory-problem-openclaw-hermes-karpathy-approach-that-survives
date: 2026-05-18T00:00:00.000Z
status: published
category: AI & Building
tags:
  - AI Memory
  - Agentic AI
  - Obsidian
excerpt: >-
  Every AI session starts from scratch. Four tools are racing to solve the AI
  memory problem - OpenClaw, Hermes, Karpathy's LLM wiki, and a plain Obsidian
  vault. Here's how they differ and which approach actually survives tool churn.
focus_keyword: AI memory persistent knowledge management
featured_image: /images/posts/the-ai-memory-problem-openclaw-hermes-karpathy-approach-that-survives.png
seo_description: >-
  The AI memory problem explained: how OpenClaw, Hermes, Karpathy's LLM wiki,
  and Obsidian each solve it differently - and which approach survives when the
  tooling landscape shifts.
image: null
format: hybrid
best_for: Builders and product leads comparing durable memory approaches for agents
---
**TL;DR**

- Every AI session starts from scratch.
- Four tools are racing to solve the AI memory problem - OpenClaw, Hermes, Karpathy's LLM wiki, and a plain Obsidian vault.
- Here's how they differ and which approach actually survives tool churn.



# The AI Memory Problem - OpenClaw, Hermes, Karpathy, and the Approach That Actually Survives

I spend a significant portion of my working life inside AI tools. Not using them occasionally - building with them, managing projects through them, running coding sessions through them, thinking through strategic problems with them. So when I say the biggest unsolved problem in practical AI isn't model quality, I mean it as someone who has tested that claim at volume.

The real problem is memory. Specifically, the absence of it.

Every session with every AI assistant starts from scratch. You re-explain your context. You re-establish the project. You re-upload the document you uploaded last week. The model is brilliant and stateless in equal measure - a genius with amnesia who forgets you the moment you close the tab.

This is the problem the AI tools market has been quietly racing to solve for the last two years. In 2026, that race has produced at least four meaningfully different answers. I've been living inside one of them. The others I've evaluated closely enough to have a considered view on each.

Here is what they are, how they differ, why Karpathy's wiki pattern went viral for reasons that don't fully justify the hype, and - most importantly - which approaches are likely to still matter when the tooling landscape looks completely different eighteen months from now.

## What is the AI memory problem?

The **AI memory problem** is that every assistant session starts **stateless**: you re-establish context, knowledge, and operational handoffs unless you build **external, tool-agnostic memory** the runtime loads on purpose.

**Who it is for:** builders evaluating OpenClaw, Hermes, Karpathy's LLM wiki, or plain Obsidian—and anyone tired of re-uploading the same docs every week.

**What you will learn:** three distinct memory failures (contextual, knowledge, operational), how four 2026 approaches map to them, and why **portable markdown** outlasts agent-native memory when tools churn.

---

## The Problem Is Not What Most People Think It Is

When people say "AI has no memory," they usually mean the model doesn't remember them personally. That's one dimension of the problem. But in practice, there are actually three distinct memory failures happening in every AI-assisted workflow:

**Contextual memory** - the model doesn't know who you are, what you're working on, or what decisions you've already made. Every session is a cold start.

**Knowledge memory** - the model doesn't know what you know. Your accumulated research, your hard-won synthesis of a topic, your compiled understanding of a domain - none of that persists between sessions.

**Operational memory** - the model doesn't know what it just did. Session handoffs are broken. The AI that helped you design an architecture on Monday has no idea what it built with you on Tuesday.

These three failures require three different solutions. The confusion in most coverage of "AI memory tools" is that people conflate them - treating a solution to one as if it addresses all three.

OpenClaw primarily solves contextual and operational memory. Karpathy's LLM Wiki primarily solves knowledge memory. Hermes tries to solve all three at the infrastructure layer. My own setup, built around Obsidian, separates them deliberately and solves each with different mechanisms.

---

## OpenClaw: The Agent-as-Operating-System Approach

OpenClaw - built by Peter Steinberger and released as open-source - arrived in late 2025 and immediately captured the imagination of a large slice of the developer community. Within weeks it had hundreds of thousands of GitHub stars, TechCrunch coverage, and a community that described it in terms usually reserved for genuinely transformative technology. Karpathy himself - who we will get to shortly - publicly endorsed it.

The reason for the reaction is easy to understand once you use it. OpenClaw lives on your machine. It connects to whatever chat app you already use - WhatsApp, Telegram, Discord, iMessage, Signal. It has persistent memory of everything you tell it. It can read and write files, run shell commands, browse the web, and autonomously build its own skills. It does not forget between sessions. You message it like a coworker, and it works like one: remembering previous conversations, learning your preferences, extending its own capabilities over time.

The architecture that makes this work is a combination of a persistent memory layer (stored on your machine, not on a third-party server), a skill system that the agent can modify itself, and a heartbeat mechanism that lets it work proactively in the background on scheduled tasks. It is genuinely impressive, and the "agent-as-OS" framing that the community landed on is accurate. This is not a chatbot. It is ambient infrastructure.

What OpenClaw solves well is contextual and operational memory. It knows who you are because you told it, and it stored that locally. It knows what you were working on because previous sessions persist. It can autonomously continue work you started yesterday and send you a progress update.

What it does not natively solve is the deeper knowledge memory problem. OpenClaw's memory is conversational - it remembers things you told it in chat. It is not a knowledge compilation engine. If you want it to develop a structured, cross-referenced understanding of a domain you've been researching for six months, you have to build that structure yourself. The agent is the delivery mechanism; the knowledge architecture is still your problem.

This is a real constraint. It is also not a criticism - it is a correct scoping of what the tool is for.

---

## Hermes: The Autonomous Server Agent

Hermes, from Nous Research, is solving a related but distinct version of the problem. Where OpenClaw lives on your personal machine and connects to your chat apps, Hermes lives on a server you control and is explicitly designed as an autonomous, long-running agent infrastructure.

The capabilities overlap significantly: persistent memory, skill-based extensibility, multi-platform chat integration, scheduled automations, background task execution. What Hermes adds is a harder focus on isolation and autonomy - subagents with their own conversations and execution environments, real sandboxing across multiple backends, and a design philosophy that treats the agent as infrastructure rather than a personal assistant.

The practical difference is one of deployment posture. OpenClaw is personal and approachable - you install it on your laptop, name it, and start talking to it. Hermes is more appropriate for someone who thinks in terms of server architecture, wants to run multiple isolated agent instances, and is comfortable treating their AI setup as a managed service they operate themselves.

For business applications where you want agent autonomy but need the auditability and isolation that comes with a server-deployed architecture, Hermes is the more serious option. For someone who wants to replace their scattered AI chat sessions with a persistent personal assistant they can access from their phone, OpenClaw is the more immediately usable choice.

Neither is the superior option in absolute terms. They solve the same problem at different points on the self-hosted complexity spectrum.

---

## The OpenHuman Paradigm: Your Digital Twin

The OpenHuman model - which TinyHumans and similar projects are exploring - represents a third philosophical approach. Rather than building a persistent agent with memory, the OpenHuman paradigm proposes something more radical: a structured digital representation of you that any AI can read.

The intuition behind it is sound. The memory problem exists because AI has no persistent model of who you are. The solution is not to give every AI agent its own memory - it is to create a canonical, portable representation of your identity, context, preferences, and knowledge that travels with you across any tool, any session, any model. Your digital twin is the context file. The AI is just the reader.

This is architecturally elegant because it is tool-agnostic by design. Your digital twin doesn't care whether you are using Claude, GPT-5, or a local model running on your machine. It doesn't care whether your agent interface is OpenClaw or Hermes or VS Code Copilot. The context is portable because it is just structured data - usually plain text or markdown.

The limitation is that this approach requires discipline to maintain. A digital twin that goes stale is worse than no digital twin, because it misleads the AI with outdated context. The maintenance burden is real.

---

## Additional detail

### Karpathy's LLM Wiki: The Knowledge Compilation Pattern

In April 2026, Andrej Karpathy published a GitHub gist that collected thousands of stars in its first week. The idea: stop using RAG as your default pattern for giving AI access to documents, and instead have the AI maintain a structured, cross-referenced wiki for you.

The three-layer architecture is clean. Raw source documents live in a `raw/` directory and are never modified. An AI agent compiles them into a `wiki/` directory - structured markdown articles with cross-references and backlinks. A schema file (`CLAUDE.md` in Karpathy's version) defines the editorial conventions the AI follows. Three operations maintain the system: ingest (compile a new source into the wiki), query (read the compiled layer instead of re-searching the raw sources), and lint (periodic health check for consistency and broken links).

The reason it went viral is that it addresses something real. Standard RAG pipelines rediscover knowledge from scratch on every query. They miss context. They reconstruct synthesis that you already paid to generate once. The LLM Wiki pattern says: pay the synthesis cost once, store the result, read the compiled output forever. For a personal research knowledge base under about 100,000 tokens, the economics are compelling.

I want to be careful here, though, because the coverage of this pattern has substantially overstated its scope.

Karpathy explicitly scoped it to individual researchers with focused knowledge bases. The pattern breaks down at scale - above 100,000 tokens you are effectively reinventing RAG. It has no multi-user story. It is vulnerable to epistemic drift, where AI-generated errors compound over time through the wiki. And the "this replaces RAG" framing that attached itself to the pattern in secondary coverage is inaccurate. It replaces RAG for a narrow, specific use case. For large corpora, dynamic data, or anything requiring real-time information, RAG remains the correct architecture.

My honest read is that the viral moment was proportionate to the elegance of the pattern, but slightly out of proportion to the scope of the problem it solves. It is a useful insight about knowledge compilation. It is not the unified theory of AI memory that some of the coverage implied.

---

### What I Actually Built (And Why It Works Differently)

Having spent the better part of a year building my own AI workflow infrastructure, I arrived at something that borrows from all of these patterns without being identical to any of them.

The foundation is Obsidian - a plain-markdown knowledge management system - structured around three principles: Zettelkasten (atomic, concept-oriented notes whose value is in the links between them), evergreen notes (notes that evolve over time rather than being archived), and a knowledge graph where the network of connections is the actual memory system.

On top of that structure sits a layered architecture that maps to the three memory problems I outlined at the start.

For contextual memory, there is a `00_Brain/` vault - a universal AI brain with canonical context files about who I am, how I work, what my active projects are, and what rules every AI assistant should follow. Every session with every AI tool bootstraps from these files. The AI doesn't need to remember me because the context is loaded fresh from a known location at the start of every session. This is the OpenHuman insight, implemented in plain markdown.

For knowledge memory, the vault uses a hub-and-spoke structure. Every major project or knowledge domain has an evergreen note - a compiled, current-truth document - that an AI agent reads instead of re-reading the raw source conversations or session logs. The `Nathan Master Health Profile`, for example, is a compiled synthesis of every medical consultation and health research session I have ever had, structured for fast AI consumption. This is Karpathy's insight, but applied narrowly to the domains where it actually matters, without the overhead of maintaining a full `raw/wiki/schema` directory structure for content that doesn't benefit from it.

For operational memory, each project has a session management layer - dated session notes, an AI session bridge, session summaries, and open loops. An AI agent at the end of every session updates the evergreen notes with durable knowledge and writes a summary to the handoff file. The next session starts by reading those files, not by re-reading the chat history.

The MCP server - a small Node.js script that exposes read, write, and append operations on the vault - means any AI tool can interact with this structure directly. VS Code Copilot uses it. Hermes uses it. A future tool I haven't installed yet will use it, because the API is just file I/O against plain markdown.

---

### Why Tool-Agnosticism Is the Only Criterion That Matters

Here is the part most coverage of AI memory tools skips entirely.

The AI tooling landscape in 2026 looks nothing like it looked in 2024. It will look nothing like this in 2028. Models improve, get deprecated, get acquired. Agent frameworks come and go. The tool that is best today will not necessarily be available next year. The company behind OpenClaw's creator has joined OpenAI. Hermes is maintained by Nous Research, which is itself navigating a competitive research environment. These are excellent projects, but institutional continuity in this space is not guaranteed.

The only AI memory system that survives tool churn is one whose knowledge layer is independent of any specific tool.

This is where the plain-markdown, local-file approach has a structural advantage that gets consistently underrated in coverage that focuses on features. My vault is 100% portable. Every file in it will open in any text editor that exists today or will exist in the future. The MCP server is twenty lines of code. The conventions are documented in human-readable markdown. If every AI tool I use today disappears tomorrow, my accumulated knowledge, context, and operational history survives. I plug it into whatever comes next.

Compare this to a memory system that is native to a specific agent platform. If that platform changes its memory schema, breaks an update, or simply shuts down, you lose the accumulated context you paid to build. The more sophisticated the platform's proprietary memory system, the higher the migration cost when the inevitable change happens.

I am not arguing against OpenClaw or Hermes. I use both. What I am arguing is that your knowledge layer - the compiled understanding you have accumulated - should not be coupled to any specific agent runtime.

---

### Additional detail

### The Business Applications Are More Immediate Than They Appear

Most coverage of these tools focuses on personal productivity use cases: the calendar manager, the inbox cleaner, the morning briefing bot. These are real and useful. But the business applications are substantially more valuable and somewhat underexplored.

**In software development**, the operational memory problem is acute. Developer context - architecture decisions, why a certain approach was rejected, what a piece of legacy code actually does - lives in people's heads and gets lost when people leave or switch teams. An AI memory system that maintains a living architecture wiki and session handoff layer can effectively preserve institutional knowledge at a fraction of the cost of traditional documentation processes. Every session produces an updated evergreen note. The team's accumulated context compounds rather than decays.

**In client services and consulting**, the context problem is the thing clients most frequently notice and most frequently complain about. Every new conversation requires re-explaining the engagement. An AI assistant with a properly structured client context file - goals, history, decisions, constraints - eliminates that friction entirely. The AI knows the client before the conversation starts.

**In personal health, finance, and life management**, the knowledge compilation pattern - Karpathy's contribution - is genuinely valuable. Medical history, financial decisions, insurance policies, property details: these are exactly the kind of dense, structured, infrequently-updated knowledge bases that benefit from being compiled once and read forever. The investment in building them correctly pays off across every subsequent AI session that touches that domain.

---

### My Take

The AI memory problem is real, and in 2026 we have better tools for addressing it than we did twelve months ago. But I would push back on the framing that any single tool or pattern has solved it.

OpenClaw solved the personal assistant layer - ambient, persistent, proactive, multi-channel. It is genuinely excellent at what it does, and the community response it generated was proportionate to its quality. Hermes is the serious infrastructure play for those who want the same capabilities at the server level with proper isolation. The Karpathy LLM Wiki is a useful pattern for knowledge-dense research domains where compilation economics make sense. OpenHuman is articulating something important about portability that the agent-native memory systems haven't fully answered yet.

What I have found - through building a system that has now survived twelve months and eight AI tool changes - is that the right answer is architectural, not product-based. Separate your memory layers. Use an agent platform for session delivery and task execution. Use a portable, plain-text knowledge system for your compiled understanding and personal context. Wire them together with a simple, replaceable integration layer. When one tool in the stack changes, you replace that layer without losing the knowledge.

The specific tools you pick matter less than the principle. Context travels with you, compiled once, readable by anything.

That is the version that survives what comes next.

### Reference

### Quick reference: four approaches vs three memory failures

| Approach | Best at | Weak at | Portability |
|----------|---------|---------|-------------|
| **OpenClaw** | Contextual + operational (persistent agent on your machine) | Structured knowledge compilation | Agent-bound; export is your job |
| **Hermes** | Server-deployed autonomous agent + isolation | Same knowledge-depth gap as personal agents | Infrastructure-coupled |
| **OpenHuman / digital twin** | Portable context file any model reads | Stale twin misleads worse than none | High if you maintain it |
| **Karpathy LLM wiki** | Knowledge compilation (&lt;~100K tokens) | Scale, multi-user, real-time data | Files in `raw/` + `wiki/` |
| **Obsidian + MCP (example stack)** | All three via layered files | Discipline to write session end | Plain markdown survives tool churn |

| Memory failure | Symptom | Example fix layer |
|----------------|---------|-------------------|
| Contextual | Cold start every chat | `00_Brain/` bootstrap files |
| Knowledge | Research not compounded | Evergreen / compiled notes |
| Operational | Broken handoffs | Session summaries + open loops |

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|--------------|-----|
| Treating one tool as "solved memory" | Three failures need three mechanisms | Map contextual / knowledge / operational separately |
| Coupling compiled knowledge to one agent platform | Schema changes = migration tax | Plain markdown + simple MCP/file I/O |
| Karpathy wiki above ~100K tokens without RAG | Reinventing retrieval badly | Scope wiki to compilation economics; RAG for corpora |
| OpenClaw/Hermes as knowledge base | Conversational memory ≠ domain synthesis | Build evergreen notes yourself |
| Digital twin without update habit | Outdated context misleads | Session-end promotion rule into canonical files |
| Skipping operational memory | Monday amnesia on "what we decided" | Dated session notes + Bridge file |

## FAQ

### Is OpenClaw "better" than Obsidian for memory?

**Different layer.** OpenClaw excels at **ambient agent delivery**; Obsidian (or any markdown vault) excels at **portable compiled knowledge**. Many builders use both with a thin integration.

### Does Karpathy's wiki replace RAG?

**Only narrowly**—personal research bases under ~100K tokens where you pay synthesis once. Large or dynamic corpora still need RAG.

### What is operational memory in practice?

**Session handoffs:** what shipped, open loops, deploy state—written to files the **next** session reads instead of re-parsing chat.

### Why tool-agnostic files?

Agent platforms churn; **markdown on disk** does not. Your knowledge layer should survive IDE and vendor changes ([External Memory series](/posts/external-memory-series-guide)).

### Where do I start without installing OpenClaw?

**Three files:** Bridge (priority), session summary line, one evergreen note for your active project—then add MCP or native Read when ready.

---

### Follow-on: External Memory Series

Start at the **[series hub](/posts/external-memory-series-guide)** (overview + reading order), then:

1. [Three Layers of External Memory for AI-First Development](/posts/three-layer-external-brain-for-ai-first-development) — hooks, handoffs, Feature notes  
2. [Beyond Chat History: Layered Obsidian for Personal Productivity](/posts/obsidian-memory-layers-personal-productivity-beyond-chat)  
3. [Why File Memory Beats the Three-Layer AI Diagram](/posts/why-file-memory-beats-the-three-layer-diagram-for-builders)  
4. [Why Deliberate File Memory Beats Hoping Agents Remember](/posts/why-deliberate-file-memory-beats-hoping-agents-remember)

Related on this site: [Your Brain Was Not Built for This](/posts/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian) · [What I Learned Directing AI as My Primary Engineer](/posts/what-i-learned-directing-ai-as-my-primary-engineer) · [Publishing Obsidian Drafts Through GitHub Actions](/posts/publishing-obsidian-drafts-through-github-actions).

---

### Sources and Further Reading

1. [OpenClaw - official site and documentation](https://openclaw.ai/)
2. [Hermes Agent - Nous Research](https://hermes-agent.nousresearch.com/)
3. [Karpathy's LLM Wiki gist - GitHub](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
4. [LLM Wiki: Karpathy's 3-Layer Pattern - Decode the Future](https://decodethefuture.org/en/llm-wiki-karpathy-pattern/)
5. [OpenClaw creator Peter Steinberger joins OpenAI - TechCrunch](https://techcrunch.com/2026/02/15/openclaw-creator-peter-steinberger-joins-openai/)
6. [The OpenClaw superfan meetup - The Verge](https://www.theverge.com/ai-artificial-intelligence/890517/openclaw-clawcon-meetup-nyc-open-source-ai)
7. [Andy Matuschak - Evergreen Notes](https://notes.andymatuschak.org/Evergreen_notes)
8. [Obsidian - plain-text knowledge management](https://obsidian.md/)

---

*Nathan Petralia is a digital transformation and AI strategy practitioner based in Hong Kong. He writes about building practical AI systems, software delivery, and the intersection of technology and leadership.*
