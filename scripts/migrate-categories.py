#!/usr/bin/env python3
"""Migrate blog categories to the 2026-06 structure and re-normalize tags."""

from __future__ import annotations

import pathlib
import sys

import yaml

# Reuse tag normalization from sibling script
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from normalize_tags import (  # noqa: E402
    ALLOWED_BY_CATEGORY,
    POST_OVERRIDES,
    dump_frontmatter,
    normalize_tags,
    parse_frontmatter,
)

REPO = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = REPO / "content" / "posts"
VAULT_PUBLISHED = pathlib.Path(
    r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\03 Published"
)

# Default rename when no slug-specific rule applies
CATEGORY_RENAME: dict[str, str] = {
    "AI & Technology": "AI & Building",
    "Commerce & Growth": "Commerce & Marketing",
    "Marketing & Media": "Commerce & Marketing",
    "Leadership": "Leadership & Delivery",
    "Ideas": "AI & Building",
}

# Split from AI & Technology → Enterprise AI
ENTERPRISE_AI_SLUGS: set[str] = {
    "getting-enterprise-ai-right-the-work-that-comes-before-deployment",
    "what-i-learned-directing-ai-as-my-primary-engineer",
    "is-saas-being-dismantled-by-ai",
    "is-salesforce-becoming-invisible-on-purpose-or-becoming-irrelevant",
    "ai-agent-quality-drift-detection",
    "gravio-multi-repo-rollout-playbook",
}


def target_category(slug: str, old_category: str) -> str:
    if slug in POST_OVERRIDES:
        old_cat, _ = POST_OVERRIDES[slug]
        # Overrides may still use legacy names — map them
        if old_cat in CATEGORY_RENAME:
            mapped = CATEGORY_RENAME[old_cat]
        else:
            mapped = old_cat
        if slug in ENTERPRISE_AI_SLUGS:
            return "Enterprise AI"
        return mapped

    if slug in ENTERPRISE_AI_SLUGS:
        return "Enterprise AI"

    return CATEGORY_RENAME.get(old_category, old_category)


def refresh_post_overrides() -> None:
    """Rewrite POST_OVERRIDES keys in normalize-tags to new category names."""
    mapping = {
        "Commerce & Growth": "Commerce & Marketing",
        "Marketing & Media": "Commerce & Marketing",
        "Leadership": "Leadership & Delivery",
        "AI & Technology": "AI & Building",
    }
    for slug, (cat, tags) in list(POST_OVERRIDES.items()):
        new_cat = mapping.get(cat, cat)
        if slug in ENTERPRISE_AI_SLUGS:
            new_cat = "Enterprise AI"
        POST_OVERRIDES[slug] = (new_cat, tags)


def process_file(path: pathlib.Path, dry_run: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    data, body = parse_frontmatter(text)
    slug = data.get("slug") or path.stem
    old_category = (data.get("category") or "").strip()
    old_tags = data.get("tags") or []

    category = target_category(slug, old_category)
    if slug in POST_OVERRIDES:
        _, new_tags = POST_OVERRIDES[slug]
        new_tags = normalize_tags(category, new_tags)
    else:
        new_tags = normalize_tags(category, old_tags if isinstance(old_tags, list) else [])

    if old_category == category and old_tags == new_tags:
        return False

    if not dry_run:
        data["category"] = category
        data["tags"] = new_tags
        path.write_text(dump_frontmatter(data, body), encoding="utf-8")

    print(f"{'[dry] ' if dry_run else ''}{path.name}")
    if old_category != category:
        print(f"  category: {old_category} -> {category}")
    if old_tags != new_tags:
        print(f"  tags: {old_tags} -> {new_tags}")
    return True


def main() -> int:
    refresh_post_overrides()
    dry_run = "--dry-run" in sys.argv
    changed = 0
    dirs = [POSTS_DIR]
    if VAULT_PUBLISHED.exists():
        dirs.append(VAULT_PUBLISHED)

    for directory in dirs:
        for path in sorted(directory.glob("*.md")):
            try:
                if process_file(path, dry_run):
                    changed += 1
            except Exception as exc:
                print(f"ERROR {path}: {exc}", file=sys.stderr)

    print(f"\n{'Would change' if dry_run else 'Changed'}: {changed} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
