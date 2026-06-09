#!/usr/bin/env python3
"""Audit category/tag taxonomy across repo posts and Obsidian vault folders."""

from __future__ import annotations

import importlib.util
import pathlib
import sys

import yaml

_SCRIPTS = pathlib.Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location(
    "normalize_tags", _SCRIPTS / "normalize-tags.py"
)
_normalize = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_normalize)

ALLOWED_BY_CATEGORY = _normalize.ALLOWED_BY_CATEGORY
CATEGORY_RENAME = _normalize.CATEGORY_RENAME
MAX_TAGS_PER_POST = _normalize.MAX_TAGS_PER_POST
POSTS_DIR = _normalize.POSTS_DIR
VAULT_DRAFTS = _normalize.VAULT_DRAFTS
VAULT_PUBLISHED = _normalize.VAULT_PUBLISHED
VAULT_READY = _normalize.VAULT_READY
resolve_category = _normalize.resolve_category

VALID_CATEGORIES = set(ALLOWED_BY_CATEGORY)
MIN_TAGS_DRAFT = 3

SCAN_DIRS: list[tuple[str, pathlib.Path, bool]] = [
    ("content/posts", POSTS_DIR, False),
    ("vault/03 Published", VAULT_PUBLISHED, False),
    ("vault/01 Drafts", VAULT_DRAFTS, True),
    ("vault/02 Ready", VAULT_READY, True),
]


def parse_frontmatter(path: pathlib.Path) -> dict | None:
    raw = path.read_text(encoding="utf-8", errors="replace")
    parts = raw.split("---", 2)
    if len(parts) < 3:
        return None
    return yaml.safe_load(parts[1]) or {}


def tag_list(data: dict) -> list[str]:
    tags = data.get("tags") or []
    if isinstance(tags, str):
        return [tags]
    return [str(t) for t in tags if t]


def audit_file(bucket: str, path: pathlib.Path, is_draft: bool) -> list[str]:
    issues: list[str] = []
    data = parse_frontmatter(path)
    if data is None:
        return [f"{bucket}/{path.name}: missing frontmatter"]

    slug = data.get("slug") or path.stem
    category = (data.get("category") or "").strip()
    tags = tag_list(data)
    expected = resolve_category(slug, category)

    if category not in VALID_CATEGORIES:
        issues.append(
            f"{bucket}/{path.name}: legacy/invalid category '{category}' "
            f"(expected '{expected}')"
        )

    norm_cat = expected if category not in VALID_CATEGORIES else category
    allowed = set(ALLOWED_BY_CATEGORY.get(norm_cat, []))
    bad_tags = [t for t in tags if t not in allowed]
    if bad_tags:
        issues.append(
            f"{bucket}/{path.name}: tags not in {norm_cat} vocab: {bad_tags}"
        )

    if not tags:
        issues.append(f"{bucket}/{path.name}: empty tags")
    elif is_draft and len(tags) < MIN_TAGS_DRAFT:
        issues.append(
            f"{bucket}/{path.name}: only {len(tags)} tag(s) (want {MIN_TAGS_DRAFT}-5)"
        )
    elif len(tags) > MAX_TAGS_PER_POST:
        issues.append(
            f"{bucket}/{path.name}: {len(tags)} tags (max {MAX_TAGS_PER_POST})"
        )

    return issues


def audit_drift() -> list[str]:
    issues: list[str] = []
    if not VAULT_PUBLISHED.exists() or not POSTS_DIR.exists():
        return issues

    vault_by_stem = {p.stem: p for p in VAULT_PUBLISHED.glob("*.md")}
    for repo_path in sorted(POSTS_DIR.glob("*.md")):
        stem = repo_path.stem
        vault_path = vault_by_stem.get(stem)
        if not vault_path:
            continue
        repo_data = parse_frontmatter(repo_path) or {}
        vault_data = parse_frontmatter(vault_path) or {}
        repo_cat = (repo_data.get("category") or "").strip()
        vault_cat = (vault_data.get("category") or "").strip()
        repo_tags = tag_list(repo_data)
        vault_tags = tag_list(vault_data)
        if repo_cat != vault_cat or repo_tags != vault_tags:
            issues.append(
                f"drift/{stem}: repo cat={repo_cat!r} tags={repo_tags} "
                f"!= vault cat={vault_cat!r} tags={vault_tags}"
            )
    return issues


def summarize_counts() -> None:
    cats: dict[str, int] = {}
    tags: dict[str, int] = {}
    for _, directory, _ in SCAN_DIRS[:2]:
        if not directory.exists():
            continue
        for path in directory.glob("*.md"):
            data = parse_frontmatter(path) or {}
            c = (data.get("category") or "").strip()
            if c:
                cats[c] = cats.get(c, 0) + 1
            for t in tag_list(data):
                tags[t] = tags.get(t, 0) + 1

    print("SUMMARY (live posts + vault published)")
    print(f"  categories: {dict(sorted(cats.items(), key=lambda x: -x[1]))}")
    print(f"  unique tags: {len(tags)}")


def main() -> int:
    all_issues: list[str] = []

    for label, directory, is_draft in SCAN_DIRS:
        if not directory.exists():
            print(f"SKIP {label}: {directory} not found", file=sys.stderr)
            continue
        for path in sorted(directory.glob("*.md")):
            all_issues.extend(audit_file(label, path, is_draft))

    all_issues.extend(audit_drift())

    if all_issues:
        print(f"ISSUES ({len(all_issues)}):")
        for issue in all_issues:
            print(f"  - {issue}")
    else:
        print("OK: no taxonomy issues found")

    summarize_counts()
    return 1 if all_issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
