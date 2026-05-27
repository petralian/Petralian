<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## SEO Frontmatter Fields

The canonical SEO field name is `seo_description` (NOT `meta_description`). The live site reads this via `src/lib/posts.ts`. Any agent adding SEO fields must use:

```yaml
seo_title: "55-60 char SEO title"
seo_description: "150-160 char meta description"
featured_image_alt: "Descriptive alt text for hero image"
focus_keyword: "primary 2-4 word keyword phrase"
```

## Image Asset Paths

- Brand logos: `public/images/` (petralian_blue.png, petralian_white.png, petralian_ico.png)
- Post hero images: `public/images/posts/`
- Never put brand assets in `public/images/posts/`

## Build Constraints

- Build command: `tinacms build --skip-cloud-checks && cross-env NODE_OPTIONS=--max-old-space-size=1024 next build`
- If TinaCMS dev server is running on port 9000, `npm run build` will fail — use `npx next build` to test TypeScript/pages only
- Always run build before pushing — zero TypeScript errors is the baseline

## Content Safety

- `content/posts/*.md` is the live publishing pipeline. Never write here during a writing session.
- Drafts belong in the Obsidian vault at `Blog/01 Drafts/` only
- `status: published` in frontmatter = live on Vercel after next push

## Session protocol (mandatory)

Before non-trivial work, execute `D:\Obsidian\Obsidian\00_Brain\_Manual Prompts\Start of Session.md`:

1. Read vault `D:\Obsidian\Obsidian\40_VSCode\Petralian\_Home.md`, `Operations/AI Session Bridge.md`, `Operations/Session Summaries.md`, relevant `Features/*`
2. Read repo `memories/repo/index.md`, `open-loops.md`, `known-gotchas.md`
3. Create/update `Operations/Sessions/YYYY-MM-DD <topic>.md` in the vault **before coding**
4. Update Feature notes and `Operations/Session Summaries.md` when scope changes

Do not skip Obsidian updates because the user asked for code only. See `.cursor/rules/session-protocol.mdc`.

## Diagrams (D2)

- Bright theme: Kroki/D2 default colors (no `theme-overrides` in `wrapD2Chart`)
- Dark theme: same SVG with `filter: invert(1)` on `.diagram-figure__svg--dark`
- Render SVG on the server (`DiagramFigure`), not via client component props
