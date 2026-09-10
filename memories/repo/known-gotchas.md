# Petralian — known gotchas

**Updated:** 2026-09-10

## UI / content
- **Format labels are canonical** — `POST_FORMATS[].label` only: **Strategic**, **Hands-on**, **Hybrid**. Same strings on filter pills, post cards, and post hero. No `shortLabel` aliases (Strategy / Build / Both).
- **Format badge colors** — use `--format-*` tokens on hero and cards; no hero-specific color overrides.
- **Site layout tokens** — horizontal gutters and vertical rhythm use `--site-gutter-x`, `--site-pad-bottom`, `--site-block-gap`, `--site-dark-hero-pad-y`, `--header-offset` in `globals.css`.
- **Post outline nav** — H2 only via `buildOutlineNav()`; sticky on `.post-outline-root`; IntersectionObserver scroll spy; exclude Reference/Additional detail/Sources prefixes (FAQ + Common mistakes stay in nav).
- **D2 collapsed** — No client viewBox trim, rect strip, or panzoom; pinch/zoom in fullscreen only.
- **Playbook** — topic tag `Playbook` on long-form posts (filter at `/topics/playbook`); not a separate badge.
- **GEO** — topic tag on generative-engine / answer-surface posts; filter at `/topics/geo`.
- **Inline D2 diagrams** — dual-SVG invert pipeline; no client viewBox trim; cap 400px inline; fullscreen pinch/zoom.
- **Vault hero images** — updating `03 Published/Attachments/*.png` does not sync to `public/images/posts/` until copied or publish script runs; stale repo image = wrong hero on site.

## Obsidian / cloud
- **Official Obsidian Sync** — no API; cloud/iPhone agents cannot read vault via Sync. Use private git mirror `petralian/vault-petralian` + Cursor `repositoryDependencies`.
- **Retired:** self-hosted CouchDB + `obsidian-sync-mcp` on VPS — do not wire CouchDB MCP for vault access.
- **Desk:** native `D:\Obsidian\...` Read/Write only — **no vault MCP** in `.cursor/mcp.json` or `.vscode/mcp.json`. **Cloud:** read cloned `vault-petralian` repo (optional filesystem MCP on clone in Dashboard only).

## Session / memory
- **Never skip Start of Session** — user expects Obsidian session note, summaries, bridge, and feature updates alongside code.
- **Every assistant reply** must open with **Session context** and end with the **session footer** — canonical: `00_Brain/Conventions/Response Footer Contract.md`; enforced: `.cursor/rules/response-footer.mdc`.
- Drafts live in Obsidian `Blog/01 Drafts/` only — do not write `content/posts/` during writing sessions.
- **`Blog/02 Ready to publish/` — never create new articles there.** User promotes from `01 Drafts`. Agents may **edit existing** `02 Ready` files only on **explicit user request**; validate slug/frontmatter and folder gate before any edit.
- **Scheduled posts:** `date` in frontmatter gates visibility (`isPostPublished` in `src/lib/posts.ts`). Future-dated files can sit in `content/posts/` after sync; they 404 and stay off homepage/RSS/sitemap until editorial date (HK calendar day; pages revalidate hourly).

## Diagrams
- Passing large SVG strings through **client** component props → blank diagram after hydration. Render SVG on **server** (`DiagramFigure`).
- Custom D2 `theme-overrides` / fill globs caused inconsistent borders (orange L1 vs white L2–L4). **Bright = Kroki defaults; dark = `filter: invert(1)` only.**
- Kroki required at build/request time (network).
- **Inline:** `@panzoom/panzoom` (`contain: outside`). **Fullscreen:** `react-zoom-pan-pinch` — panzoom has no reliable auto-fit/center on init.
- **Never** put `border`/`outline` on nodes with `filter: invert(1)` — inverts to a visible white ring. Use `overflow: hidden` on parents instead.
- Lock size for fullscreen: `--diagram-lock-w/h` on `.diagram-figure__canvas-wrap` (survives viewport swap), set in `lockDiagramMetrics` before expand.
- **Diagram theme:** Light → `.diagram-figure__svg--light`; dark → `.diagram-figure__svg--dark` + `.diagram-figure__svg-invert { filter: invert(1) }` with `prepareDarkSvgForInvert` (canvas fill + edge stroke remap). Do not client-strip rects on the dark copy. Never set `display` on bare `.diagram-figure__svg` — it overrides `--dark { display: none }` and stacks both copies in fullscreen.
- **Diagram footer logo:** Never set `display: block` on `.diagram-figure__watermark-img` without `--light`/`--dark` — it overrides `display: none` and shows both logos.
- **Mobile fullscreen:** Do not use `height: 100svh` on `.diagram-figure--expanded` — locks to small viewport; article bleeds when Chrome hides toolbar. Use `--diagram-vv-height` / `--diagram-vv-top` from `visualViewport` via `diagram-visual-viewport.ts` + `subscribeDiagramVisualViewport()` while expanded.

## Performance (Lighthouse)
- Homepage LCP is `nathan-petralia.avif` — photo must be **first in DOM** on mobile; do not `priority` the header logo (competes with LCP).
- Post grid: use `PostGrid` (CSS grid, server-only) — not client `ResponsiveMasonry` (hydration + wrong initial column count hurt LCP/TBT).
- Post images: pre-compress to **AVIF** at sync (`scripts/raster-to-avif.mjs`, SSOT `data/image-pipeline.yaml`); SVG/GIF pass-through; `next.config.ts` `images.unoptimized: true`.
- `content-visibility: auto` on `.home-recent-posts` defers below-fold card work.

## Build
- TinaCMS on port 9000 blocks full `npm run build` — use `npx next build` for page/TS checks.
- Brand logos: `public/images/` — never under `public/images/posts/`.

## MCP
- **Vault at desk:** native `Read`/`Write`/`StrReplace` on `D:\Obsidian\...` — do **not** use `petralian-obsidian`, `obsidian-brain`, or filesystem MCP on `D:\`.
- **Active stack:** Context7, Serena, OpenSEO in `.cursor/mcp.json` — see `docs/TOKEN-STACK.md`.
- **Legacy (unwired):** `scripts/obsidian-mcp-server.mjs` / `obsidian-mcp-cli.mjs` — kept for reference; not registered locally.
- **Cloud/mobile:** URL MCP via Cursor Dashboard; vault via `vault-petralian` clone + native Read.
- Reload Cursor after MCP config changes; remove stale vault MCP entries from Settings → MCP if cached.
