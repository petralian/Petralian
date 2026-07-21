# Facts discipline (repo mirror)

**Updated:** 2026-07-21  
**Brain canonical:** `D:\Obsidian\Obsidian\00_Brain\Conventions\Facts and Verification.md`  
**Rule:** `.cursor/rules/facts-and-verification.mdc`

## Three layers

| Layer | What | Portable? |
|-------|------|-----------|
| **Prose** | Bridge, Feature notes, posts, IDN narrative | Yes — Obsidian markdown |
| **Parametric** | `data/*.yaml` — numbers, limits, interdependent config | Yes — any editor + git |
| **Enforcement** | Cursor rules, hooks, footer contract | Cursor-specific runtime |

## Empirical loop (required on non-trivial work)

1. **Identify** what to verify  
2. **Execute** (build, test, script, audit)  
3. **Validate** pass/fail  
4. **Document** to session note, IDN, Bridge, or YAML  

No document step = task not done.

## Bootstrap

Read `data/harness-verify.yaml` when unsure of verify commands or SEO numeric limits.

**Audits:** `node scripts/audit-parametric-drift.mjs` · `node scripts/audit-session-traceability.mjs`  
**Publish:** `sync-obsidian.ps1` runs facts gate automatically.  
**Vault runbook:** `D:\Obsidian\Obsidian\40_VSCode\Petralian\Operations\Facts Automation and Enterprise Traceability.md`
