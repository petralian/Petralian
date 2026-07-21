#!/usr/bin/env python3
"""Sync image alts and attributions from vault markdown into content/posts."""
from __future__ import annotations

import re
from pathlib import Path

VAULT_PUBLISHED = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\03 Published")
VAULT_READY = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\02 Ready to publish")
VAULT_FOLDERS = (VAULT_PUBLISHED, VAULT_READY)
REPO_POSTS = Path(r"C:\Users\User\OneDrive\02 VS Code\Petralian\content\posts")

WIKI_RE = re.compile(r"!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]")
ATTR_RE = re.compile(r"^\*(?:Photo|Screenshot|Diagram|Source):", re.I)
IMG_MD_RE = re.compile(r"!\[([^\]]*)\]\((/images/posts/[^)]+)\)")


def split_frontmatter(text: str) -> tuple[dict[str, str], str, str]:
    m = re.match(r"^(---\n)(.*?)(\n---\n)", text, re.DOTALL)
    if not m:
        return {}, "", text
    fm: dict[str, str] = {}
    for line in m.group(2).splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip().strip("'\"")
    return fm, m.group(0), text[m.end() :]


def hero_alt_from_fm(fm: dict[str, str], title: str) -> str:
    if fm.get("featured_image_alt"):
        return fm["featured_image_alt"]
    prompt = fm.get("image_prompt", "")
    if prompt:
        # first sentence / clause, cap length
        alt = re.split(r"[.!?\n]", prompt)[0].strip()
        if len(alt) > 160:
            alt = alt[:157] + "..."
        return alt
    clean = re.sub(r"^#+\s*", "", title).strip()
    return f"Hero illustration for {clean}"


def extract_vault_images(body: str) -> dict[str, dict[str, str]]:
    """Map filename -> {alt, attribution} from vault body."""
    lines = body.splitlines()
    images: dict[str, dict[str, str]] = {}
    for i, line in enumerate(lines):
        m = WIKI_RE.search(line)
        if not m:
            continue
        fname = Path(m.group(1).strip()).name
        alt = (m.group(2) or "").strip()
        attribution = ""
        for j in range(i + 1, min(i + 4, len(lines))):
            candidate = lines[j].strip()
            if not candidate:
                continue
            if ATTR_RE.match(candidate):
                attribution = candidate
            break
        images[fname] = {"alt": alt, "attribution": attribution}
    return images


def set_fm_field(fm_block: str, key: str, value: str) -> str:
    """Insert or replace a single-line frontmatter field."""
    line = f"{key}: {value}"
    pattern = re.compile(rf"^{re.escape(key)}:.*$", re.M)
    if pattern.search(fm_block):
        return pattern.sub(line, fm_block, count=1)
    # insert before format/best_for if present, else before closing ---
    for anchor in ("format:", "best_for:", "related_posts:", "focus_keyword:"):
        m = re.search(rf"^{anchor}", fm_block, re.M)
        if m:
            return fm_block[: m.start()] + line + "\n" + fm_block[m.start() :]
    return fm_block.rstrip() + "\n" + line + "\n"


def yaml_quote(s: str) -> str:
    if not s or re.search(r'[:#\n"\']', s):
        return f'"{s.replace(chr(34), chr(92)+chr(34))}"'
    return s


def apply_repo_images(body: str, images: dict[str, dict[str, str]]) -> tuple[str, int]:
    changes = 0

    def repl_img(m: re.Match[str]) -> str:
        nonlocal changes
        alt, url = m.group(1), m.group(2)
        fname = Path(url).name
        meta = images.get(fname, {})
        new_alt = meta.get("alt") or alt
        block = f"![{new_alt}]({url})"
        attr = meta.get("attribution", "")
        if attr:
            block += f"\n\n{attr}"
        if new_alt != alt or attr:
            changes += 1
        return block

    # Replace bare images; skip if already has alt and next line is attribution
    new_lines: list[str] = []
    lines = body.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        m = IMG_MD_RE.match(line.strip())
        if m:
            fname = Path(m.group(2)).name
            meta = images.get(fname, {})
            alt = meta.get("alt") or m.group(1)
            url = m.group(2)
            new_lines.append(f"![{alt}]({url})")
            # attribution on next non-empty line?
            nxt = lines[i + 1].strip() if i + 1 < len(lines) else ""
            nxt2 = lines[i + 2].strip() if i + 2 < len(lines) else ""
            attr = meta.get("attribution", "")
            if ATTR_RE.match(nxt):
                new_lines.append("")
                new_lines.append(nxt)
                i += 1
            elif ATTR_RE.match(nxt2):
                new_lines.append("")
                new_lines.append(nxt2)
                i += 2
            elif attr:
                new_lines.append("")
                new_lines.append(attr)
                changes += 1
            if m.group(1) != alt:
                changes += 1
            i += 1
            continue
        new_lines.append(line)
        i += 1

    return "\n".join(new_lines) + ("\n" if body.endswith("\n") else ""), changes


def main() -> None:
    report: list[str] = []
    vault_updated = 0
    repo_updated = 0

    for vault_root in VAULT_FOLDERS:
        if not vault_root.is_dir():
            continue
        for vault_md in sorted(vault_root.glob("*.md")):
            slug = vault_md.stem
            vault_text = vault_md.read_text(encoding="utf-8")
            fm, fm_raw, vault_body = split_frontmatter(vault_text)
            title = fm.get("title", slug)
            images = extract_vault_images(vault_body)

            # Ensure vault featured_image_alt
            if not re.search(r"^featured_image_alt:\s*.+$", vault_text, re.M):
                alt = hero_alt_from_fm(fm, title)
                new_fm_raw = set_fm_field(
                    fm_raw,
                    "featured_image_alt",
                    yaml_quote(alt),
                )
                vault_text = new_fm_raw + vault_body
                vault_md.write_text(vault_text, encoding="utf-8", newline="\n")
                vault_updated += 1
                fm["featured_image_alt"] = alt
                report.append(f"VAULT alt: {slug}")

            repo_md = REPO_POSTS / f"{slug}.md"
            if not repo_md.is_file():
                continue

            repo_text = repo_md.read_text(encoding="utf-8")
            repo_fm, repo_fm_raw, repo_body = split_frontmatter(repo_text)
            new_body, img_changes = apply_repo_images(repo_body, images)

            hero_alt = fm.get("featured_image_alt") or hero_alt_from_fm(fm, title)
            new_repo_fm_raw = repo_fm_raw
            if not re.search(r"^featured_image_alt:\s*.+$", repo_text, re.M):
                new_repo_fm_raw = set_fm_field(
                    repo_fm_raw,
                    "featured_image_alt",
                    yaml_quote(hero_alt),
                )

            new_repo = new_repo_fm_raw + new_body
            if new_repo != repo_text:
                repo_md.write_text(new_repo, encoding="utf-8", newline="\n")
                repo_updated += 1
                parts = [f"REPO: {slug}"]
                if img_changes:
                    parts.append(f"{img_changes} img")
                if new_repo_fm_raw != repo_fm_raw:
                    parts.append("hero alt")
                report.append(" | ".join(parts))

    out = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Operations\Article Image Fix Log.md")
    out.write_text(
        "# Article image fix log\n\n"
        f"**Vault featured_image_alt added:** {vault_updated}\n"
        f"**Repo posts updated:** {repo_updated}\n\n"
        "## Changes\n\n"
        + "\n".join(f"- {line}" for line in report)
        + "\n",
        encoding="utf-8",
    )
    print(f"Vault FM updates: {vault_updated}")
    print(f"Repo updates: {repo_updated}")
    print(f"Log: {out}")


if __name__ == "__main__":
    main()
