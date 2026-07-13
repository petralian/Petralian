# SocialBee workflow — Petralian

## Setup (one-time)

1. SocialBee → **Connect** → **LinkedIn** (primary)
2. Optional: X/Twitter for cross-post
3. Create categories:
   - **New post** — auto when you publish
   - **Pillar repost** — evergreen series
   - **Quote card** — pull one insight + link

## Backfill queue (10 posts — schedule 1/day)

| # | Post | URL |
|---|------|-----|
| 1 | Knowledge Work Engine hub | `/posts/knowledge-work-agent-engine-guide-2026` |
| 2 | External memory series | `/posts/external-memory-series-guide` |
| 3 | Your Brain Was Not Built for This | `/posts/your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian` |
| 4 | Why I rebuilt on Next.js | `/posts/why-i-rebuilt-petralian-on-nextjs` |
| 5 | Training an AI like managing an employee | `/posts/training-an-ai-is-like-managing-an-employee` |
| 6 | Cursor harness memory loop | `/posts/cursor-harness-memory-loop-2026` |
| 7 | AI program may fail before it starts | `/posts/why-your-ai-program-may-fail-before-it-starts` |
| 8 | Gravio scoring engine | `/posts/how-gravio-scoring-engine-was-built` |
| 9 | LLMs reshaping SEO | `/posts/the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo` |
| 10 | Publishing Obsidian drafts | `/posts/publishing-obsidian-drafts-through-github-actions` |

## Post template (LinkedIn)

```
[One-line hook from seo_description or first H2]

[2 sentences from excerpt]

Read: https://petralian.com/posts/{slug}

#EnterpriseAI #AIStrategy #BuildingInPublic
```

## Publish workflow

1. Ship post to `content/posts/` → push `master`
2. SocialBee → New post category → paste template
3. Schedule +24h after publish (let GSC crawl first)

## Do not

- Auto-cross-post every post without review
- Duplicate Brevo newsletter content verbatim — SocialBee is discovery, Brevo is owned audience
