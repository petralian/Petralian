# Petralian — Visual Design System

> Last updated: May 2026  
> Stack: Next.js 16 · Tailwind CSS v4 (CSS-first) · `src/app/globals.css`

All tokens live in the `@theme {}` block in `globals.css`. Tailwind v4 reads them automatically — no `tailwind.config.js` needed.

---

## Fonts

| Role | Family | Variable |
|---|---|---|
| Body | Red Hat Text | `var(--font-body)` → `--font-sans` |
| Headings | Lexend Deca | `var(--font-heading)` |
| Monospace | SF Mono / Cascadia Code | `--font-mono` |

Fonts are injected via `next/font/google` in `layout.tsx` and attached as CSS variables `--font-body` and `--font-heading` on `<html>`.

---

## Color Palette

### Light mode (default)

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#272730` | Body text |
| `--color-ink-heading` | `#1b2430` | All headings (`h1`–`h6`) |
| `--color-ink-secondary` | `#545468` | Subtitles, meta, secondary labels |
| `--color-ink-tertiary` | `#8b8fa8` | Placeholders, muted captions |
| `--color-surface` | `#ffffff` | Page background |
| `--color-surface-card` | `#ffffff` | Card backgrounds |
| `--color-surface-alt` | `#f5f7fa` | Subtle backgrounds (tag pills, inputs) |
| `--color-surface-dark` | `#1c2a31` | Dark hero sections |
| `--color-border` | `#e1e1e9` | Dividers, card borders, input strokes |
| `--color-accent` | `#ff6a3d` | Primary CTA, links, active states |
| `--color-accent-hover` | `#e55a2d` | Hover state of accent |

### Dark mode (auto via `prefers-color-scheme` or `data-theme="dark"`)

| Token | Value |
|---|---|
| `--color-ink` | `#dcddde` |
| `--color-ink-heading` | `#f0f0f2` |
| `--color-ink-secondary` | `#ababb3` |
| `--color-ink-tertiary` | `#7e7e8e` |
| `--color-surface` | `#1a1a1e` |
| `--color-surface-card` | `#222226` |
| `--color-surface-alt` | `#1e1e24` |
| `--color-surface-dark` | `#0f1418` |
| `--color-border` | `#333338` |
| `--color-accent` | `#ff7a50` |
| `--color-accent-hover` | `#ff9070` |

---

## Typography Scale

Tailwind v4 defaults supply most steps (`xs`, `sm`, `base`, `lg`, `2xl`). Only `2xs` is custom.

| Token | Value | Use |
|---|---|---|
| `--text-2xs` | `0.6875rem` (11px) | Eyebrow labels, micro badges, tiny meta |
| `xs` (Tailwind) | `0.75rem` (12px) | Tag pills, captions |
| `sm` (Tailwind) | `0.875rem` (14px) | Secondary body, card meta |
| `base` (Tailwind) | `1rem` (16px) | Default body text |
| `lg` (Tailwind) | `1.125rem` (18px) | Large body, nav links |
| `2xl` (Tailwind) | `1.5rem` (24px) | Section sub-heads |

### Line heights (leading)

| Token | Value | Use |
|---|---|---|
| `--leading-tight` | `1.15` | Display headings, hero type |
| `--leading-snug` | `1.45` | Card titles, tag pills, compact UI |
| `--leading-normal` | `1.7` | Body paragraphs, bio text |
| `--leading-relaxed` | `1.8` | Long-form article prose |

---

## Spacing

4pt grid (Apple HIG / Material 8dp). Token = multiple of 4px.

| Token | `rem` | `px` |
|---|---|---|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-14` | 3.5rem | 56px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | `3px` | Inline code |
| `--radius-sm` | `5px` | Badges, chips |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-card` | `12px` | **All** card and panel surfaces |
| `--radius-pill` | `999px` | Tag pills, category pills |

---

## Elevation (Shadows)

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Resting card state |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | Hover / focus state |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)` | Modals, popovers |

---

## Motion

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | `100ms` | Micro-interactions (hover color) |
| `--duration-base` | `200ms` | Standard transitions (Apple HIG) |
| `--duration-slow` | `300ms` | Page-level reveals |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material standard — moving elements |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter / appear transitions |

Shorthand aliases in `:root` for convenience:

```css
--dur-100: 100ms;  --dur-150: 150ms;  --dur-200: 200ms;
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Layout

- **Max content width:** `1200px` (centered with `margin: 0 auto`)
- **Page padding:** `0 var(--space-6)` (24px sides)
- **Header height:** `64px` (sticky, frosted glass)
- **Grid:** masonry 3-col on ≥1024px, 2-col ≥640px, 1-col mobile

---

## Key Component Classes

### Header

| Class | Description |
|---|---|
| `.site-header` | Sticky, frosted-glass backdrop blur, border-bottom |
| `.header-inner` | Max 1200px container, 64px height |
| `.site-logo` | Logo link |
| `.wordmark` | Text logo — Lexend Deca 700 |
| `.nav-link` | Navigation anchor |
| `.nav-cta` | Accent-colored CTA button in header |

### Post Cards

| Class | Description |
|---|---|
| `.post-card` | 16:9 image top, category pill, date, title, excerpt, tags |
| `.post-card-image-wrap` | Aspect-ratio container for the card image |
| `.post-card-body` | Padding container for card content |
| `.post-card-category` | Eyebrow category pill — `--text-2xs`, accent color |
| `.post-card-date` | Tertiary ink date label |
| `.post-card-title` | Card heading |
| `.post-card-title--featured` | Larger variant for featured cards |
| `.post-card-excerpt` | Short excerpt in secondary ink |
| `.post-card-tags` | Row of tag pills |
| `.post-card-tag` | Individual tag button — navigates to `/posts?tag=X` |
| `.post-card-read-more` | "Read more →" link in accent color |

### Blog Index

| Class | Description |
|---|---|
| `.blog-header` | Eyebrow / title / description / topic cards block |
| `.blog-header-eyebrow` | Small uppercase label |
| `.blog-header-title` | Large page title |
| `.blog-topic-row` | Flex row of topic cards |
| `.blog-topic-card` | Individual topic card (`.--dark` and `.--light` variants) |
| `.blog-filters` | Filter UI container |
| `.blog-search-wrap` | Search input wrapper with icon |
| `.blog-search-input` | Text search input |
| `.blog-tag-select` | Tag dropdown `<select>` |
| `.blog-category-pills` | Row of category toggle buttons |
| `.blog-category-pill` | Category filter button |
| `.blog-category-pill--active` | Active state modifier |
| `.masonry-grid` | 3-column CSS masonry grid |
| `.blog-empty` | Empty-state message |

### Post Hero (individual post page)

| Class | Description |
|---|---|
| `.post-hero` | Dark full-width banner — `background: var(--color-surface-dark)` |
| `.post-hero-inner` | Two-column layout (text left, image right) |
| `.post-hero-back` | "← All articles" navigation link |
| `.post-hero-eyebrow` | Category label in accent color |
| `.post-hero-title` | Post headline — large white type |
| `.post-hero-excerpt` | Subtitle paragraph |
| `.post-hero-meta` | Date · reading time row |
| `.post-hero-tags` | Row of tag pills |
| `.post-hero-tag` | Tag pill — links to `/posts?tag=X`, hover state included |

### Article Body

| Class | Description |
|---|---|
| `.article-body-wrap` | Centered container, max 720px prose column |
| `.prose` | Tailwind Typography prose styles |

### Related Posts

| Class | Description |
|---|---|
| `.related-posts` | Section with heading + card row |
| `.related-posts-grid` | 3-col card grid |

---

## Tag Taxonomy (16 canonical tags)

All tags are Title Case. Every post has 2–3 tags from this list.

| Tag | Pillar |
|---|---|
| `Enterprise AI` | AI & Technology |
| `Agentic AI` | AI & Technology |
| `Generative AI` | AI & Technology |
| `AI in Marketing` | AI & Technology / Marketing |
| `Future of Search` | AI & Technology |
| `Digital Transformation` | Digital Transformation |
| `Program Delivery` | Digital Transformation |
| `Ecommerce` | Commerce & Growth |
| `Social Commerce` | Commerce & Growth |
| `Customer Experience` | Commerce & Growth |
| `Marketing Technology` | Marketing & Media |
| `Programmatic` | Marketing & Media |
| `Agency Landscape` | Marketing & Media |
| `Leadership` | Leadership |
| `APAC` | Leadership / Geography |
| `Brand Strategy` | Marketing & Media |

---

## Category Taxonomy (5 categories)

| Category | Description |
|---|---|
| `AI & Technology` | AI deployment, LLMs, SaaS disruption, agentic platforms |
| `Digital Transformation` | Enterprise change programs, governance, delivery |
| `Commerce & Growth` | Ecommerce, social commerce, CX, GTM |
| `Marketing & Media` | Martech, programmatic, agencies, brand |
| `Leadership` | Management, culture, career, program delivery |

---

## Tag-Pill Routing

All tag pills are navigable:

- **Post hero** (`/posts/[slug]`) → `<Link href="/posts?tag=X">` — standard Next.js link
- **Post cards** (`PostCard`) → `<TagPillLink>` — client component, `useRouter.push` + `e.stopPropagation()` (avoids nested anchor conflict)
- **`/posts` page** reads `searchParams.tag` and passes `initialTag` to `BlogFilters`, which pre-selects the filter on mount

---

## File Map

| Concern | File |
|---|---|
| All design tokens + components | `src/app/globals.css` |
| Site layout (nav, footer) | `src/app/layout.tsx` |
| Blog index page | `src/app/posts/page.tsx` |
| Blog filter + grid | `src/components/BlogFilters.tsx` |
| Post card | `src/components/PostCard.tsx` |
| Tag pill (navigable) | `src/components/TagPillLink.tsx` |
| Individual post page | `src/app/posts/[slug]/page.tsx` |
| Related posts | `src/components/RelatedPosts.tsx` |
| Post data utilities | `src/lib/posts.ts` |
| Site constants (URLs, author) | `src/lib/constants.ts` |
