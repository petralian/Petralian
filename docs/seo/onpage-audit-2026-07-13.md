# On-page SEO audit — pillar posts (2026-07-13)

Alli AI substitute — run: `npm run audit:seo-meta -- --top 20`

## Priority fixes (apply in Obsidian or `content/posts/`)

| Slug | Issue | Action |
|------|-------|--------|
| `the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo` | Empty meta | **Fixed** — added `seo_description`, `excerpt`, `focus_keyword` |
| `building-petralian-the-technical-reality` | Title short (46 chars) | Add `seo_title` ~55 chars in frontmatter |
| `training-an-ai-is-like-managing-an-employee` | Title short (43 chars) | Add dedicated `seo_title` |
| `publishing-obsidian-drafts-through-github-actions` | Title short (49 chars) | Add `seo_title` |
| `gravio-multi-repo-rollout-playbook` | Description short (134) | Extend `seo_description` to 150–160 |
| `knowledge-work-agent-engine-guide-2026` | Description short (134) | Extend `seo_description` |
| `why-i-rebuilt-petralian-on-nextjs` | Description long (213) | Trim `seo_description` |
| `knowledge-work-engine-leadership-decisions-2026` | Description long (169) | Trim to 160 |
| `knowledge-work-engine-marketing-voice-2026` | Description long (178) | Trim to 160 |
| `three-layer-external-brain-for-ai-first-development` | Description long (174) | Trim to 160 |
| `vscode-copilot-to-cursor-what-changed-in-my-ai-workflow` | Description long (171) | Trim to 160 |
| `cursor-harness-memory-loop-2026` | Description long (190) | Trim to 160 |
| `your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian` | Missing `focus_keyword` | Add e.g. `Obsidian external memory` |

## Internal linking (Alli / manual)

Add cross-links between Knowledge Work Engine series:

- Hub → PM, Leadership, Marketing parts
- External memory hub → all 4 layer posts
- `why-your-ai-program-may-fail-before-it-starts` → enterprise foundation post when published

## Optional `seo_title` field

Posts use `title` for H1; add explicit `seo_title` (55–60 chars) when `title` is too long for SERP — e.g. Knowledge Work posts with 70+ char titles.

## Re-run

```bash
npm run audit:seo-meta
npm run audit:seo-meta -- --top 20
```
