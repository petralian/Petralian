# DEPRECATED (2026-06): superseded by scripts/normalize-tags.py and scripts/audit-taxonomy.py
# This script used the pre-2026 five-category taxonomy. Do not run.
Write-Error @"
update-taxonomy.ps1 is deprecated.

Use instead:
  python scripts/audit-taxonomy.py          # scan all folders, exit 1 on issues
  python scripts/normalize-tags.py --dry-run  # preview fixes
  python scripts/normalize-tags.py            # apply category + tag normalization

Canonical rules: Obsidian Blog/00 Writing Session Guide.md
"@
exit 1
