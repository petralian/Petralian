# Parametric SSOT (`data/`)

Machine-readable facts that must **not** drift in prose. Any agent or human can read these without Cursor.

## When to add a YAML file

- Two or more values depend on each other (env matrix, SEO limits, model defaults).
- Numbers have units and must not be rounded in chat.
- You have corrected the same fact twice — promote it here.

## Naming

`data/<domain>.yaml` — e.g. `seo-limits.yaml`, `build-constraints.yaml`, `harness-verify.yaml`.

## Minimal schema

```yaml
# data/example.yaml
schema_version: 1
updated: 2026-07-21
facts:
  - id: unique_id
    value: 160
    unit: chars
    applies_to: seo_description max length
    source: "content/posts frontmatter convention"
```

## Agent rule

1. Read relevant `data/*.yaml` before changing related markdown or code.
2. Update YAML **before** prose when the fact changes.
3. Grep consumers after edits.

## Portability

These files sync via git and open in Obsidian as plain text. They are **not** Cursor-specific.
