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
