#!/usr/bin/env python3
"""Fix caption spacing, restore personality notes, and heal image paths."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

READY = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\02 Ready to publish")
ATTACH = READY / "Attachments"
CENTRAL = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\00 Attachments")
REPO_POSTS = Path(r"C:\Users\User\OneDrive\02 VS Code\Petralian\content\posts")
REPO_IMAGES = Path(r"C:\Users\User\OneDrive\02 VS Code\Petralian\public\images\posts")

# Restore copies at old Obsidian paste names so empty stubs get overwritten on sync.
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
    "1_mnpMKUkNKiWUGGqGQYQcXg.png": "openclaw-vs-cursor-my-setup-2026-body-01-openclaw-memory-diagram.png",
    "n8n-screenshot-readme.png": "n8n-vs-cursor-workflow-system-2026-body-01-n8n-readme.png",
}

# filename -> full caption line (no leading * — we add)
CAPTIONS: dict[str, str] = {
    "n8n-vs-cursor-workflow-system-2026-body-01-n8n-readme.png": (
        "Screenshot: [n8n-io/n8n](https://github.com/n8n-io/n8n) README — Petralian (2026)"
    ),
    "n8n-vs-cursor-workflow-system-2026-body-02-agent-vs-microservices.png": (
        "Diagram: Agent architecture illustration — Petralian (2026)"
    ),
    "cursor-side-chats-parallel-agents-2026-body-01-side-chat-ui.png": (
        "Screenshot: [Cursor](https://cursor.com/) side chat UI — Petralian (2026)"
    ),
    "grok-4-5-cursor-knowledge-work-2026-body-01-grok-announcement.png": (
        "Screenshot: [xAI Grok 4.5](https://x.ai/news/grok-4-5) — Petralian (2026); "
        "Grok is actually quite clever…"
    ),
    "grok-4-5-cursor-knowledge-work-2026-body-02-cursor-models-pricing.png": (
        "Screenshot: [Cursor models and pricing](https://cursor.com/docs/models-and-pricing) — "
        "Petralian (2026); …and 5× cheaper as Fable 5"
    ),
    "grok-4-5-cursor-knowledge-work-2026-body-03-cursor-evals-disclaimer.png": (
        "Screenshot: [Cursor evals](https://cursor.com/evals) — Petralian (2026)"
    ),
    "hermes-vs-cursor-my-setup-2026-body-01-hermes-homepage.png": (
        "Screenshot: [Hermes Agent](https://hermes-agent.nousresearch.com/) — Petralian (2026); "
        "can you be any more bold?"
    ),
    "hermes-vs-cursor-my-setup-2026-body-02-hermes-calendar.png": (
        "Screenshot: Petralian Hermes instance (Telegram) — Petralian (2026); "
        "Add all World Cup matches to my calendar"
    ),
    "managed-agent-memory-vs-files-you-control-2026-body-01-mem0-pricing.png": (
        "Screenshot: [Mem0 pricing](https://mem0.ai/pricing) — Petralian (2026); "
        "Free until you do more as one project… and I think everyone does more as one project… "
        "so find better options"
    ),
    "managed-agent-memory-vs-files-you-control-2026-body-02-vouch-obsidian-recall.png": (
        "Screenshot: Petralian Vouch Obsidian vault — Petralian (2026); "
        "Total recall on what we did, linked to commits"
    ),
    "openclaw-vs-cursor-my-setup-2026-body-01-openclaw-memory-diagram.png": (
        "Diagram: [How OpenClaw memory works](https://medium.com/@databytoufik/how-openclaw-memory-works-802bd8465b1a) — "
        "Petralian (2026)"
    ),
    "openclaw-vs-cursor-my-setup-2026-body-02-openclaw-deploy.png": (
        "Screenshot: [OpenClaw deploy guide](https://open-claw.org/posts/openclaw-deploy) — "
        "Petralian (2026); good if you do not mind one system having access to everything all at once"
    ),
}

WIKI_RE = re.compile(r"!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]")
ATTR_RE = re.compile(r"^\*(?:Photo|Screenshot|Diagram|Source):.*\*?\s*$", re.I)
HASH_IMG_RE = re.compile(r"!\[\[1_[A-Za-z0-9]+\.png\]\]\s*\n?", re.MULTILINE)


def publish_image(seo_name: str) -> None:
    src = ATTACH / seo_name
    if not src.is_file():
        return
    for dest_dir in (ATTACH, CENTRAL, READY, REPO_IMAGES):
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / seo_name
        if dest.resolve() == src.resolve():
            continue
        shutil.copy2(src, dest)
    for old_name, new_name in PASTE_ALIASES.items():
        if new_name == seo_name:
            for dest_dir in (ATTACH, CENTRAL):
                shutil.copy2(src, dest_dir / old_name)


def fix_article_body(body: str) -> str:
    lines = body.splitlines()
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = WIKI_RE.match(line.strip())
        if m:
            fname = Path(m.group(1).strip()).name
            out.append(line.strip())
            # skip blank lines and old caption lines after image
            j = i + 1
            while j < len(lines) and (not lines[j].strip() or ATTR_RE.match(lines[j].strip())):
                j += 1
            cap = CAPTIONS.get(fname)
            if cap:
                out.append(f"*{cap}*")
                out.append("")  # space AFTER caption
            i = j
            continue
        out.append(line)
        i += 1
    text = "\n".join(out)
    text = HASH_IMG_RE.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def vault_to_repo(md_path: Path, fm: str, body: str) -> None:
    slug_m = re.search(r"^slug:\s*(.+)$", fm, re.M)
    slug = slug_m.group(1).strip() if slug_m else md_path.stem
    repo_path = REPO_POSTS / f"{slug}.md"
    if not repo_path.is_file():
        return
    repo_body = body
    for m in WIKI_RE.finditer(body):
        fname = Path(m.group(1).strip()).name
        alt = (m.group(2) or "").strip()
        cap = CAPTIONS.get(fname, "")
        block = f"![{alt}](/images/posts/{fname})"
        if cap:
            block += f"\n*{cap}*\n"
        repo_body = repo_body.replace(m.group(0), block, 1)
    repo_path.write_text(fm + repo_body, encoding="utf-8")


def main() -> None:
    CENTRAL.mkdir(parents=True, exist_ok=True)
    for seo in set(PASTE_ALIASES.values()) | set(CAPTIONS.keys()):
        publish_image(seo)

    for md_path in sorted(READY.glob("*.md")):
        text = md_path.read_text(encoding="utf-8")
        m = re.match(r"^(---\n.*?\n---\n)(.*)$", text, re.DOTALL)
        if not m:
            continue
        fm, body = m.group(1), fix_article_body(m.group(2))
        md_path.write_text(fm + body, encoding="utf-8")
        vault_to_repo(md_path, fm, body)
        print(f"fixed {md_path.name}")

    # remove orphan hash file if not referenced
    orphan = ATTACH / "1_dBv0XTmyCfRElD7NBRMuEA.png"
    if orphan.is_file():
        orphan.unlink()
        print("removed orphan 1_dBv0XTmyCfRElD7NBRMuEA.png")

    print("done — images in Attachments/, article folder, 00 Attachments/, public/images/posts/")


if __name__ == "__main__":
    main()
