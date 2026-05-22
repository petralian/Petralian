# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

### Fixed — Root cause: Divi 5 Visual Builder broken by Code Snippets DB snippet
- **Root cause found and fixed**: The Divi 5 Visual Builder blue spinner was caused by a user-created Code Snippet (ID:5, "remove mediaelement") stored in the `wp_snippets` database table. This snippet deregisters `wp-mediaelement` on any page without audio/video shortcodes — including the builder `?et_fb=1&app_window=1` URL. Without `wp-mediaelement`, both the `visual-builder` and `media-editor`/`media-views` dependency chains fail, dropping 39+ scripts. Fix: added a guard at the top of the snippet to `return` early when `$_GET['et_fb']` or `$_GET['app_window']` is set. Applied to both local (Docker) and live (petralian.com) databases.
- Debug investigation confirmed via PHP bisection: deregistration occurs at `wp_enqueue_scripts` priority 20 by the eval'd snippet closure.

### Fixed (v1.3.0 — Divi 5 Visual Builder + WP 6.9.1 dep resolution)
- **Divi 5 Visual Builder broken on WP 6.9.1+**: WordPress 6.9.1 changed `WP_Dependencies::all_deps()` to silently drop scripts whose direct dependency list includes any unregistered handle. Divi 5.5.2 lists `wp-mediaelement` as a dep of `visual-builder-loader`, but `wp-mediaelement` is absent from `$wp_scripts->registered` at footer-script print time on the `?et_fb=1` top window. Fix: hook `wp_print_footer_scripts` and `wp_print_scripts` at priority 1 and register any missing direct deps of `visual-builder-loader` as virtual placeholders (src=false) before `all_deps()` runs.
- Builder request guard added to plugin — prevents custom enqueues from running on Divi builder requests
- Cleaned duplicate `_et_*` post meta rows (posts 9, 19, 21)
- EWWW image optimizer exclusion for Divi logo

### Changed (Round 10b — homepage spacing + blog link v1.2.8)
- Homepage `.et_pb_text_1`: removed Divi-injected `padding-top/bottom: 10px` and `margin-top: 10px` — overridden to `0` via `body.page-id-9` scoped rule
- Homepage blog grid: hide Divi `.pagination.clearfix` via CSS; inject orange "Read all articles →" link via `wp_add_inline_script` after `.et_pb_blog_0`

### Fixed (Round 10a — selector + padding fixes v1.2.8)
- Plugin v1.2.7 → v1.2.8: version bump
- **Deployment bug**: Fixed nested subdirectory issue from Round 9 SCP deploy — v1.1.0 PHP was being served; v1.2.7 promoted from nested subfolder to correct path
- **CTA section selectors**: Replaced dead `et_pb_section_2` selectors with correct `et_pb_section_0.et_section_regular` (CTA is the second section_0 on the blog page, not section_2)
- **CTA heading color**: Changed from `#FFFFFF` (invisible on light bg) to `#1B2430` (dark navy) — CTA section has white/soft-grey background
- **Section_0 padding**: Scoped global `et_pb_section_0` padding rule to `body.page-id-19 .et_pb_section_0.et_section_specialty` with `!important` to override Divi inline CSS; viewport-responsive `3vw` now applies correctly to hero section

### Changed (Round 9 — blog page CSS fixes + section_0 padding v1.2.7)
- Plugin v1.2.6 → v1.2.7: version bump for Round 9 changes
- Blog CTA heading (section_2): added `font-weight: 600 !important; color: #FFFFFF !important;` to Lexend Deca 40px rule
- Blog page hero H1 (et_pb_heading_1): lock rule added — 55px, Lexend Deca, weight 600, color #0e0c19, line-height 1.15em
- Blog page dark topic tile (et_pb_column_inner_1): H5 heading + paragraph text locked to `#F5F7FA`
- Blog page "Latest Articles by Nathan Petralia" heading (et_pb_heading_4): `margin-top: 20px !important`
- `et_pb_text_2 min-height: 95px` → added `!important` to override Divi inline CSS
- Global: `.et_pb_section_0.et_pb_section` padding-top/bottom 3vw

### Changed (Round 8 — CSS scroll-top hover + heading fixes v1.2.6)
- Plugin v1.2.5 → v1.2.6: version bump for Round 8 changes
- Scroll-top hover colour changed to slate-teal `#678183` (was orange)
- Homepage CTA heading (section_5): font-family Lexend Deca 40px weight 600 `rgb(245,247,250)`
- Homepage hero kicker (et_pb_heading_0): `margin-bottom: 0` to keep tight against H1
- `et_pb_text_2`: `min-height: 95px` rule added (without !important, later fixed in Round 9)

### Changed (Round 7 — button spacing, CTA, blog, contact v1.2.5)
- Plugin v1.2.4 → v1.2.5: version bump for all Round 7 changes
- Home hero: button wrapper `margin-top: 31px` to match live spacing
- Home CTA (section_5): heading colour `rgb(245,247,250)` + `font-weight: 600`; button wrapper `margin-top: 31px`; heading `margin-bottom: 10px`
- Buttons: hover rule removed `padding` expansion — size stays fixed at `12px 25px` on hover
- Blog archive header: `padding-bottom: 30px` (was 1.25rem)
- Blog page (section_2): `background-color: #f5f7fa !important` — matches live grey CTA bg
- Contact kicker "Don't be a stranger": `color: #9EA7B3`, 14px, uppercase, letter-spacing 1px
- Contact page DB: section heading → "What I enjoy doing"; all 4 tile bodies restored to live-original wording
- Contact speech bubble: fixed plugin filter that was overwriting DB text with old extended version; now correctly reads "Connect with Nathan today to transform your business."

### Changed (Round 6 — home page CSS fix, blog layout, contact rewrite)
- Plugin v1.2.2 → v1.2.3: `should_enqueue_assets()` now includes home page (`petralian_formatted_content_is_home_page()`); CSS version bumped to bust browser cache
- Home page: plugin CSS (`petralian-formatted-content.css`) now loads correctly — hero H4 kicker and all button overrides now apply on cache clear
- Home page CTA section: `et_pb_button_2` (Get in Touch) — added solid `#678183` override to match hero button
- Blog archive layout: article cards area (`petralian-blog-archive__body`) changed from dark navy to soft grey (`#f5f7fa`) with full-bleed background; slider + search/filter row stays dark
- Contact page: full rewrite from consulting pitch to personal tone — kicker "Don't be a stranger", heading "Get in Touch", body personalised; 4 tiles relabelled (Questions / Working Together / Speaking / Just Saying Hi) with personal descriptions; closing CTA rewritten to "Drop me a note below"

### Changed (Round 5 — persistent CSS fixes + consulting language removal)
- Plugin CSS: added `!important` overrides for home hero H4 kicker (14px, #9EA7B3, uppercase) and button (#678183 solid) — survives Divi et-cache clears
- Home page hero H4 eyebrow: "Technology, Transformation, and the Strategy Behind Both" → "Writing and Thinking"
- Home page services section buttons: "Grow Your Business", "Start Optimizing Today", "Unlock the Power of Data", "Revolutionize Your Tech Stack", "Create Tailored Experiences", "Learn More About Strategy" → all replaced with "Learn More"
- Transform/CTA banner (ID 60): "Transform Your Business Today" → "Let's Connect"; button "Get Started" → "Get in Touch"
- Footer "Schedule a Call" link → "Get in Touch"
- Footer navigation section: "SERVICES" heading → "WORK"; link labels softened ("Digital Transformation Strategy" → "Digital Transformation", "Ecommerce Optimization" → "Ecommerce & Commerce", "AI and Data Analytics" → "AI & Data", "MarTech Implementation" → "MarTech & CRM")
- docs/deploy.md: added CSS audit table for post-cache-clear verification

### Changed (Round 4 — personal website reframe)
- Home page hero: title updated to "Technology, Transformation, and the People Navigating Both"; body reframed for personal site (no consulting language)
- Home page hero button: "Schedule a Consultation" → "Get in Touch"
- Home page bio: last sentence rewritten to remove executive-consulting framing
- Home page CTA section: heading "Connect With Me Today" → "Let's Have a Conversation"; body copy softened; button "Contact Nathan Now" → "Get in Touch"
- Blog page hero: title "Explore Strategies for Business Growth" → "Perspectives on Technology and Change"
- Blog page hero body: ecommerce/strategy language replaced with personal tech/transformation framing
- Blog category tiles: "AI in Marketing" → "AI and Technology"; "Ecommerce Strategies" → "Digital Transformation"; body copy updated to non-consulting language
- Blog page CTA: "Schedule Your Consultation with Nathan" → "Have a Conversation with Nathan"; body and button softened
- Divi library "schedule banner" (ID 55): "Schedule Your Consultation Today" → "Get in Touch"; body copy personalised
- Blog section gradient line: added `background-image: none !important` to plugin CSS to eliminate Divi's hard-stop gradient between carousel and filter bar

### Changed (Round 3 — cf55948)
- Blog cards: moved category chip and date below title instead of above
- Blog cards: CTA text changed from "Read article" to "Read more"
- Blog filter inputs: switched to white background / dark text so selected tag text is legible
- Contact service cards: title font-size increased to 1.5rem, padding balanced to 1.5rem on all sides
- Blog page section background: unified dark colour (`#1B2430`) from carousel down through filter panel via `:has()` CSS
- Homepage blog grid: tightened post spacing to visually match blog page density
- Reassigned 14 posts across Categories — Ideas reduced from 26→17, Case Studies up to ~16, News cleaned up

### Added
- Initial project scaffold: Docker-based WordPress local dev environment
- Custom theme stub: `wp-content/themes/petralian/`
- MCP wiring for Obsidian vault access (project + Brain)
- Project conventions in `.instructions.md`
- Deployment and content workflow docs

### Changed
- Hardened blog publishing workflow: local review is mandatory before any live action, live injections now require explicit confirmation and explicit `draft`/`publish` status
- `scripts/inject-post.ps1` now strips author-only appendix sections from post content and writes Rank Math SEO metadata from Markdown frontmatter
- Blog publishing checklist and workflow notes updated in the Petralian Obsidian vault to enforce local approval, image readiness, and Rank Math completion
- Writing and workflow notes now use American spelling consistently
- Article image handoff guidance now includes generation instructions, acceptance criteria, and WordPress-ready delivery details
- Active article draft in `content/posts/` is now kept in sync with its matching Obsidian draft, and approval requests now require the exact local review link plus any missing image/visual prompt
- Blog article packaging now includes an optional visual enhancement pack and uses the exact focus keyword phrase in the current article meta description
- `scripts/wp-post-helper.php` now converts Markdown article bodies to HTML before saving, fixing broken local rendering of headings, bold text, lists, and code blocks
- `scripts/inject-post.ps1` can now auto-attach a featured image when the frontmatter image file exists in the workspace, while warning clearly when the binary is not available
- The article injection pipeline now uses the `marked` Markdown renderer, which fixes broken source links, ordered lists, and Markdown link parsing edge cases
- Petralian article rules now require slug-based internal links instead of `?p=ID` URLs and clickable source/further-reading links in local review
- Article frontmatter now supports an explicit `slug`, and the active Obsidian article now uses the canonical local permalink without a `-2` suffix
- The current article now uses the provided featured image, removes dead inline citation markers, removes forced chapter divider lines, and tightens numbered-list rendering to better match Nathan's voice and formatting preference
- Single-post blog content now gets Divi-safe formatting styles for code, tables, quotes, keyboard shortcuts, and Obsidian-style callout blocks, and the Markdown renderer now converts `[!note]`-style callouts into styled frontend panels
- The formatted-content system now auto-supports relevant Divi pages, adds syntax highlighting for code blocks, and the live plugin is active on production
- Deploy and publish tooling now falls back to Docker PHP lint locally, resolves `wp-load.php` correctly on the VPS, and fails fast when remote copy or injection steps break
- `scripts/render-markdown.mjs` now strips YAML frontmatter and author-only appendix sections on its own and renders Markdown `---` separators as WordPress-style `wp-block-separator` dividers, so article chapter lines can be added safely from the source Markdown
- The local blog page now swaps Divi's stock search/blog modules for a custom archive layer with topic chips, tag filtering, search, and infinite scroll backed by a local REST endpoint in `petralian-formatted-content`
- Local-only copy overrides now shift the home, blog, and contact pages toward delivery turnaround, governance, and execution leadership without editing Divi builder data directly in the database
- Divi's built-in back-to-top button is now enhanced locally with a circular page-progress indicator and custom arrow styling through plugin-managed frontend CSS/JS instead of a second floating control
- The local page-copy layer now keeps the original Divi home and contact positioning intact with only subtle delivery/program leadership nudges, and the generic formatted-content stylesheet no longer loads on standard Divi pages where it was distorting layout
