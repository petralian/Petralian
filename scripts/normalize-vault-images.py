#!/usr/bin/env python3
"""Normalize vault images into stage-specific Attachments folders.

Published articles  -> Blog/03 Published/Attachments/
Ready drafts        -> Blog/02 Ready to publish/Attachments/ (or article folder for preflight)

Also picks up legacy files in Blog/00 Attachments/.

Usage:
  python scripts/normalize-vault-images.py
  python scripts/normalize-vault-images.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VAULT = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog")
READY = VAULT / "02 Ready to publish"
PUBLISHED = VAULT / "03 Published"
LEGACY = VAULT / "00 Attachments"
REPO_IMAGES = ROOT / "public" / "images" / "posts"
OVERRIDES_PATH = ROOT / "scripts" / "vault-image-overrides.json"
LOG_PATH = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Operations\Article Image Fix Log.md")

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"}
WIKI_RE = re.compile(r"!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]")
ATTR_RE = re.compile(r"^\*(?:Photo|Screenshot|Diagram|Source):.*\*?\s*$", re.I)
BAD_PREFIXES = ("pasted image ",)
BAD_EXACT = {"image.png", "image-1.png"}
ARTICLE_FOLDERS = (READY, PUBLISHED)

# Files to rename before article processing (old -> new)
GLOBAL_RENAMES: dict[str, str] = {
    "A_sleek_modern_hero_image_for_a_tech_blog_post_titled_Why_I_Rebuilt_Petralian_on_Next.js.png": "why-i-rebuilt-petralian-hero.png",
    "ai-seo-founders-digital-campaign-hero 1.jpg": "ai-seo-founders-digital-campaign-hero.jpg",
    "1_mnpMKUkNKiWUGGqGQYQcXg.png": "openclaw-vs-cursor-my-setup-2026-body-01-openclaw-memory-diagram.png",
}

# Pasted Obsidian names -> SEO body filenames (delete paste copy once SEO exists)
PASTE_ALIASES: dict[str, str] = {
    "Pasted image 20260721171850.png": "cursor-side-chats-parallel-agents-2026-body-01-side-chat-ui.png",
    "Pasted image 20260721173800.png": "n8n-vs-cursor-workflow-system-2026-body-02-agent-vs-microservices.png",
    "Pasted image 20260721174123.png": "grok-4-5-cursor-knowledge-work-2026-body-01-grok-announcement.png",
    "Pasted image 20260721174250.png": "grok-4-5-cursor-knowledge-work-2026-body-02-cursor-models-pricing.png",
    "Pasted image 20260721174506.png": "grok-4-5-cursor-knowledge-work-2026-body-03-cursor-evals-disclaimer.png",
    "Pasted image 20260721174617.png": "hermes-vs-cursor-my-setup-2026-body-01-hermes-homepage.png",
    "Pasted image 20260721175112.png": "hermes-vs-cursor-my-setup-2026-body-02-hermes-calendar.png",
    "Pasted image 20260721175358.png": "managed-agent-memory-vs-files-you-control-2026-body-02-vouch-obsidian-recall.png",
    "Pasted image 20260721175639.png": "managed-agent-memory-vs-files-you-control-2026-body-01-mem0-pricing.png",
    "Pasted image 20260721175950.png": "openclaw-vs-cursor-my-setup-2026-body-02-openclaw-deploy.png",
    "n8n-screenshot-readme.png": "n8n-vs-cursor-workflow-system-2026-body-01-n8n-readme.png",
}


def slug_short(slug: str, max_len: int = 40) -> str:
    return slug[:max_len].rstrip("-") if len(slug) > max_len else slug


def attach_dir_for(article_folder: Path) -> Path:
    return article_folder / "Attachments"


def is_bad_filename(name: str, slug: str) -> bool:
    lower = name.lower()
    if lower in BAD_EXACT:
        return True
    if any(lower.startswith(p) for p in BAD_PREFIXES):
        return True
    if re.fullmatch(r"\d+\.(jpe?g|png|gif|webp)", lower):
        return True
    if re.fullmatch(r"1_[A-Za-z0-9]+\.png", name):
        return True
    if name.startswith("A_sleek_") or name.startswith("A_"):
        return True
    if name.startswith(f"{slug}-body-") or name.startswith(f"{slug_short(slug)}-body-"):
        return False
    if name.endswith("-hero.png") or name.endswith("-hero.jpg") or "-hero." in lower:
        return False
    if " " in name and not name.lower().startswith("pexels-"):
        return True
    if name.startswith("media_"):
        return True
    return False


def search_roots(article_folder: Path | None = None) -> list[Path]:
    roots: list[Path] = []
    if article_folder:
        roots.extend([attach_dir_for(article_folder), article_folder])
    for base in (READY, PUBLISHED):
        roots.extend([attach_dir_for(base), base])
    if LEGACY.is_dir():
        roots.append(LEGACY)
    return roots


def find_image(name: str, article_folder: Path | None = None) -> Path | None:
    for base in search_roots(article_folder):
        p = base / name
        if p.is_file() and p.stat().st_size > 0:
            return p
    repo = REPO_IMAGES / name
    if repo.is_file() and repo.stat().st_size > 0:
        return repo
    return None


def place_image(src: Path, dest_name: str, dest_dir: Path, dry_run: bool) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / dest_name
    if src.resolve() == dest.resolve():
        return dest
    if not dry_run:
        if dest.exists():
            dest.unlink()
        if src.parent.resolve() == dest_dir.resolve():
            src.rename(dest)
        else:
            shutil.copy2(src, dest)
            try:
                src.unlink()
            except OSError:
                pass
    return dest


def apply_global_renames(dry_run: bool) -> list[str]:
    log: list[str] = []
    for old, new in GLOBAL_RENAMES.items():
        src = find_image(old)
        if not src:
            continue
        existing = find_image(new)
        if existing and existing.stat().st_size > 0:
            if not dry_run:
                try:
                    src.unlink()
                except OSError:
                    pass
            log.append(f"global: removed duplicate {old}")
        else:
            parent = src.parent
            if not dry_run:
                dest = parent / new
                if dest.exists():
                    dest.unlink()
                src.rename(dest)
            log.append(f"global: rename {old} -> {new}")
    return log


def remove_paste_duplicates(dry_run: bool) -> list[str]:
    log: list[str] = []
    for pasted, seo in PASTE_ALIASES.items():
        pasted_path = find_image(pasted)
        seo_path = find_image(seo)
        if pasted_path and seo_path and pasted_path != seo_path:
            if not dry_run:
                try:
                    pasted_path.unlink()
                except OSError:
                    pass
            log.append(f"removed pasted duplicate: {pasted}")
    return log


def collect_refs(text: str) -> set[str]:
    refs: set[str] = set()
    fm = re.match(r"^---\n.*?\n---\n", text, re.DOTALL)
    body = text[fm.end() :] if fm else text
    for m in WIKI_RE.finditer(body):
        refs.add(Path(m.group(1).strip()).name)
    m = re.search(r"(?m)^featured_image:\s*(.+)$", text)
    if m:
        val = m.group(1).strip().strip("'\"")
        val = re.sub(r"^\[\[|\]\]$", "", val)
        if val and not val.startswith(("http", "/")):
            refs.add(Path(val).name)
    return refs


def pexels_attribution(filename: str) -> str:
    m = re.match(r"^pexels-(.+)-(\d+)\.(jpe?g|png|webp)$", filename, re.I)
    if not m:
        return ""
    author_slug, photo_id = m.group(1), m.group(2)
    parts = author_slug.split("-")
    if len(parts) > 1 and parts[-1].isdigit() and len(parts[-1]) > 6:
        author_slug = "-".join(parts[:-1])
    author_name = " ".join(p.title() for p in author_slug.split("-"))
    return f"*Photo: [{author_name}](https://www.pexels.com/photo/{photo_id}/) on Pexels*"


def default_attribution(filename: str, slug: str) -> str:
    pex = pexels_attribution(filename)
    if pex:
        return pex
    lower = filename.lower()
    if "cursorbench" in lower:
        return "*Screenshot: [CursorBench](https://cursor.com/cursorbench) — Petralian (2026)*"
    if "cursor" in slug or "cursor" in lower:
        return "*Screenshot: Petralian / Cursor (2026)*"
    if "lighthouse" in slug:
        return "*Screenshot: Petralian / Chrome DevTools (2026)*"
    if "obsidian" in lower:
        return "*Screenshot: Petralian / Obsidian (2026)*"
    return "*Screenshot: Petralian (2026)*"


def descriptor_from_context(before: str, after: str, seq: int) -> str:
    chunk = (before[-200:] + " " + after[:200]).lower()
    for needle, label in [
        ("cursorbench", "cursorbench"),
        ("leaderboard", "leaderboard"),
        ("lighthouse", "lighthouse"),
        ("github", "github-actions"),
        ("hook", "hooks"),
        ("bridge", "bridge"),
        ("google", "google-search"),
        ("footer", "footer"),
    ]:
        if needle in chunk:
            return f"{seq:02d}-{label}"
    return f"{seq:02d}-figure"


def load_overrides() -> dict:
    if OVERRIDES_PATH.is_file():
        return json.loads(OVERRIDES_PATH.read_text(encoding="utf-8"))
    return {}


def normalize_featured(fm: str, slug: str, overrides: dict) -> tuple[str, list[str]]:
    log: list[str] = []
    feat = overrides.get(slug, {}).get("__featured__")
    if feat:
        wiki = feat.get("wiki", "")
        alt = feat.get("alt")
        fm = re.sub(r"(?m)^featured_image:\s*.+$", f"featured_image: '{wiki}'", fm, count=1)
        if alt:
            if re.search(r"(?m)^featured_image_alt:", fm):
                fm = re.sub(r"(?m)^featured_image_alt:.*$", f'featured_image_alt: "{alt}"', fm, count=1)
            else:
                fm = re.sub(r"(?m)^(featured_image:.+)$", rf'\1\nfeatured_image_alt: "{alt}"', fm, count=1)
        log.append(f"{slug}: featured_image -> {wiki}")
        return fm, log

    def repl(m: re.Match[str]) -> str:
        val = m.group(1).strip().strip("'\"")
        if val.startswith("http") or val.startswith("[["):
            return m.group(0)
        if val.startswith("/images/posts/"):
            fname = Path(val).name
            log.append(f"{slug}: featured_image -> wiki [[{fname}]]")
            return f"featured_image: '[[{fname}]]'"
        if " " in val:
            clean = GLOBAL_RENAMES.get(val) or val.replace(" 1", "").strip()
            if find_image(clean):
                log.append(f"{slug}: featured_image fix -> [[{clean}]]")
                return f"featured_image: '[[{clean}]]'"
        if val and "/" not in val:
            clean = GLOBAL_RENAMES.get(val, val)
            return f"featured_image: '[[{clean}]]'"
        return m.group(0)

    fm = re.sub(r"(?m)^featured_image:\s*(.+)$", repl, fm)
    return fm, log


def extract_existing_attribution(lines: list[str], img_idx: int) -> str:
    for j in range(img_idx + 1, min(img_idx + 4, len(lines))):
        s = lines[j].strip()
        if ATTR_RE.match(s):
            return s
        if s and not s.startswith("!"):
            break
    return ""


def rebuild_body_images(
    text: str,
    slug: str,
    article_folder: Path,
    overrides: dict,
    dry_run: bool,
) -> tuple[str, list[str]]:
    log: list[str] = []
    dest_dir = attach_dir_for(article_folder)
    lines = text.splitlines()
    out: list[str] = []
    slug_over = overrides.get(slug, {})
    seq = 0
    i = 0

    while i < len(lines):
        line = lines[i]
        m = WIKI_RE.match(line.strip())
        if not m:
            out.append(line)
            i += 1
            continue

        old_name = Path(m.group(1).strip()).name
        if Path(old_name).suffix.lower() not in IMAGE_EXT:
            out.append(line)
            i += 1
            continue

        seq += 1
        o = slug_over.get(old_name, {})
        alt = o.get("alt") or (m.group(2) or "").strip() or f"Illustration for {slug.replace('-', ' ')}."
        existing_attr = extract_existing_attribution(lines, i)
        attribution = o.get("attribution") or existing_attr or default_attribution(old_name, slug)

        new_name = o.get("new") or PASTE_ALIASES.get(old_name)
        if not new_name:
            if is_bad_filename(old_name, slug):
                desc = descriptor_from_context("\n".join(out), "\n".join(lines[i + 1 :]), seq)
                new_name = f"{slug_short(slug)}-body-{desc}{Path(old_name).suffix}"
            else:
                new_name = old_name

        src = find_image(old_name, article_folder) or find_image(new_name, article_folder)
        if src:
            if new_name != old_name:
                log.append(f"{slug}: rename {old_name} -> {new_name}")
            place_image(src, new_name, dest_dir, dry_run)
        else:
            log.append(f"WARN {slug}: missing {old_name}")

        out.append(f"![[{new_name}|{alt}]]")
        out.append(attribution if attribution.startswith("*") else f"*{attribution.strip('*')}*")
        out.append("")

        i += 1
        while i < len(lines):
            s = lines[i].strip()
            if not s or ATTR_RE.match(s) or s.startswith("(Photo:") or s.startswith("(https"):
                i += 1
                continue
            break

    return "\n".join(out).rstrip() + "\n", log


def relocate_article_images(md_path: Path, dry_run: bool) -> list[str]:
    """Move all referenced images into the article stage Attachments folder."""
    log: list[str] = []
    text = md_path.read_text(encoding="utf-8")
    dest_dir = attach_dir_for(md_path.parent)
    for name in collect_refs(text):
        if name in PASTE_ALIASES:
            name = PASTE_ALIASES[name]
        src = find_image(name, md_path.parent)
        if not src:
            continue
        dest = dest_dir / name
        if src.resolve() != dest.resolve():
            place_image(src, name, dest_dir, dry_run)
            log.append(f"relocate {name} -> {dest_dir.name}/")
    return log


def normalize_article(md_path: Path, overrides: dict, dry_run: bool) -> list[str]:
    slug = md_path.stem
    text = md_path.read_text(encoding="utf-8")
    orig = text
    log: list[str] = []

    m = re.match(r"^(---\n.*?\n---\n)(.*)$", text, re.DOTALL)
    if not m:
        return log
    fm, body = m.group(1), m.group(2)

    fm, fl = normalize_featured(fm, slug, overrides)
    log.extend(fl)
    body, bl = rebuild_body_images(body, slug, md_path.parent, overrides, dry_run)
    log.extend(bl)

    text = fm + body
    if text != orig and not dry_run:
        md_path.write_text(text, encoding="utf-8", newline="\n")

    log.extend(relocate_article_images(md_path, dry_run))
    return log


def cleanup_unreferenced_bad_files(dry_run: bool) -> list[str]:
    """Remove obvious junk with bad names not referenced by any article."""
    log: list[str] = []
    all_refs: set[str] = set()
    for folder in ARTICLE_FOLDERS:
        for md in folder.glob("*.md"):
            all_refs |= collect_refs(md.read_text(encoding="utf-8"))

    junk_names = ["2 1.jpg"]
    for name in junk_names:
        if name in all_refs:
            continue
        p = find_image(name)
        if p and not dry_run:
            try:
                p.unlink()
                log.append(f"deleted unreferenced junk: {name}")
            except OSError:
                pass
    return log


def scan_issues() -> list[str]:
    issues: list[str] = []
    for folder in ARTICLE_FOLDERS:
        for md in sorted(folder.glob("*.md")):
            slug = md.stem
            dest = attach_dir_for(folder)
            text = md.read_text(encoding="utf-8")
            for name in collect_refs(text):
                if is_bad_filename(name, slug):
                    issues.append(f"{slug}: bad filename {name}")
                if not find_image(name, md.parent) and not (dest / name).is_file():
                    issues.append(f"{slug}: missing {name}")
    return issues


def write_log(entries: list[str], issues: list[str], dry_run: bool) -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    body = "\n".join(
        [
            f"# Article Image Fix Log — {ts}",
            "",
            "**Reload Obsidian** after this run if images look broken (`Ctrl+R`).",
            "",
            "- **03 Published** images → `Blog/03 Published/Attachments/`",
            "- **02 Ready** images → `Blog/02 Ready to publish/Attachments/` (or article folder)",
            "- **00 Attachments** = legacy staging only (picked up on normalize)",
            "",
            f"**Actions:** {len(entries)} | **Issues:** {len(issues)}",
            "",
            "## Changes",
            "",
        ]
        + [f"- {e}" for e in entries]
        + (["", "## Remaining issues", ""] + [f"- {i}" for i in issues] if issues else [])
    )
    if not dry_run:
        LOG_PATH.write_text(body + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--preflight-only", action="store_true")
    args = parser.parse_args()

    if args.preflight_only:
        for issue in scan_issues():
            print(issue)
        return 0

    overrides = load_overrides()
    log: list[str] = []
    log.extend(apply_global_renames(args.dry_run))

    for folder in ARTICLE_FOLDERS:
        if not folder.is_dir():
            continue
        attach_dir_for(folder).mkdir(parents=True, exist_ok=True)
        for md in sorted(folder.glob("*.md")):
            log.extend(normalize_article(md, overrides, args.dry_run))

    log.extend(remove_paste_duplicates(args.dry_run))
    log.extend(cleanup_unreferenced_bad_files(args.dry_run))
    issues = scan_issues()
    write_log(log, issues, args.dry_run)

    print(f"Done. {len(log)} actions, {len(issues)} issues.")
    if issues:
        for i in issues[:15]:
            print(f"  {i}")
    if not args.dry_run:
        print("RELOAD OBSIDIAN after file moves.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
