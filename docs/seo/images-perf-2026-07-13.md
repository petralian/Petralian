# Image performance audit — 2026-07-13

## `npm run optimize-images:dry`

- **81 images** scanned in `public/images/posts/`
- **2.8 KB** additional savings available (JPEGs already optimal)
- Script max width 1200px, JPEG quality 80 — **already applied**

## ShortPixel candidates (PNG heroes >900 KB)

Use ShortPixel dashboard batch on these only (WebP conversion + lossy):

| File | Size |
|------|------|
| composer-2-5-baseline-model-tighter-bootstrap-better-results.png | 1977 KB |
| github-copilot-vs-openrouter-real-cost-comparison-for-developers.png | 1747 KB |
| publishing-obsidian-drafts-through-github-actions.png | 1615 KB |
| getting-to-lighthouse-100-on-nextjs-16.png | 1535 KB |
| three-layer-external-brain-for-ai-first-development.png | 1539 KB |
| cursorbench-fable-5-composer-2-5-cost-vs-score.png | 1492 KB |
| training-an-ai-is-like-managing-an-employee.png | 1490 KB |
| how-gravio-scoring-engine-was-built.png | 1471 KB |
| capturing-ui-designs-for-ai-agents-prompt-injection-risk.png | 1153 KB |
| cursor-harness-measurement-2026.png | 1169 KB |
| zero-knowledge-ai-quality-gravio.png | 1132 KB |
| contextual-ai-ecommerce-conversation-hero.png | 1124 KB |
| knowledge-work-engine-marketing-voice-2026.png | 1124 KB |
| cursor-lightweight-harness-without-microservice-2026.png | 1139 KB |
| cursor-token-saving-tools-beyond-headroom-2026.png | 1313 KB |

After ShortPixel: update `featured_image` paths in frontmatter if extension changes to `.webp`.

## PageSpeed re-test

- Homepage: https://pagespeed.web.dev/analysis?url=https://petralian.com
- Long post: `.../posts/knowledge-work-agent-engine-guide-2026`
- Target: mobile **95+** (stretch 100)

## Repo command

```bash
npm run optimize-images:dry
npm run optimize-images
```
