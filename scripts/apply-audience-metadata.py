#!/usr/bin/env python3
"""Apply format + best_for frontmatter to published posts (repo + vault)."""

from __future__ import annotations

import json
import pathlib
import sys

import yaml

REPO = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = REPO / "content" / "posts"
META_FILE = pathlib.Path(__file__).resolve().parent / "audience-metadata.json"
_VAULT_ROOT = pathlib.Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog")
VAULT_PUBLISHED = _VAULT_ROOT / "03 Published"

VALID_FORMATS = frozenset({"strategic", "hands-on", "hybrid"})


def parse_frontmatter(text: str) -> tuple[dict, str]:
    parts = text.split("---", 2)
    if len(parts) < 3:
        raise ValueError("Missing frontmatter")
    return yaml.safe_load(parts[1]) or {}, parts[2]


def dump_frontmatter(data: dict, body: str) -> str:
    dumped = yaml.dump(data, default_flow_style=False, allow_unicode=True, sort_keys=False)
    return f"---\n{dumped}---{body}"


def apply_file(path: pathlib.Path, meta: dict[str, dict], dry_run: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    data, body = parse_frontmatter(text)
    slug = data.get("slug") or path.stem
    if slug not in meta:
        print(f"SKIP {path.name}: no audience metadata", file=sys.stderr)
        return False

    entry = meta[slug]
    new_format = entry["format"]
    new_best_for = entry["best_for"]
    if new_format not in VALID_FORMATS:
        raise ValueError(f"{slug}: invalid format {new_format!r}")

    old_format = data.get("format") or ""
    old_best_for = data.get("best_for") or ""
    if old_format == new_format and old_best_for == new_best_for:
        return False

    if not dry_run:
        data["format"] = new_format
        data["best_for"] = new_best_for
        path.write_text(dump_frontmatter(data, body), encoding="utf-8")

    print(f"{'[dry] ' if dry_run else ''}{path.name}")
    print(f"  format: {old_format or '(none)'} -> {new_format}")
    print(f"  best_for: {old_best_for[:50] + '…' if len(old_best_for) > 50 else old_best_for or '(none)'}")
    print(f"         -> {new_best_for}")
    return True


def main() -> int:
    dry_run = "--dry-run" in sys.argv
    meta: dict[str, dict] = json.loads(META_FILE.read_text(encoding="utf-8"))
    changed = 0
    dirs = [POSTS_DIR]
    if VAULT_PUBLISHED.exists():
        dirs.append(VAULT_PUBLISHED)

    for directory in dirs:
        for path in sorted(directory.glob("*.md")):
            try:
                if apply_file(path, meta, dry_run):
                    changed += 1
            except Exception as exc:
                print(f"ERROR {path}: {exc}", file=sys.stderr)

    print(f"\n{'Would change' if dry_run else 'Changed'}: {changed} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
