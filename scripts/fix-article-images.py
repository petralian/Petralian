#!/usr/bin/env python3
"""Rename vault body images, fix embeds, attributions, and featured_image paths."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

VAULT_PUBLISHED = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\03 Published")
ATTACH = VAULT_PUBLISHED / "Attachments"
READY_ATTACH = Path(
    r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\02 Ready to publish\Attachments"
)
HERO_ATTACH = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\00 Attachments")
REPO_POSTS = Path(__file__).resolve().parents[1] / "content" / "posts"

# old_filename -> (new_filename, alt_line, attribution_line)
# alt_line is italic description; attribution per Visual Enrichment Plan
IMAGE_MAP: dict[str, list[tuple[str, str, str, str]]] = {
    "best-cursor-model-by-task-2026": [
        (
            "Pasted image 20260721152900.png",
            "best-cursor-model-by-task-2026-body-01-cursorbench-scatter.png",
            "CursorBench cost versus score scatter chart.",
            "*Screenshot: [CursorBench](https://cursor.com/cursorbench) — Petralian (2026)*",
        ),
        (
            "Pasted image 20260721153003.png",
            "best-cursor-model-by-task-2026-body-02-cursorbench-leaderboard.png",
            "CursorBench model leaderboard sorted by benchmark score.",
            "*Screenshot: [CursorBench](https://cursor.com/cursorbench) — Petralian (2026)*",
        ),
        (
            "Pasted image 20260721152644.png",
            "best-cursor-model-by-task-2026-body-03-work-mode-table.png",
            "Recommended Cursor model defaults by work mode.",
            "*Screenshot: [CursorBench](https://cursor.com/cursorbench) — Petralian (2026)*",
        ),
    ],
    "bringing-the-retail-mindset-to-finance-how-personalization-can-transform-banking-in-apac": [
        (
            "pexels-cato-s-2151997403-37095486.jpg",
            "bringing-retail-banking-apac-body-01-hong-kong-harbor.jpg",
            "Traditional junk boat in Hong Kong harbor with city skyline.",
            "*Photo: [Cato S.](https://www.pexels.com/photo/37095486/) on Pexels*",
        ),
        (
            "pexels-tima-miroshnichenko-5198284.jpg",
            "bringing-retail-banking-apac-body-02-mobile-banking.jpg",
            "Person using a mobile banking app on a smartphone.",
            "*Photo: [Tima Miroshnichenko](https://www.pexels.com/photo/5198284/) on Pexels*",
        ),
    ],
    "best-practices-for-founders-integrating-ai-and-seo-for-effective-digital-campaign-management": [
        (
            "Pasted image 20260721160025.png",
            "best-practices-founders-body-01-google-search-central.png",
            "Google Search Central documentation on ranking systems.",
            "*Screenshot: [Google Search Central](https://developers.google.com/search) — Petralian (2026)*",
        ),
        (
            "serp-analysis-MTZS6HEB.png",
            "best-practices-founders-body-02-ahrefs-serp.png",
            "Ahrefs SERP analysis overview for a target keyword.",
            "*Screenshot: [Ahrefs SERP Checker](https://ahrefs.com/serp-checker) — Petralian (2026)*",
        ),
        (
            "media_12f19278a25e98883be1218a564ba7f046bb34d40 1.webp",
            "best-practices-founders-body-03-adobe-campaign-personalize.webp",
            "Adobe Campaign dynamic content personalization panel.",
            "*Screenshot: [Adobe Experience League](https://experienceleague.adobe.com/en/docs/campaign-web/v8/content/dynamic-content/personalize) — Petralian (2026)*",
        ),
    ],
    "is-cursor-only-for-developers": [
        (
            "Pasted image 20260721161045.png",
            "is-cursor-only-for-developers-body-01-cursor-marketing.png",
            "Cursor product page positioning the IDE for developers.",
            "*Screenshot: [Cursor](https://cursor.com) — Petralian (2026)*",
        ),
        (
            "Pasted image 20260721161501.png",
            "is-cursor-only-for-developers-body-02-use-cases-table.png",
            "Table of non-developer Cursor use cases across writing, study, and operations.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
        (
            "Pasted image 20260721161612.png",
            "is-cursor-only-for-developers-body-03-workspace-switcher.png",
            "Cursor workspace switcher showing separate project contexts.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
    ],
    "external-memory-series-guide": [
        (
            "pexels-googledeepmind-25626509.jpg",
            "external-memory-series-guide-body-01-molecular-structure.jpg",
            "Abstract molecular structure suggesting linked knowledge nodes.",
            "*Photo: [Google DeepMind](https://www.pexels.com/photo/25626509/) on Pexels*",
        ),
    ],
    "cursor-customize-one-agent-many-workflows-2026": [
        (
            "pexels-nicola-barts-7925881.jpg",
            "cursor-customize-hub-body-01-chat-overwhelm.jpg",
            "Person at a laptop surrounded by scattered notes and devices.",
            "*Photo: [Nicola Barts](https://www.pexels.com/photo/7925881/) on Pexels*",
        ),
        (
            "Pasted image 20260721164156.png",
            "cursor-customize-hub-body-02-customize-layers.png",
            "Cursor Customize panel listing rules, skills, hooks, and plugins.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
        (
            "Pasted image 20260721164316.png",
            "cursor-customize-hub-body-03-mobile-handoff.png",
            "Mobile and desktop Cursor sessions illustrating commute handoff.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
    ],
    "ai-agent-quality-drift-detection": [
        (
            "1782120693649.gif",
            "ai-agent-quality-drift-body-01-drift-types.gif",
            "Animated diagram contrasting different types of AI output drift.",
            "*Source: [LinkedIn post by Nathan Petralia](https://www.linkedin.com/posts/different-drift-different-risk-different-share-7474755988206788608--pMx/) — used with attribution*",
        ),
    ],
    "ai-quality-gate-ci-gravio": [
        (
            "Pasted image 20260721155355.png",
            "ai-quality-gate-ci-gravio-body-01-github-actions.png",
            "GitHub Actions workflow with an AI quality gate step.",
            "*Screenshot: Petralian / GitHub (2026)*",
        ),
    ],
    "cursor-cloud-hooks-vs-local-hooks-2026": [
        (
            "Pasted image 20260721154709.png",
            "cursor-cloud-hooks-body-01-hook-layers.png",
            "Diagram contrasting cloud agent hooks and local IDE hooks.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
        (
            "Pasted image 20260721092537.png",
            "cursor-cloud-hooks-body-02-hooks-settings.png",
            "Cursor hooks configuration in project settings.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
        (
            "Pasted image 20260721154826.png",
            "cursor-cloud-hooks-body-03-hook-guardrails.png",
            "Example hook guardrail checklist for agent sessions.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
    ],
    "cursor-conversation-search-vs-bridge-file-2026": [
        (
            "Pasted image 20260721155049.png",
            "cursor-conversation-search-body-01-transcript-search.png",
            "Cursor agent transcript search results in the IDE.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
        (
            "Pasted image 20260721092741.png",
            "cursor-conversation-search-body-02-bridge-template.png",
            "Obsidian AI Session Bridge note template with goal and next action.",
            "*Screenshot: Petralian / Obsidian (2026)*",
        ),
        (
            "session start skill.jpg",
            "cursor-conversation-search-body-03-start-session-skill.jpg",
            "Cursor start-session skill prompt in the agent panel.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
    ],
    "why-i-rebuilt-petralian-on-nextjs": [
        (
            "Pasted image 20260721154505.png",
            "why-i-rebuilt-petralian-body-01-wordpress-editor.png",
            "WordPress block editor friction compared with file-based drafting.",
            "*Screenshot: Petralian (2026)*",
        ),
        (
            "Pasted image 20260721154600.png",
            "why-i-rebuilt-petralian-body-02-obsidian-vault.png",
            "Obsidian vault folder structure for publishing workflow.",
            "*Screenshot: Petralian / Obsidian (2026)*",
        ),
        (
            "Pasted image 20260721154623.png",
            "why-i-rebuilt-petralian-body-03-nextjs-vercel.png",
            "Next.js and Vercel deployment pipeline for petralian.com.",
            "*Screenshot: Petralian / Vercel (2026)*",
        ),
    ],
    "why-deliberate-file-memory-beats-hoping-agents-remember": [
        (
            "mode b.jpg",
            "why-deliberate-file-memory-body-01-mode-b-footer.jpg",
            "Example Mode B advisory response footer with memory field.",
            "*Screenshot: Petralian / Cursor (2026)*",
        ),
    ],
    "boutiques-agencies-consultancies-digital-transformation-roi": [
        (
            "910aa77a-66f9-4358-88ff-5ab209a09054.jpg",
            "boutiques-agencies-roi-body-01-consulting-team.jpg",
            "Consulting team collaborating around a table in a modern office.",
            "*Photo: [Pexels](https://www.pexels.com/) — stock*",
        ),
        (
            "3.jpg",
            "boutiques-agencies-roi-body-02-digital-transformation.jpg",
            "Business leaders reviewing digital transformation metrics.",
            "*Photo: [Pexels](https://www.pexels.com/) — stock*",
        ),
    ],
    "getting-to-lighthouse-100-on-nextjs-16": [
        (
            "1.jpg",
            "getting-to-lighthouse-100-body-01-mobile-audit.jpg",
            "Lighthouse mobile performance audit before optimization.",
            "*Screenshot: Petralian / Chrome DevTools (2026)*",
        ),
        (
            "2.jpg",
            "getting-to-lighthouse-100-body-02-desktop-audit.jpg",
            "Lighthouse desktop performance audit after optimization.",
            "*Screenshot: Petralian / Chrome DevTools (2026)*",
        ),
    ],
}

FEATURED_FIXES: dict[str, tuple[str, str | None]] = {
    "bringing-the-retail-mindset-to-finance-how-personalization-can-transform-banking-in-apac": (
        "[[personalized-banking-digital-app-apac-hero.jpg]]",
        "Smartphone banking app on a desk with APAC city skyline bokeh, warm editorial light.",
    ),
    "best-practices-for-founders-integrating-ai-and-seo-for-effective-digital-campaign-management": (
        "[[ai-seo-founders-digital-campaign-hero.jpg]]",
        "Founder reviewing SEO and AI campaign analytics on a laptop in a modern workspace.",
    ),
    "external-memory-series-guide": (
        "[[external-memory-series-guide.png]]",
        "Desk with layered notebooks and a laptop showing a linked note graph for session continuity.",
    ),
}

# Copy hero from 00 Attachments when missing beside published post
HERO_COPIES: dict[str, str] = {
    "personalized-banking-digital-app-apac-hero.jpg": "personalized-banking-digital-app-apac-hero.jpg",
    "ai-seo-founders-digital-campaign-hero.jpg": "ai-seo-founders-digital-campaign-hero.jpg",
    "external-memory-series-guide.png": "external-memory-series-guide.png",  # may copy from repo
}


def ensure_attach_dir() -> None:
    ATTACH.mkdir(parents=True, exist_ok=True)


def find_source(name: str) -> Path | None:
    for base in (ATTACH, READY_ATTACH, VAULT_PUBLISHED, HERO_ATTACH):
        p = base / name
        if p.is_file():
            return p
    return None


def copy_ready_assets() -> list[str]:
    copied: list[str] = []
    if not READY_ATTACH.is_dir():
        return copied
    for old, _, _, _ in sum(IMAGE_MAP.values(), []):
        if (ATTACH / old).exists():
            continue
        src = READY_ATTACH / old
        if src.is_file():
            shutil.copy2(src, ATTACH / old)
            copied.append(f"copied {old} from 02 Ready")
    return copied


def rename_assets() -> list[str]:
    log: list[str] = []
    for slug, items in IMAGE_MAP.items():
        for old, new, _, _ in items:
            src = find_source(old)
            if not src:
                log.append(f"MISSING asset: {old} ({slug})")
                continue
            dest = ATTACH / new
            if src.resolve() != dest.resolve():
                if dest.exists():
                    dest.unlink()
                shutil.move(str(src), str(dest))
            log.append(f"renamed {old} -> {new}")
    return log


def replace_image_block(text: str, old: str, new: str, alt: str, attr: str) -> str:
    block = (
        f"![[{new}|{alt}]]\n\n"
        f"{attr}"
    )
    # Remove old embed and any following bad caption lines
    pattern = (
        rf"!\[\[{re.escape(old)}(?:\|[^\]]*)?\]\]\s*\n"
        rf"(?:\([^\n]+\)\s*\n)?"
        rf"(?:\*[^\n]*\*\s*\n)?"
        rf"(?:\*Photo:[^\n]*\n)?"
        rf"(?:\(https?://[^\n]+\)\s*\n)?"
    )
    if re.search(pattern, text):
        return re.sub(pattern, block + "\n\n", text, count=1)
    # fallback simple replace
    text = text.replace(f"![[{old}]]", block)
    text = text.replace(f"![[{old}|", f"![[{new}|")
    return text


def fix_markdown_file(md_path: Path) -> list[str]:
    slug = md_path.stem
    text = md_path.read_text(encoding="utf-8")
    orig = text
    changes: list[str] = []

    if slug in IMAGE_MAP:
        for old, new, alt, attr in IMAGE_MAP[slug]:
            if old in text or new in text:
                text = replace_image_block(text, old, new, alt, attr)
                changes.append(f"{slug}: embed {new}")

    if slug in FEATURED_FIXES:
        wiki, alt = FEATURED_FIXES[slug]
        text = re.sub(
            r"(?m)^featured_image:\s*.+$",
            f"featured_image: '{wiki}'",
            text,
            count=1,
        )
        if alt and "featured_image_alt:" not in text:
            text = re.sub(
                r"(?m)^(featured_image:.+)$",
                rf"\1\nfeatured_image_alt: {alt}",
                text,
                count=1,
            )
        changes.append(f"{slug}: featured_image -> {wiki}")

    # Remove duplicate hero embed in body for why-i-rebuilt
    if slug == "why-i-rebuilt-petralian-on-nextjs":
        text = re.sub(
            r"\n!\[\[why-i-rebuilt-petralian-hero\.png\]\]\n",
            "\n",
            text,
        )

    # Strip orphan URL-only lines after images (legacy)
    text = re.sub(r"\n\(https?://[^\)]+\)\n", "\n", text)

    if text != orig:
        md_path.write_text(text, encoding="utf-8", newline="\n")
    return changes


def copy_heroes() -> list[str]:
    log: list[str] = []
    repo_hero = Path(__file__).resolve().parents[1] / "public" / "images" / "posts"
    for dest_name, src_name in HERO_COPIES.items():
        targets = [
            VAULT_PUBLISHED / dest_name,
            ATTACH / dest_name,
        ]
        src = HERO_ATTACH / src_name
        if not src.is_file():
            repo_src = repo_hero / src_name
            if repo_src.is_file():
                src = repo_src
        if not src.is_file():
            log.append(f"MISSING hero source: {src_name}")
            continue
        for t in targets:
            if not t.exists():
                shutil.copy2(src, t)
                log.append(f"copied hero -> {t.name}")
    return log


def main() -> None:
    ensure_attach_dir()
    report: list[str] = []
    report.extend(copy_ready_assets())
    report.extend(copy_heroes())
    report.extend(rename_assets())
    for md in sorted(VAULT_PUBLISHED.glob("*.md")):
        report.extend(fix_markdown_file(md))
    out = Path(__file__).resolve().parents[1] / "scripts" / "image-fix-report.txt"
    out.write_text("\n".join(report), encoding="utf-8")
    print("\n".join(report))


if __name__ == "__main__":
    main()
