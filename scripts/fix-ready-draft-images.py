#!/usr/bin/env python3
"""Rename pasted/hash body images in 02 Ready drafts; fix alts and attributions."""
from __future__ import annotations

import re
import shutil
from dataclasses import dataclass
from pathlib import Path

VAULT_READY = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\02 Ready to publish")
VAULT_ATTACH = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\00 Attachments")
VAULT_PUB_ATTACH = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\03 Published\Attachments")
REPO_POSTS = Path(r"C:\Users\User\OneDrive\02 VS Code\Petralian\content\posts")
REPO_IMAGES = Path(r"C:\Users\User\OneDrive\02 VS Code\Petralian\public\images\posts")
LOG_PATH = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Operations\Article Image Fix Log.md")

WIKI_RE = re.compile(r"!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]")
ATTR_RE = re.compile(r"^\*(?:Photo|Screenshot|Diagram|Source):", re.I)

ORPHAN_PASTED = [
    "Pasted image 20260721092537.png",
    "Pasted image 20260721092741.png",
    "Pasted image 20260721154709.png",
    "Pasted image 20260721154826.png",
    "Pasted image 20260721154936.png",
    "Pasted image 20260721155004.png",
    "Pasted image 20260721155049.png",
    "Pasted image 20260721163602.png",
    "Pasted image 20260721164007.png",
]


@dataclass
class ImageFix:
    old: str
    new: str
    alt: str
    attribution: str


ARTICLE_FIXES: dict[str, list[ImageFix]] = {
    "n8n-vs-cursor-workflow-system-2026.md": [
        ImageFix(
            "n8n-screenshot-readme.png",
            "n8n-vs-cursor-workflow-system-2026-body-01-n8n-readme.png",
            "n8n workflow automation README showing the node-based editor overview.",
            "*Screenshot: [n8n-io/n8n](https://github.com/n8n-io/n8n) README — Petralian (2026)*",
        ),
        ImageFix(
            "Pasted image 20260721173800.png",
            "n8n-vs-cursor-workflow-system-2026-body-02-agent-vs-microservices.png",
            "Diagram contrasting a single agent with a maze of microservices.",
            "*Diagram: Agent architecture illustration — Petralian (2026)*",
        ),
    ],
    "cursor-side-chats-parallel-agents-2026.md": [
        ImageFix(
            "Pasted image 20260721171850.png",
            "cursor-side-chats-parallel-agents-2026-body-01-side-chat-ui.png",
            "Cursor IDE showing a side chat branch alongside the main agent thread.",
            "*Screenshot: [Cursor](https://cursor.com/) side chat UI — Petralian (2026)*",
        ),
    ],
    "grok-4-5-cursor-knowledge-work-2026.md": [
        ImageFix(
            "Pasted image 20260721174123.png",
            "grok-4-5-cursor-knowledge-work-2026-body-01-grok-announcement.png",
            "xAI Grok 4.5 announcement page highlighting model capabilities.",
            "*Screenshot: [xAI Grok 4.5](https://x.ai/news/grok-4-5) — Petralian (2026)*",
        ),
        ImageFix(
            "Pasted image 20260721174250.png",
            "grok-4-5-cursor-knowledge-work-2026-body-02-cursor-models-pricing.png",
            "Cursor models and pricing documentation with tier comparison.",
            "*Screenshot: [Cursor models and pricing](https://cursor.com/docs/models-and-pricing) — Petralian (2026)*",
        ),
        ImageFix(
            "Pasted image 20260721174506.png",
            "grok-4-5-cursor-knowledge-work-2026-body-03-cursor-evals-disclaimer.png",
            "Cursor evals page disclaimer on benchmark training data overlap.",
            "*Screenshot: [Cursor evals](https://cursor.com/evals) — Petralian (2026)*",
        ),
    ],
    "hermes-vs-cursor-my-setup-2026.md": [
        ImageFix(
            "Pasted image 20260721174617.png",
            "hermes-vs-cursor-my-setup-2026-body-01-hermes-homepage.png",
            "Hermes agent product homepage with messaging and deployment overview.",
            "*Screenshot: [Hermes Agent](https://hermes-agent.nousresearch.com/) — Petralian (2026)*",
        ),
        ImageFix(
            "Pasted image 20260721175112.png",
            "hermes-vs-cursor-my-setup-2026-body-02-hermes-calendar.png",
            "Hermes Telegram conversation adding World Cup matches to a calendar.",
            "*Screenshot: Petralian Hermes instance (Telegram) — Petralian (2026)*",
        ),
    ],
    "managed-agent-memory-vs-files-you-control-2026.md": [
        ImageFix(
            "Pasted image 20260721175639.png",
            "managed-agent-memory-vs-files-you-control-2026-body-01-mem0-pricing.png",
            "Mem0 managed memory pricing tiers for projects and API usage.",
            "*Screenshot: [Mem0 pricing](https://mem0.ai/pricing) — Petralian (2026)*",
        ),
        ImageFix(
            "Pasted image 20260721175358.png",
            "managed-agent-memory-vs-files-you-control-2026-body-02-vouch-obsidian-recall.png",
            "Vouch Obsidian vault graph linking session notes to git commits.",
            "*Screenshot: Petralian Vouch Obsidian vault — Petralian (2026)*",
        ),
    ],
    "openclaw-vs-cursor-my-setup-2026.md": [
        ImageFix(
            "1_mnpMKUkNKiWUGGqGQYQcXg.png",
            "openclaw-vs-cursor-my-setup-2026-body-01-openclaw-memory-diagram.png",
            "Diagram explaining how OpenClaw local memory layers connect to skills.",
            "*Diagram: [How OpenClaw memory works](https://medium.com/@databytoufik/how-openclaw-memory-works-802bd8465b1a) — Petralian (2026)*",
        ),
        ImageFix(
            "Pasted image 20260721175950.png",
            "openclaw-vs-cursor-my-setup-2026-body-02-openclaw-deploy.png",
            "OpenClaw deployment guide showing local agent OS setup steps.",
            "*Screenshot: [OpenClaw deploy guide](https://open-claw.org/posts/openclaw-deploy) — Petralian (2026)*",
        ),
    ],
}

HERO_ALTS: dict[str, str] = {
    "n8n-vs-cursor-workflow-system-2026.md": (
        "Industrial conveyor belts move scheduled packets while a lit desk handles one open folder for judgment work."
    ),
    "cursor-side-chats-parallel-agents-2026.md": (
        "Main conversation path on a desk with two thinner side channels branching off like tributaries."
    ),
    "grok-4-5-cursor-knowledge-work-2026.md": (
        "Research papers on a desk morphing into a single clean brief stack under a desk lamp."
    ),
    "hermes-vs-cursor-my-setup-2026.md": (
        "Phone on a kitchen counter with message bubbles and a desk with open document folders in the background."
    ),
    "managed-agent-memory-vs-files-you-control-2026.md": (
        "Automatic memory carousel beside open wooden drawers of markdown files connected by a beam of light."
    ),
    "openclaw-vs-cursor-my-setup-2026.md": (
        "Smartphone with chat glow on an armrest and a laptop displaying a folder tree on a table."
    ),
}


def attach_dirs() -> list[Path]:
    return [
        VAULT_READY / "Attachments",
        VAULT_ATTACH,
    ]


def find_image(name: str) -> Path | None:
    for d in attach_dirs():
        p = d / name
        if p.is_file():
            return p
    return None


def rename_and_publish(fix: ImageFix, log: list[str]) -> Path | None:
    src = find_image(fix.old)
    if not src:
        log.append(f"MISSING file: {fix.old}")
        return None
    dst_local = src.parent / fix.new
    if src != dst_local:
        if dst_local.exists():
            dst_local.unlink()
        src.rename(dst_local)
        log.append(f"RENAMED: {fix.old} → {fix.new}")
    else:
        log.append(f"KEEP name: {fix.new}")

    VAULT_ATTACH.mkdir(parents=True, exist_ok=True)
    central = VAULT_ATTACH / fix.new
    shutil.copy2(dst_local, central)
    REPO_IMAGES.mkdir(parents=True, exist_ok=True)
    shutil.copy2(dst_local, REPO_IMAGES / fix.new)
    log.append(f"COPIED → 00 Attachments + public/images/posts: {fix.new}")
    return dst_local


def replace_wiki_block(text: str, fix: ImageFix) -> str:
    old_wiki = re.compile(
        rf"!\[\[{re.escape(fix.old)}(?:\|[^\]]*)?\]\]\s*\n(?:\([^)]+\)\s*\n)?",
        re.MULTILINE,
    )
    new_block = (
        f"![[{fix.new}|{fix.alt}]]\n\n{fix.attribution}\n"
    )
    if old_wiki.search(text):
        return old_wiki.sub(new_block, text, count=1)

    # bare wiki without caption line
    bare = re.compile(rf"!\[\[{re.escape(fix.old)}(?:\|[^\]]*)?\]\]")
    return bare.sub(f"![[{fix.new}|{fix.alt}]]\n\n{fix.attribution}", text, count=1)


def ensure_hero_alt(fm_block: str, article: str) -> str:
    alt = HERO_ALTS.get(article)
    if not alt:
        return fm_block
    if re.search(r"^featured_image_alt:", fm_block, re.M):
        return re.sub(
            r"^featured_image_alt:.*$",
            f'featured_image_alt: "{alt}"',
            fm_block,
            count=1,
            flags=re.M,
        )
    return fm_block.rstrip() + f'\nfeatured_image_alt: "{alt}"\n'


def sync_repo_post(slug: str, vault_body: str, fm_block: str) -> None:
    repo_path = REPO_POSTS / f"{slug}.md"
    if not repo_path.is_file():
        return

    body = vault_body
    for m in WIKI_RE.finditer(vault_body):
        fname = Path(m.group(1).strip()).name
        alt = (m.group(2) or "").strip()
        block = f"![{alt}](/images/posts/{fname})"
        # attribution after wiki embed
        lines = vault_body.splitlines()
        for i, line in enumerate(lines):
            if m.group(0) in line:
                for j in range(i + 1, min(i + 4, len(lines))):
                    cand = lines[j].strip()
                    if ATTR_RE.match(cand):
                        block += f"\n\n{cand}"
                        break
                break
        body = body.replace(m.group(0), block, 1)

    repo_path.write_text(fm_block + body, encoding="utf-8")


def delete_orphans(log: list[str]) -> None:
    for name in ORPHAN_PASTED:
        for folder in [VAULT_READY / "Attachments", VAULT_PUB_ATTACH]:
            p = folder / name
            if p.is_file():
                p.unlink()
                log.append(f"DELETED orphan: {folder.name}/{name}")


def main() -> None:
    log: list[str] = []
    log.append("# Article Image Fix Log — 2026-07-21\n")
    log.append("**Status:** Vault + local repo staged — **not committed or pushed** (awaiting approval).\n")

    for article, fixes in ARTICLE_FIXES.items():
        md_path = VAULT_READY / article
        if not md_path.is_file():
            log.append(f"\n## SKIP missing article: {article}")
            continue
        log.append(f"\n## {article}\n")
        text = md_path.read_text(encoding="utf-8")
        m = re.match(r"^(---\n.*?\n---\n)", text, re.DOTALL)
        if not m:
            log.append("  ERROR: no frontmatter")
            continue
        fm_block = m.group(1)
        body = text[m.end() :]

        for fix in fixes:
            rename_and_publish(fix, log)
            body = replace_wiki_block(body, fix)
            log.append(f"  MD: ![[{fix.new}|…]] + attribution")

        fm_block = ensure_hero_alt(fm_block, article)
        md_path.write_text(fm_block + body, encoding="utf-8")

        slug_m = re.search(r"^slug:\s*(.+)$", fm_block, re.M)
        slug = slug_m.group(1).strip() if slug_m else md_path.stem
        sync_repo_post(slug, body, fm_block)
        log.append(f"  REPO: content/posts/{slug}.md updated")

    delete_orphans(log)

    log.append("\n## Orphans removed\n")
    for name in ORPHAN_PASTED:
        log.append(f"- {name}")

    log.append("\n## Summary table\n")
    log.append("| Article | Old filename | New SEO filename |")
    log.append("|---------|--------------|------------------|")
    for article, fixes in ARTICLE_FIXES.items():
        slug = article.replace(".md", "")
        for fix in fixes:
            log.append(f"| {slug} | `{fix.old}` | `{fix.new}` |")

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text("\n".join(log) + "\n", encoding="utf-8")
    print(f"Wrote {LOG_PATH}")
    for line in log:
        if line.startswith(("RENAMED", "DELETED", "MISSING", "REPO")):
            print(line)


if __name__ == "__main__":
    main()
