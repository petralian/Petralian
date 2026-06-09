# Petralian — known gotchas

**Updated:** 2026-05-26

## Session / memory
- **Never skip Start of Session** — user expects Obsidian session note, summaries, bridge, and feature updates alongside code.
- **Every assistant reply** must open with **Session context** and end with the **session footer** — canonical: `00_Brain/Conventions/Response Footer Contract.md`; enforced: `.cursor/rules/response-footer.mdc`.
- Drafts live in Obsidian `Blog/01 Drafts/` only — do not write `content/posts/` during writing sessions.

## Diagrams
- Passing large SVG strings through **client** component props → blank diagram after hydration. Render SVG on **server** (`DiagramFigure`).
- Custom D2 `theme-overrides` / fill globs caused inconsistent borders (orange L1 vs white L2–L4). **Bright = Kroki defaults; dark = `filter: invert(1)` only.**
- Kroki required at build/request time (network).
- **Inline:** `@panzoom/panzoom` (`contain: outside`). **Fullscreen:** `react-zoom-pan-pinch` — panzoom has no reliable auto-fit/center on init.
- **Never** put `border`/`outline` on nodes with `filter: invert(1)` — inverts to a visible white ring. Use `overflow: hidden` on parents instead.
- Lock size for fullscreen: `--diagram-lock-w/h` on `.diagram-figure__canvas-wrap` (survives viewport swap), set in `lockDiagramMetrics` before expand.
- **Diagram theme:** Light site theme → show `.diagram-figure__svg--light` on `--diagram-canvas-light`; dark theme → `.diagram-figure__svg--dark` + `invert(1)`. Do not force dark canvas in light mode.
- **Diagram footer logo:** Never set `display: block` on `.diagram-figure__watermark-img` without `--light`/`--dark` — it overrides `display: none` and shows both logos.
- **Mobile fullscreen:** Do not use `height: 100svh` on `.diagram-figure--expanded` — locks to small viewport; article bleeds when Chrome hides toolbar. Use `--diagram-vv-height` / `--diagram-vv-top` from `visualViewport` via `diagram-visual-viewport.ts` + `subscribeDiagramVisualViewport()` while expanded.

## Performance (Lighthouse)
- Homepage LCP is `nathan-petralia.jpg` — photo must be **first in DOM** on mobile; do not `priority` the header logo (competes with LCP).
- Post grid: use `PostGrid` (CSS grid, server-only) — not client `ResponsiveMasonry` (hydration + wrong initial column count hurt LCP/TBT).
- Post card images: `loading="lazy"` + `fetchPriority="low"`; hero PNGs >500 KB → JPEG (`scripts/png-to-jpg-post-heroes.mjs`).
- `content-visibility: auto` on `.home-recent-posts` defers below-fold card work.

## Build
- TinaCMS on port 9000 blocks full `npm run build` — use `npx next build` for page/TS checks.
- Brand logos: `public/images/` — never under `public/images/posts/`.

## MCP
- **Petralian vault:** `petralian-obsidian` in `.cursor/mcp.json` → `scripts/obsidian-mcp-server.mjs` (`obsidian_read` / `obsidian_write` / `obsidian_append`). Fallback CLI: `node scripts/obsidian-mcp-cli.mjs`.
- **Brain:** `obsidian-brain` in `.vscode/mcp.json` — paths under `D:\Obsidian\Obsidian\00_Brain`.
- Reload Cursor after MCP config changes; agent chat only sees servers registered in `.cursor/mcp.json`.
