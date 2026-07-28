# Petralian — open loops (sync with vault)

**Mirror of:** `Operations/Open Loops.md`  
**Updated:** 2026-07-21 (Lighthouse perf pass — `4f3c49a`)

| Loop | Status | Notes |
|------|--------|-------|
| Facts automation commit | Closed | `f42f144` YAML SSOT + audits + cursor rules |
| Vault content sync | Closed | `013ff00` — 93 articles + images pushed |
| Article image pipeline (vault) | Closed | 2026-07-21 |
| Temp scripts / d2 guide (untracked) | Open | `_*.mjs`, `docs/editorial/d2-visual-guide.md` — stash or commit separately |
| OpenSEO MCP + GSC connect | Closed | 2026-07-28 — petralian.com project, GSC linked, MCP verified in Cursor |
| GSC index 9-post batch | Closed | User validated 404 fix + indexing request 2026-07-28 |
| IndexNow key on production | Open | Key file 200 OK; API 403 `UserForbiddedToAccessSite` — verify site in Bing Webmaster Tools (`docs/seo/indexnow-403-fix.md`) |
| Hot-topic batch (8 posts) | Open | `Blog/01 Drafts/` — user generating hero PNGs |
| PSI / Lighthouse 100 | Open | Perf pass shipped pending deploy; baseline prod home 92 / cursorbench post 75 (LCP 9.3s PNG hero). Target 100 after `HomeIntro` SSR + JPEG heroes + dynamic post chunks |
| Customize series A+B review | Open | Drafting in `01 Drafts/` |
| sync-cursor-stack other repos | Open | Run when Vouch etc. on disk |

**Reload Obsidian** after agent vault updates (`Ctrl+R`).
