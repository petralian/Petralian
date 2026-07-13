---
title: >-
  CSS Masonry Grids and Reading Order: What column-count Gets Wrong, and How to
  Fix It
slug: css-masonry-reading-order-column-count-fix
date: 2026-05-23T00:00:00.000Z
status: published
category: AI & Building
tags:
  - Developer Tools
  - SEO
excerpt: >-
  CSS column-count creates a masonry layout in one line. It also silently breaks
  left-to-right reading order. Here is what is actually happening in the DOM,
  and a reliable fix that holds up under variable card heights.
featured_image: /images/posts/css-masonry-reading-order-column-count-fix.png
featured_image_alt: >-
  Diagram-style hero image showing CSS masonry cards rendered in top-to-bottom
  column order versus expected left-to-right reading order
focus_keyword: css masonry reading order fix
seo_title: CSS Masonry Reading Order Fix for column-count Grids
seo_description: >-
  CSS column-count fills top-to-bottom, silently breaking masonry grid reading
  order. Learn the reliable split-column fix with full React/Next.js code and
  responsive breakpoints.
image_prompt: >-
  Create a 16:9 hero image for a technical article about CSS masonry reading
  order bugs. Show a clean desktop workspace with a widescreen monitor
  displaying a three-column blog card layout. Overlay subtle numbered markers
  1-9 where column one stacks 1,4,7 and arrows illustrate why this breaks
  left-to-right reading order. Add a faint side-by-side contrast hint: left
  panel labeled 'column-count flow', right panel labeled 'split columns fix'.
  Use a modern engineering aesthetic, high clarity, neutral tones with orange
  annotation accents, no brand logos, no text-heavy UI, no watermarks.
format: hands-on
best_for: Front-end developers fixing masonry layout and screen-reader reading order
---
**TL;DR**

- CSS column-count creates a masonry layout in one line.
- It also silently breaks left-to-right reading order.
- Here is what is actually happening in the DOM, and a reliable fix that holds up under variable card heights.


> **External Memory Series** — File-based memory for AI-assisted work ([overview](/posts/external-memory-series-guide) · [1 Implementation](/posts/three-layer-external-brain-for-ai-first-development) · [2 Productivity](/posts/obsidian-memory-layers-personal-productivity-beyond-chat) · [3 vs the diagram](/posts/why-file-memory-beats-the-three-layer-diagram-for-builders) · [4 Governance](/posts/why-deliberate-file-memory-beats-hoping-agents-remember))
You build a masonry grid. Three columns, `column-count: 3` in your CSS — looks exactly right in the browser preview. Then you check which article is sitting top-center. It is your fourth-most-recent post. Your second and third are buried lower in column one. The grid looks fine. The reading order is completely wrong.

This is not a styling bug. It is a DOM behavior that `column-count` produces by design, and if you do not know it is there, you can ship a broken grid without ever realizing it. I ran into it while building the article grid on petralian.com — [the full rebuild story is here](/posts/why-i-rebuilt-petralian-on-nextjs) — and it took longer than it should have to understand why.

What follows is an explanation of what is happening, two approaches to fix it, and the one that actually holds up under real content.

---


## What is the CSS column-count reading order bug?

The **CSS column-count reading order bug** happens when multi-column layouts fill **top-to-bottom per column** instead of left-to-right across rows—breaking expected masonry reading order for blog cards and galleries.

**Who it is for:** front-end developers building masonry grids in CSS or React/Next.js.

**What you will learn:** why `column-count` silently reorders content; DOM flow vs visual expectation; and the split-column fix with responsive breakpoints.

---

## Responsive follow-up

The first version of this fix focused on reading order. This follow-up keeps the same content order logic, but makes the layout responsive by sharing one masonry component that steps through 1 column on mobile, 2 on tablet, and 3 on desktop.

That matters because the column count is now part of the behavior, not an afterthought. The layout stays readable on narrow screens without losing the left-to-right reading order that made the original fix useful.

## How CSS column-count Actually Fills the DOM

`column-count` is a multi-column layout property. Give it a number and the browser divides its container into that many equal-width columns, then fills them. The question is how it fills them.

The browser fills `column-count` columns **top-to-bottom, left-to-right**. It populates column one entirely before moving to column two. In a three-column grid with nine items, the visual layout maps to DOM order like this:

```
Visual position:     DOM item:
Top-left             Item 1
Mid-left             Item 2
Bottom-left          Item 3
Top-center           Item 4
Mid-center           Item 5
Bottom-center        Item 6
Top-right            Item 7
Mid-right            Item 8
Bottom-right         Item 9
```

Scan left-to-right across the top row and you get: Item 1, Item 4, Item 7. That is not sequential. For a grid of articles ordered by recency, your newest post sits correctly at top-left, but your fourth-newest is at top-center — positioned as if it belongs between your second and third.

For a photo gallery where sequence does not matter, this may be invisible. For a blog, a news feed, or anything where recency or priority drives the order, it is a real problem — and it is invisible until you look for it.

---

## The Reorder Array Approach

The most commonly cited solution is to pre-sort the items before passing them to the DOM so that `column-count`'s top-down fill produces the correct visual left-to-right order.

Jesse Korzan [described this approach on HackerNoon](https://hackernoon.com/masonry-layout-technique-react-demo-of-100-css-control-of-the-view-e4190fa4296) with a [working React demo on GitHub](https://github.com/jessekorzan/masonry-css-js). The idea: instead of passing items in natural order [1, 2, 3, 4, 5, 6, 7, 8, 9], you calculate the target position for each item and reorder the array so that `column-count`'s top-down fill produces the sequence you want. For three columns and nine items of equal height, you pass: [1, 4, 7, 2, 5, 8, 3, 6, 9]. Column one fills with 1, 4, 7 — which reads correctly left-to-right across the first row.

It works. The problem is that `column-count` does not assign a fixed number of items to each column. It fills by height. When cards vary in height — and in a masonry layout, they usually do — the column break point shifts unpredictably as content reflows. A card that is 80px taller than average can push items across columns, and your carefully calculated array order falls out of alignment. You end up with a fragile dependency between your JavaScript sorting logic and the browser's height-based column fill algorithm, which you cannot fully control from code.

It is a clever approach. It also breaks in subtle ways as content changes, and the breakage is not obvious.

---

## A Better Fix: Split the Columns in Code

The more reliable approach is to stop using `column-count` entirely. Instead, split the items into column arrays in JavaScript before rendering. Each column becomes an explicit DOM element — its own flex-column div — with items already assigned.

Here is the function:

```tsx
function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
  if (numCols <= 1) return [items];
  const cols: T[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, i) => cols[i % numCols].push(item));
  return cols;
}
```

This distributes items round-robin across columns. Item 0 goes to column 0, item 1 to column 1, item 2 to column 2, item 3 back to column 0. With three columns and nine items, the result is:

```
Column 0: [Item 0, Item 3, Item 6]
Column 1: [Item 1, Item 4, Item 7]
Column 2: [Item 2, Item 5, Item 8]
```

Scanning left-to-right across the visual grid: 0, 1, 2, 3, 4, 5, 6, 7, 8. Correct order, guaranteed, regardless of card height. The column split is determined in code, not inferred from DOM heights, so nothing the browser does with rendering changes it.

The React markup is straightforward:

```tsx
<div className="masonry-grid">
  {splitIntoColumns(posts, 3).map((col, ci) => (
    <div key={ci} className="masonry-col">
      {col.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  ))}
</div>
```

Each column renders independently. Cards in a column can be any height, and the next card in that column simply stacks below. No browser height calculation is involved in determining reading order.

---

## Additional detail

### Making It Responsive

A static three-column split breaks on smaller screens. On tablet you probably want two columns, on mobile one. Because `splitIntoColumns` is a pure function, calling it with a different `numCols` value at each breakpoint is all you need.

In a React client component, `window.matchMedia` gives you the current breakpoint and notifies you when it changes. Combine that with `useState` and `useEffect`:

```tsx
const [cols, setCols] = useState(3);

useEffect(() => {
  const mq1 = window.matchMedia("(max-width: 640px)");
  const mq2 = window.matchMedia("(max-width: 1024px)");

  const update = () => {
    if (mq1.matches) setCols(1);
    else if (mq2.matches) setCols(2);
    else setCols(3);
  };

  update(); // run once to set initial value
  mq1.addEventListener("change", update);
  mq2.addEventListener("change", update);

  return () => {
    mq1.removeEventListener("change", update);
    mq2.removeEventListener("change", update);
  };
}, []);
```

Then wrap the column computation in a `useMemo` so it only recalculates when the posts list or the column count changes:

```tsx
const columns = useMemo(
  () => splitIntoColumns(posts, cols),
  [posts, cols]
);
```

When the viewport crosses a breakpoint, `cols` updates, `columns` recomputes, and the grid re-renders with the correct column count. Because this logic runs inside `useEffect`, it executes only in the browser — no `window` calls during server-side rendering, no hydration mismatch.

One note on the `useState(3)` initial value: on a mobile device, the component will briefly initialize with three columns before the effect runs and corrects to one. If that flash matters, initialize to `1` instead (safe for mobile-first SSR) or handle the initial column count with a CSS-only single-column fallback while the JS loads.

---

### The CSS

The CSS here is deliberately minimal. No `column-count`. No `column-gap`. A flex container with equally flexible children:

```css
.masonry-grid {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.masonry-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (max-width: 640px) {
  .masonry-grid {
    flex-direction: column;
  }
}
```

Two things worth calling out. `align-items: flex-start` on `.masonry-grid` is important. Without it, flex children default to `align-items: stretch`, which makes all columns the same height and kills the masonry effect. `flex-start` lets each column be exactly as tall as its content.

`min-width: 0` on `.masonry-col` prevents flex children from overflowing their container when a card contains long unbroken text — a URL, a code sample, a tag with no spaces. The default minimum size for a flex item is `auto`, which in practice means "as wide as my content." Setting `min-width: 0` overrides this and lets the column respect its flex-assigned width.

The media query at 640px stacks columns vertically for mobile. At that breakpoint, `splitIntoColumns` with `cols = 1` returns the full array as a single column, so the JavaScript and the CSS are consistent — you are not fighting one against the other.

---

### My Read

The `column-count` reading order bug is easy to miss because the layout looks correct. Cards render, columns fill, nothing appears broken. You only notice when you trace the reading order and find that items 4 through 6 are somewhere in the middle of the columns that should show items 2 and 3.

The reorder-array approach fixes the visual symptom but depends on the browser's height-based fill algorithm behaving predictably. For a layout with fixed-height items — a uniform card grid with no variable-length content — it works reliably. For a masonry grid with real content where excerpt length varies, it is unreliable under the surface.

The split-columns approach requires more code upfront: a utility function, a `useEffect` for responsive breakpoints, a `useMemo` for column computation. That is the full surface area. The reading order is determined in JavaScript before render, independent of browser height calculations, and it stays correct as content changes.

`column-count: 3` is one line. It also breaks reading order by default for any grid where sequence matters. Knowing that before you start saves the debugging session.

---

*This is one of several problems I documented in [building petralian.com on Next.js](/posts/building-petralian-the-technical-reality). The `splitIntoColumns` function and the full responsive implementation are in the `BlogFilters` component on the site's writing index.*

---

### Additional detail

### Common mistakes (CSS masonry)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Using column-count for semantic reading order | Screen readers and keyboard follow wrong sequence | Split items into explicit columns in DOM |
| Assuming flex/grid fixes masonry + order | Variable heights still need column strategy | Use calculated column split or masonry library |
| Ignoring mobile single-column fallback | Horizontal scroll or clipped cards | Collapse to one column under breakpoint |
| Equal-height cards to fake masonry | Cropped content or empty space | Accept variable height with proper column flow |
| No visual QA with 9+ items | Bug appears only at scale | Test numbered card sequence in devtools |

---

## FAQ

### Why does column-count break reading order?

CSS columns stack items vertically in column 1, then column 2—like newspaper layout—not row-major grid order.

### What is the reliable fix?

Programmatically distribute items into separate column containers so DOM order matches visual left-to-right flow.

### Does CSS Grid masonry solve this natively?

Browser support and behavior vary; explicit column split remains the most predictable cross-browser approach.

### Does this affect accessibility?

Yes—assistive tech follows DOM order, which may not match what sighted users see with column-count.

### Should I use a JavaScript masonry library instead?

For complex dynamic layouts, yes; for static card grids, split-column CSS/JS is often enough.
