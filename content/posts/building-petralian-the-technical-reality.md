---
title: 'Building petralian.com: The Technical Reality'
slug: building-petralian-the-technical-reality
date: 2026-05-23 00:00:00+00:00
tags:
- Developer Tools
- Obsidian
- Agentic AI
- SEO
- GEO
excerpt: The why was clean. The how had corners. A ground-level account of building
  petralian.com — the masonry layout that fought back, a 404 page with a working Asteroids
  game, the TinaCMS newline problem nobody warns you about, and how AI wrote most
  of it.
featured_image: /images/posts/building-petralian-the-technical-reality.png
featured_image_alt: Wireframe grid of a website being built, with code and markdown
  files in the background
seo_title: 'Building petralian.com: What Actually Happened'
seo_description: The technical account of building petralian.com on Next.js 16, Tailwind
  v4, and TinaCMS — masonry reading order, the Asteroids 404, and using AI as primary
  engineer.
focus_keyword: building petralian nextjs technical decisions
image_prompt: A developer's workspace with multiple monitors showing code and a website
  preview; clean, minimal aesthetic with dark background and orange accent tones;
  Next.js site scaffold visible on one screen, Obsidian vault on another; abstract
  sense of building and architecture
format: hands-on
best_for: Builders curious how this site is wired — Obsidian, sync, and Next.js in
  practice
---
**TL;DR**

- A ground-level account of building petralian.
- com — the masonry layout that fought back, a 404 page with a working Asteroids game, the TinaCMS newline problem nobody warns you about, and how AI wrote most of it.


> **External Memory Series** — File-based memory for AI-assisted work ([overview](/posts/external-memory-series-guide) · [1 Implementation](/posts/three-layer-external-brain-for-ai-first-development) · [2 Productivity](/posts/obsidian-memory-layers-personal-productivity-beyond-chat) · [3 vs the diagram](/posts/why-file-memory-beats-the-three-layer-diagram-for-builders) · [4 Governance](/posts/why-deliberate-file-memory-beats-hoping-agents-remember))
The [previous article](/posts/why-i-rebuilt-petralian-on-nextjs) covers why I moved off WordPress. The short version: writing in [Obsidian](https://obsidian.md/) and publishing through WordPress were two separate workflows with too much manual friction in between. This article is about what happened when I fixed that — specifically, the build itself.
This is not a tutorial. I'm not going to walk through project setup. I'm going to tell you what caught me out, what I'd tell someone starting from scratch, and which decisions I'd make the same way again.

---



## What is building Petralian technically?

**Building Petralian** is the practical story of shipping a content site and publishing pipeline—Obsidian drafts, Next.js front end, automation, and the trade-offs behind what looks simple in the browser.

**Who it is for:** indie builders, technical bloggers, and developers evaluating similar stacks.

**What you will learn:** real architecture choices; what was harder than expected; and lessons for solo technical publishing.

---

## AI Wrote Most of This

Worth saying upfront: I directed this build, I didn't write the code manually. GitHub Copilot was the primary engineer. I was the product owner — making architecture decisions, reviewing output, and catching drift before it compounded.

That shifted what the work actually was. My job wasn't implementation. It was context management. Knowing what to ask for, knowing when the output was technically correct but architecturally wrong, and keeping the overall system coherent across sessions that don't share memory.

The short version of what I learned: keep a running architecture note. Structured context at the start of each session matters more than which model you use. Without it, you fix the same category of problem repeatedly.

---

## The Stack

[Next.js 16](https://nextjs.org/) with the App Router. TypeScript throughout. [Tailwind CSS v4](https://tailwindcss.com/). Deployed on [Vercel](https://vercel.com/). Posts are Markdown files in `content/posts/`.

I didn't pick these out of preference for their own sake. App Router because server components by default means less client JavaScript shipped to the browser. Tailwind v4 because the CSS-first config model keeps design tokens in one place rather than a separate config file. Vercel because I wanted zero infrastructure overhead — every push to `master` deploys in about thirty seconds, with edge caching and image optimisation included.

One thing worth flagging for anyone starting with Tailwind v4: it no longer uses `tailwind.config.js`. Your entire design system lives in `@theme {}` inside your main CSS file. If you're coming from v3, this takes a few minutes to recalibrate. Once it clicks, it's cleaner — everything is in one place, and the token names map directly to the CSS custom properties you use everywhere else.

---

## TinaCMS — And the Newline Problem Nobody Warned Me About

I added [Tina CMS](https://tina.io/) for situations where I'm not at my development machine, and for the eventual scenario of handing content management to someone without Git access. The setup is straightforward. It sits on top of the existing Markdown files, provides a visual editing interface, and commits directly to the repo — no separate database, no parallel content store.

The problem I hit took longer to diagnose than it should have.

When you use a multi-line textarea in a Tina CMS JSON field and save it, Tina stores the literal characters `\n` and `\n\n` in the JSON file — not actual newline characters. JSX whitespace rules collapse these into nothing when you render them. Your carefully formatted paragraphs come out as a single unbroken block of text.

The fix is a split pattern you apply before rendering anywhere Tina content appears:

```tsx
{field.split("\n\n").map((block, i) => (
  <p key={i}>
    {block.split("\n").map((line, k, arr) => (
      <span key={k}>{line}{k < arr.length - 1 && <br />}</span>
    ))}
  </p>
))}
```

Split on double-newline to get paragraphs. Then split each paragraph on single-newline for line breaks within a block. It's not complicated once you know it's the issue. Finding the issue took longer. I applied this pattern to three pages before I was done — the homepage, the about page, and the writing index.

---

## The Masonry Layout That Wouldn't Read Left to Right

The post grids use a masonry layout — variable-height cards in columns. The first implementation used CSS `column-count: 3`. One line of CSS, looks correct at a glance. The problem is in how `column-count` fills the DOM.

`column-count` fills columns **top-to-bottom**. Post 1 goes to the top of column one. Post 2 goes below it. Post 3 goes below that. Post 4 starts at the top of column two. For a grid of recent articles where recency matters, this means your first post is top-left, your fourth post is top-centre, and your seventh post is top-right. Completely wrong reading order.

[Jesse Korzan wrote about this problem on HackerNoon](https://hackernoon.com/masonry-layout-technique-react-demo-of-100-css-control-of-the-view-e4190fa4296) — the solution he proposes (with a [working React demo on GitHub](https://github.com/jessekorzan/masonry-css-js)) is to reorder the array before rendering so the visual output *appears* left-to-right even though the DOM order matches `column-count`'s top-to-bottom fill. It works. It's also fragile when card heights vary significantly, because CSS column fill is based on height rather than item count.

I tried that approach first. Then switched to something more reliable: split the posts array into N column arrays before render, and give each column its own flex-column div.

```tsx
function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
  const cols: T[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, i) => cols[i % numCols].push(item));
  return cols;
}
```

Post 0 goes to column 0, post 1 to column 1, post 2 to column 2, post 3 back to column 0. Each column is a `display: flex; flex-direction: column` div. Left-to-right reading order is guaranteed regardless of card height, because the column assignment is made in code before anything is rendered.

The blog index is a client component (it has search and tag filters), so it also tracks the responsive column count via `matchMedia` and regenerates the column arrays at each breakpoint. Desktop gets three columns, tablet two, mobile one.

---

## Additional detail

### The 404 Page with a Working Asteroids Game

I wanted the 404 page to be something other than an apology. A canvas-based Asteroids game running in the background with a "Lost in Space" overlay felt right — low stakes, slightly absurd, and relevant enough to not feel forced.

The game runs on an [HTML Canvas element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) inside a React component, with `useEffect` managing the game loop. Ship movement, rotation, thrust, asteroid splitting on hit, score counter. Getting the rotation and thrust to feel right is more fiddly than you'd expect — canvas physics require manual delta-time handling to keep movement frame-rate independent.

The more interesting engineering problem was the high score leaderboard. The game loop runs inside a `useEffect` closure, which means React state isn't directly accessible from the loop without running into stale closure issues. The solution was a ref pair:

- `uiPhaseRef` — a mirror of the current UI phase (idle / playing / entering-name / showing-scores), so the keydown handler can always read the actual current state without closures capturing old values
- `onGameOverRef` — a ref to the game-over callback, so the game loop can trigger React state changes exactly once without needing state in scope

A `gameOverFired` boolean inside the game state prevents the callback from firing twice if the loop runs a few more frames before stopping.

Scores persist in `localStorage`. Top ten entries, each stored as `{name, score}`. When a player beats a score on the board, they get a name input before the leaderboard appears. No external game library — the [MDN Canvas API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) is genuinely all you need for something at this complexity level.

---

### The Obsidian Publish Workflow

The sync script (`scripts/sync-obsidian.ps1`) is the part of this build I'm most satisfied with.

It reads a draft from the Obsidian vault, strips metadata that only belongs in my personal notes, applies a set of string transformations, writes the result into `content/posts/`, and commits to the repo. A `-DryRun` flag shows you what would change without writing anything.

Every article has a `status` field in its YAML frontmatter. The `getAllPosts()` function that feeds the site filters for `status: published`. Until I set that field and run the sync, the article doesn't exist on the site — it's invisible to the build. That single gate replaces the WordPress workflow of remembering to flip "Draft" to "Published" in a CMS panel, separate from where you were actually writing.

The gap between "done in Obsidian" and "live on the internet" is now two commands and a push.

---

### What I'd Do Differently

**Lock the TinaCMS content schema before you start writing content.** I changed the schema mid-build and had to migrate JSON files manually. It's not catastrophic but it's completely avoidable if you think it through upfront.

**Name your SEO fields consistently from day one.** TinaCMS defines fields in `tina/config.ts`, and your code reads them in `src/lib/posts.ts`. If those don't agree on a field name — say, TinaCMS has `meta_description` and your code reads `seo_description` — the field silently returns empty strings on every post. It won't throw an error. The metadata just won't render. Name the field once, in one place, and document it somewhere a future agent can find it.

**Write the sync script first.** I copied Markdown files manually for a while before the sync script existed. That was friction I created for myself that the script later eliminated. Have an agent scaffold the script early, not as an afterthought.

**Don't start with CSS `column-count` for a masonry grid that needs left-to-right reading order.** It's one line and looks right. It's wrong by default. Knowing that going in would have saved me time.

---

### Additional detail

### If You're Building Something Similar

The [repository is open source on GitHub](https://github.com/nathanpetralian/petralian). The sync script, the Tina schema, the `splitIntoColumns` helper, the Asteroids game, the design system — all there to fork.

The things most worth taking: the Obsidian frontmatter convention and sync approach, the split-column masonry pattern, and the ref-pair technique for bridging a canvas game loop with React state.

The things most worth skipping on your own build: CSS `column-count` for grids where reading order matters, and Tina textarea fields without the split-render pattern.

The architecture is simpler than WordPress at the cost of needing to understand static site generation. For a personal site where writing is the point and operating infrastructure is not, that's a trade worth making every time.

---

### Common mistakes (indie publishing stacks)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Over-engineering CMS early | Months before first post | Ship markdown + git first |
| No image pipeline | Slow LCP and manual toil | Automate resize and alt text workflow |
| Syncing Obsidian manually | Publish friction kills cadence | Automate via GitHub Actions |
| Skipping analytics and search console | Flying blind on discovery | Wire minimal analytics day one |
| Perfect design before content | Empty beautiful site | Publish ugly, iterate publicly |

---

## FAQ

### What stack powers Petralian?

Next.js front end, Obsidian-authored markdown, git-based publishing, and supporting automation scripts.

### What was the hardest unexpected problem?

Usually glue work—images, draft workflow, and performance—not the framework itself.

### Should I copy this stack exactly?

Copy the **workflow principles**; adapt tools to your OS and hosting constraints.

### How do solo builders save time?

Automate draft → preview → deploy; keep one source of truth in markdown.

### When is a headless CMS worth it?

When non-technical editors need WYSIWYG at volume—you may not need it on day one.
*If you're new to Cursor: [50% off your first month](https://cursor.com/referral?code=JP5ARNKSFI2Q) (code `JP5ARNKSFI2Q`). I may earn usage credits; install directly if you prefer.*
