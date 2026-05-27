# D2 Diagram Design System (Petralian)

Canonical reference for diagrams on petralian.com. The live site applies these tokens automatically when rendering ` ```d2 ` blocks.

**Obsidian copy:** `Blog/00 D2 Diagram Design System.md`

---

## Principles

1. **One system** — all diagrams use the same theme pipeline (`src/lib/d2-design-system.ts`). Do not hand-tune colors per post.
2. **Contrast first** — readable in light and dark site themes.
3. **Mobile-first** — `direction: down`, `grid-columns: 2` for four-node layers.
4. **Do not add `style.font-color` on container fills** — the renderer sets ink by depth.

---

## Typography (unified)

| Role | Size | Weight | Site font (in browser) |
|------|------|--------|-------------------------|
| Container title | 17px | bold | Red Hat Text (body) |
| Box label | 13px | regular | Red Hat Text |
| Edge label | 12px | regular | Red Hat Text |

Applied automatically via `*`, `*.*`, and edge globs. Kroki embeds Source Sans in SVG; the site overrides to **Red Hat Text** in CSS.

---

## Color tokens

| Token | Light | Dark render |
|--------|-------|-------------|
| Canvas | `#f5f7fa` | `#1b2430` |
| Layer panel | `#f5f7fa` / `#fff8f5` | `#2a2a32` / `#2d2a28` (auto-remapped) |
| Inner node | `#EDF0FD` | `#2d3548` (auto-remapped) |
| Ink on panel | `#272730` | `#e8e8ed` |
| Accent stroke | `#ff6a3d` | `#ff6a3d` |
| Feedback dash | `#696d84` | `#696d84` |

**Dark mode:** light author fills are remapped to dark surfaces. Inner nodes (D2 `B5`/`B6` classes) are forced to `#2d3548` in the render pipeline—Kroki’s default blue-tint classes ignore `N1`–`N7` overrides alone.

---

## Layer container

```d2
L1: "Layer 1 — Short term" {
  grid-columns: 2
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8

  CHAT: "Agent chat\n+ todos"
  LIVE: "Live workspace\n/ git state"
}
```

---

## Comparison (two columns)

```d2
direction: right

info: "Infographic model" {
  direction: down
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
  ...
}
```

---

## Canvas interaction (live site)

- **Tap image** (at 1× zoom) → canvas goes full viewport; diagram stays same size/zoom/pan.
- **Esc** or tap again → exit full screen.
- Pinch / ⌘/Ctrl+scroll to zoom; drag when zoomed.

---

## Snippets

`content/diagrams/snippets/`

---

## Obsidian preview

[D2 plugin](https://github.com/terrastruct/obsidian-d2-plugin) — colors may differ until publish; trust the live site render.
