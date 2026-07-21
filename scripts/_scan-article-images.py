#!/usr/bin/env python3
"""Scan vault posts for image/slug/attribution issues."""
from __future__ import annotations

import re
from collections import Counter, defaultdict
from pathlib import Path

VAULT = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\03 Published")
ATTACH = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\00 Attachments")
REPO = Path(r"C:\Users\User\OneDrive\02 VS Code\Petralian\content\posts")

WAVE1 = [
    "best-cursor-model-by-task-2026",
    "bringing-the-retail-mindset-to-finance-how-personalization-can-transform-banking-in-apac",
    "best-practices-for-founders-integrating-ai-and-seo-for-effective-digital-campaign-management",
    "is-cursor-only-for-developers",
    "external-memory-series-guide",
    "cursor-customize-one-agent-many-workflows-2026",
]

IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"}
WIKI_RE = re.compile(r"!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]")
MD_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
ATTR_RE = re.compile(r"^\*(?:Photo|Screenshot|Diagram):", re.I)


def parse_fm(text: str) -> dict[str, str]:
    m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    fm: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip().strip("'\"")
    return fm


def find_image(filename: str, article_folder: Path) -> Path | None:
    name = Path(filename).name
    for base in (
        article_folder,
        article_folder / "Attachments",
        ATTACH,
        VAULT / "Attachments",
    ):
        p = base / name
        if p.is_file():
            return p
    return None


def main() -> None:
    issues: list[tuple[str, str, str]] = []
    wave1_status: dict[str, dict] = {}
    articles_with_body_images: list[str] = []

    for md in sorted(VAULT.glob("*.md")):
        slug = md.stem
        text = md.read_text(encoding="utf-8")
        fm = parse_fm(text)
        fm_slug = fm.get("slug", "").strip("'\"") or slug
        fi = fm.get("featured_image", "")
        fi_alt = fm.get("featured_image_alt", "")

        if fm_slug != slug:
            issues.append((slug, "slug_mismatch", f"file={slug} yaml slug={fm_slug}"))

        fi_clean = re.sub(r"[\[\]]", "", fi)
        if fi_clean and not fi_clean.startswith("/"):
            expected = f"{slug}.png"
            if fi_clean not in (expected, f"{slug}.jpg", f"{slug}.jpeg", f"{slug}.webp"):
                issues.append((slug, "featured_image_name", fi_clean))

        if not fi_alt:
            issues.append((slug, "missing_featured_image_alt", ""))

        hero_candidates = list(VAULT.glob(f"{slug}.png")) + list(VAULT.glob(f"{slug}.jpg"))
        if not hero_candidates and not fi.startswith("/images/"):
            issues.append((slug, "missing_hero_file", fi_clean or "none"))

        wiki = WIKI_RE.findall(text)
        md_imgs = [(a, u) for a, u in MD_RE.findall(text) if not u.startswith("http")]

        if wiki or md_imgs:
            articles_with_body_images.append(slug)

        if slug in WAVE1:
            wave1_status[slug] = {
                "wiki": len(wiki),
                "md": len(md_imgs),
                "pasted": sum(1 for w, _ in wiki if "pasted" in w.lower()),
                "d2": "```d2" in text,
                "has_attr": bool(ATTR_RE.search(text)),
            }

        lines = text.splitlines()
        for i, line in enumerate(lines):
            wm = WIKI_RE.search(line)
            if not wm:
                continue
            fname, alt = wm.group(1), wm.group(2) or ""
            if "pasted" in fname.lower():
                issues.append((slug, "pasted_filename", fname))
            if not find_image(fname, md.parent):
                if Path(fname).suffix.lower() in IMG_EXT:
                    issues.append((slug, "missing_body_file", fname))
            # attribution: line after image
            next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
            if not ATTR_RE.match(next_line) and Path(fname).suffix.lower() in IMG_EXT:
                if "pasted" not in fname.lower() or True:
                    issues.append((slug, "missing_attribution", fname))

    print("=== WAVE 1 ===")
    for s in WAVE1:
        st = wave1_status.get(s, {})
        done = (
            st.get("wiki", 0) + st.get("md", 0) >= 1 or st.get("d2")
        ) and st.get("pasted", 0) == 0
        flag = "LIKELY DONE" if done else "INCOMPLETE"
        print(f"  [{flag}] {s}: {st}")

    print(f"\n=== Articles with body images ({len(articles_with_body_images)}) ===")
    for a in articles_with_body_images:
        print(f"  - {a}")

    print(f"\n=== Issues by type ===")
    by_type = Counter(t for _, t, _ in issues)
    for k, v in by_type.most_common():
        print(f"  {k}: {v}")

    print(f"\n=== All issues ({len(issues)}) ===")
    for slug, typ, detail in issues:
        print(f"  {slug} | {typ} | {detail}")


if __name__ == "__main__":
    main()
