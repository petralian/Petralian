# OpenSEO site audit — petralian.com (2026-07-28)

## Runs

| Audit ID | Trigger | Status | Crawl | Lighthouse |
|----------|---------|--------|-------|------------|
| `8fd5746c-5c4a-4bf3-9b30-625cce3df974` | UI (user) | **completed** | 50/50 | 20/20 |
| `4858fef3-1ce5-48e5-8606-dd718a143c4f` | MCP `run_site_audit` | **completed** | 50/50 | 20/20 |

**Note:** The first audit **did finish** after navigating away — OpenSEO runs server-side. UI progress bar is cosmetic; check **Site Audit** list or poll MCP `get_audit_status`.

## Issue summary (latest audit `4858fef3…`)

| Severity | Count | Type |
|----------|------:|------|
| critical | 0 | — |
| warning | 1 | thin-content |
| info | 22 | title-too-long (20), canonicalized-page (1), meta-description-too-long (1) |

**Crawl health:** 50 pages fetched, **0 HTTP 404** in crawl, **0 fetch errors**.

## Interpretation

- **No broken pages** in the 50-page sample — aligns with live redirect audit.
- **Title too long (20):** site appends ` — Petralian` to post titles; many exceed 60-char SEO display — info only unless trimming `seo_title`.
- **Thin content (1):** likely hub or utility page — open in OpenSEO UI for URL + `how_to_fix`.
- **Canonicalized (1):** expected redirect/canonical chain — verify in UI (often `/posts` vs duplicate path).
- **Meta description too long (1):** trim per `data/harness-verify.yaml` `seo_limits`.

## MCP commands (repeat audit)

```text
run_site_audit(projectId, url=https://petralian.com, maxPages=50)
get_audit_status(projectId)   # poll until completed
get_audit_issues(projectId)
get_audit_pages(projectId)
```

`maxPages: 100` returned `AUDIT_PAGE_LIMIT_EXCEEDED` on hosted plan — use **50** (default).

## Lighthouse (OpenSEO sample)

- **20/20** Lighthouse checks completed on audit sample — **no `slow-response` issues** in issue report.
- **0 critical**; performance regressions are not flagged as crawl issues.
- **Known ceiling (repo memory, 2026-07-21):** home mobile perf **98–99**, post **93–95** on Slow 4G lab — a11y/BP/SEO/agentic at **100**. Chasing perf **100** = LCP/TBT on homepage + post template (see `getting-to-lighthouse-100-on-nextjs-16` + `known-gotchas.md` Performance).
- **OpenSEO UI:** open any crawled URL → Lighthouse tab for per-URL perf score after this audit.
- **Info noise:** 20× `title-too-long` from ` — Petralian` suffix — not a perf blocker.

## Thin content fix (2026-07-28)

`/lost-in-space` flagged **thin-content** — expanded with `OrbitRushGuide` (how-to-play, power-ups table, tips, FAQ). Re-audit after deploy.
