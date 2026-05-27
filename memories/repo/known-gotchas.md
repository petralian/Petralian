# Petralian — known gotchas

**Updated:** 2026-05-26

## Session / memory
- **Never skip Start of Session** — user expects Obsidian session note, summaries, bridge, and feature updates alongside code.
- **Every assistant reply** must open with **Session context** (from `Session Summaries` + `AI Session Bridge`) and end with the **session footer** — see `.cursor/rules/response-footer.mdc`.
- Drafts live in Obsidian `Blog/01 Drafts/` only — do not write `content/posts/` during writing sessions.

## Diagrams
- Passing large SVG strings through **client** component props → blank diagram after hydration. Render SVG on **server** (`DiagramFigure`).
- Custom D2 `theme-overrides` / fill globs caused inconsistent borders (orange L1 vs white L2–L4). **Bright = Kroki defaults; dark = `filter: invert(1)` only.**
- Kroki required at build/request time (network).
- **Inline:** `@panzoom/panzoom` (`contain: outside`). **Fullscreen:** `react-zoom-pan-pinch` — panzoom has no reliable auto-fit/center on init.
- **Never** put `border`/`outline` on nodes with `filter: invert(1)` — inverts to a visible white ring. Use `overflow: hidden` on parents instead.
- Lock size for fullscreen: `--diagram-lock-w/h` on `.diagram-figure__canvas-wrap` (survives viewport swap), set in `lockDiagramMetrics` before expand.

## Build
- TinaCMS on port 9000 blocks full `npm run build` — use `npx next build` for page/TS checks.
- Brand logos: `public/images/` — never under `public/images/posts/`.

## MCP
- Project vault MCP: `scripts/obsidian-mcp-server.mjs` (Petralian vault only).
- Brain: `obsidian-brain` server in `.vscode/mcp.json` — paths under `D:\Obsidian\Obsidian\00_Brain`.
