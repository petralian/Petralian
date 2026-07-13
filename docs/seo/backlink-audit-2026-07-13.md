# Backlink audit — Semrush toxicity (2026-07-13)

**Property:** `petralian.com` (domain property in GSC)  
**Tool:** Semrush Backlink Audit  
**Export:** `backlink_audit_domains_30396432_2026-07-13.csv`

## Snapshot

| Metric | Value |
|--------|-------|
| Overall toxicity | **High** (61.8%) |
| Toxic backlinks | 81 |
| Potentially toxic | 4 |
| Non-toxic | 46 |
| Unique spam domains (CSV) | 79 |

These are **not links you purchased**. They are auto-generated PBN / “buy aged domains and backlinks” spam pages that list any domain they scrape. You cannot remove them from those sites.

## Split by target

| Target | Toxic links | Notes |
|--------|-------------|-------|
| `crm.petralian.com` | **42** (~52%) | Perfex login — should be noindex |
| `petralian.com` | **35** | Mostly homepage branded anchors |
| Other | 4 | Mixed |

**Highest-impact fix:** block CRM from Google’s index (see [CRM noindex](crm-noindex.md)).

## Disavow policy (do not upload yet)

| Condition | Action |
|-----------|--------|
| GSC Manual actions **empty** (2026-07-13) | **Do not** upload disavow |
| Indexation recovering after migration | Wait; re-check ~**2026-07-27** |
| Manual Action: “Unnatural links” | Upload [`disavow-2026-07-13.txt`](disavow-2026-07-13.txt) to [GSC Disavow tool](https://search.google.com/search-console/disavow-links) |
| Indexed count flat + spam anchors growing in GSC **Links** | Consider disavow after 4–6 weeks |

GSC **Links** (2026-07-13): ~142 external links, mostly benign `curiosithee.be` (125) → homepage. Semrush toxicity is a **risk score**, not proof of a Google penalty.

## Prepared disavow file

| File | Domains | Sources |
|------|---------|---------|
| [`disavow-2026-07-13.txt`](disavow-2026-07-13.txt) | **352** unique | Ahrefs refdomains (289) + Semrush toxic audit (79) |

Re-merge after new exports:

```bash
node scripts/merge-disavow-domains.mjs
# or with explicit paths:
node scripts/merge-disavow-domains.mjs --out docs/seo/disavow-2026-07-13.txt docs/seo/disavow-2026-07-13.txt path/to/new-semrush.csv
```

## CRM noindex (you must do on server)

Files ready in [`crm-deploy/`](crm-deploy/):

1. SFTP/SSH to Perfex on `46.224.49.175`
2. Upload `robots.txt` + `.htaccess` to web root (same folder as `index.php`)
3. Verify:
   - `https://crm.petralian.com/robots.txt` → `Disallow: /`
   - Response header: `X-Robots-Tag: noindex, nofollow, noarchive`
4. GSC → **Indexing** → **Removals** → prefix `https://crm.petralian.com/`
5. URL Inspection → `https://crm.petralian.com/` → expect “Excluded by noindex” after server fix

## Optional Semrush hygiene

In Semrush Backlink Audit → mark the 81 toxic domains → **Disavow** → clears the “for-review” queue (cosmetic; does not affect Google until you upload to GSC).

## Re-check schedule

| Date | Check |
|------|-------|
| ~2026-07-27 | GSC Pages export (indexed vs not indexed) |
| ~2026-07-27 | GSC Links export (spam anchor growth?) |
| After CRM deploy | Semrush re-audit (CRM-targeted toxic count should drop over time) |

## Related docs

- [GSC recovery checklist](gsc-recovery-checklist.md)
- [GSC week 1 actions](gsc-week1-actions.md)
- [CRM noindex](crm-noindex.md)
