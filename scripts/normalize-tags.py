#!/usr/bin/env python3
"""Normalize post tags to canonical Title Case vocabulary (max 10 tags per category)."""

from __future__ import annotations

import pathlib
import sys

import yaml

REPO = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = REPO / "content" / "posts"
_VAULT_ROOT = pathlib.Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog")
VAULT_PUBLISHED = _VAULT_ROOT / "03 Published"
VAULT_DRAFTS = _VAULT_ROOT / "01 Drafts"
VAULT_READY = _VAULT_ROOT / "02 Ready to publish"

# Blog categories (2026-06) — max 10 tags each
ALLOWED_BY_CATEGORY: dict[str, list[str]] = {
    "AI & Building": [
        "Agentic AI",
        "Developer Tools",
        "Obsidian",
        "Gravio",
        "AI Quality",
        "AI Memory",
        "External Memory Series",
        "Generative AI",
        "Enterprise AI",
    ],
    "Career": [
        "Leadership",
        "APAC",
        "Enterprise AI",
        "Brand Strategy",
        "Digital Transformation",
        "Program Delivery",
        "Generative AI",
        "Agentic AI",
    ],
    "Commerce & Marketing": [
        "Ecommerce",
        "Customer Experience",
        "Marketing Technology",
        "AI in Marketing",
        "Agency Landscape",
        "Digital Transformation",
        "Generative AI",
        "Social Commerce",
        "Brand Strategy",
        "APAC",
    ],
}

# Legacy category names → current (also applied during normalize)
CATEGORY_RENAME: dict[str, str] = {
    "AI & Technology": "AI & Building",
    "Commerce & Growth": "Commerce & Marketing",
    "Marketing & Media": "Commerce & Marketing",
    "Leadership": "Career",
    "Leadership & Delivery": "Career",
    "Enterprise AI": "AI & Building",
    "Ideas": "AI & Building",
}

# Former Enterprise AI posts → destination category (category removed 2026-06)
FORMER_ENTERPRISE_AI_SLUGS: dict[str, str] = {
    "getting-enterprise-ai-right-the-work-that-comes-before-deployment": "Career",
    "what-i-learned-directing-ai-as-my-primary-engineer": "Career",
    "is-saas-being-dismantled-by-ai": "Commerce & Marketing",
    "is-salesforce-becoming-invisible-on-purpose-or-becoming-irrelevant": "Commerce & Marketing",
    "ai-agent-quality-drift-detection": "AI & Building",
    "gravio-multi-repo-rollout-playbook": "AI & Building",
}

CATEGORY_FALLBACK: dict[str, str] = {
    "AI & Building": "Agentic AI",
    "Career": "Leadership",
    "Commerce & Marketing": "Ecommerce",
}

# Format + duplicate aliases only (not semantic merges across concepts)
TAG_ALIASES: dict[str, str] = {
    "agentic development": "Agentic AI",
    "ai agents": "Agentic AI",
    "ai memory": "AI Memory",
    "ai-memory": "AI Memory",
    "ai assistants": "Agentic AI",
    "ai engineering": "Agentic AI",
    "ai development": "Agentic AI",
    "context engineering": "Agentic AI",
    "ai governance": "Agentic AI",
    "governance": "Agentic AI",
    "personal-ai": "Personal AI",
    "personal productivity": "Personal Productivity",
    "second brain": "Obsidian",
    "second-brain": "Obsidian",
    "knowledge management": "Obsidian",
    "knowledge-management": "Obsidian",
    "llm-wiki": "Obsidian",
    "documentation": "Obsidian",
    "writing": "Obsidian",
    "developer tools": "Developer Tools",
    "developer-tools": "Developer Tools",
    "code quality": "AI Quality",
    "scoring systems": "AI Quality",
    "evaluation": "AI Quality",
    "regression": "AI Quality",
    "observability": "AI Quality",
    "privacy": "AI Quality",
    "next.js": "Developer Tools",
    "vercel": "Developer Tools",
    "tinacms": "Developer Tools",
    "react": "Developer Tools",
    "frontend": "Developer Tools",
    "web development": "Developer Tools",
    "lighthouse": "Developer Tools",
    "web vitals": "Developer Tools",
    "performance": "Developer Tools",
    "css": "Developer Tools",
    "cli": "Developer Tools",
    "ci/cd": "Developer Tools",
    "devops": "Developer Tools",
    "github actions": "Developer Tools",
    "github copilot": "Developer Tools",
    "cost analysis": "Developer Tools",
    "developer experience": "Developer Tools",
    "developer workflow": "Developer Tools",
    "workflow": "Developer Tools",
    "publishing": "Developer Tools",
    "brevo": "Developer Tools",
    "email": "Developer Tools",
    "engineering leadership": "Program Delivery",
    "engineering management": "Program Delivery",
    "platform teams": "Program Delivery",
    "onboarding": "Program Delivery",
    "release engineering": "Program Delivery",
    "programmatic": "Marketing Technology",
    "future of search": "AI in Marketing",
}

# Slug → (category, tags) overrides for edge cases
POST_OVERRIDES: dict[str, tuple[str, list[str]]] = {
    "contextual-ai-for-ecommerce-beyond-the-click-and-into-the-conversation": (
        "Commerce & Marketing",
        ["AI in Marketing", "Ecommerce", "Customer Experience"],
    ),
    "your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian": (
        "Career",
        ["Leadership", "Enterprise AI", "Generative AI"],
    ),
    "getting-enterprise-ai-right-the-work-that-comes-before-deployment": (
        "Career",
        ["Enterprise AI", "Digital Transformation", "Program Delivery"],
    ),
    "what-i-learned-directing-ai-as-my-primary-engineer": (
        "Career",
        ["Enterprise AI", "Agentic AI", "Program Delivery"],
    ),
    "is-saas-being-dismantled-by-ai": (
        "Commerce & Marketing",
        ["AI in Marketing", "Digital Transformation", "Marketing Technology"],
    ),
    "is-salesforce-becoming-invisible-on-purpose-or-becoming-irrelevant": (
        "Commerce & Marketing",
        ["AI in Marketing", "Marketing Technology", "Digital Transformation"],
    ),
    "ai-agent-quality-drift-detection": (
        "AI & Building",
        ["AI Quality", "Gravio", "Agentic AI"],
    ),
    "gravio-multi-repo-rollout-playbook": (
        "AI & Building",
        ["Gravio", "Enterprise AI", "Agentic AI", "AI Quality"],
    ),
    "mastering-ai-prompting-frameworks-for-marketers-transforming-campaigns-with-the-right-ai-tools": (
        "Commerce & Marketing",
        ["AI in Marketing", "Generative AI", "Marketing Technology"],
    ),
    "data-warehousing-as-a-cdp-can-you-really-have-it-all": (
        "Commerce & Marketing",
        ["Marketing Technology", "AI in Marketing", "Customer Experience"],
    ),
    "the-ai-memory-problem-openclaw-hermes-karpathy-approach-that-survives": (
        "AI & Building",
        ["AI Memory", "Agentic AI", "Obsidian"],
    ),
    "generative-ai-in-marketing-my-thoughts-on-the-industrys-progress-and-challenges": (
        "Commerce & Marketing",
        ["Generative AI", "AI in Marketing", "Agency Landscape"],
    ),
    "is-using-ai-in-creative-work-wrong": (
        "Commerce & Marketing",
        ["Generative AI", "AI in Marketing", "Agency Landscape"],
    ),
    "how-ai-and-human-imagination-work-together": (
        "Commerce & Marketing",
        ["Generative AI", "AI in Marketing"],
    ),
    "the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo": (
        "Commerce & Marketing",
        ["AI in Marketing", "Generative AI", "Marketing Technology"],
    ),
    "fractional-marketing-revolutionize-startups-small-businesses": (
        "Commerce & Marketing",
        ["Marketing Technology", "Brand Strategy", "Agency Landscape"],
    ),
}

# Vault drafts / ready queue — same shape as POST_OVERRIDES
DRAFT_OVERRIDES: dict[str, tuple[str, list[str]]] = {
    "vscode-copilot-to-cursor-what-changed-in-my-ai-workflow": (
        "AI & Building",
        ["Developer Tools", "Agentic AI", "Obsidian", "AI Memory"],
    ),
    "training-an-ai-is-like-managing-an-employee": (
        "Career",
        ["Leadership", "Agentic AI", "Program Delivery", "Generative AI"],
    ),
    "composer-2-5-baseline-model-tighter-bootstrap-better-results": (
        "AI & Building",
        ["Agentic AI", "Developer Tools", "AI Memory", "Enterprise AI"],
    ),
    "mobile-chrome-fullscreen-overlay-visualviewport": (
        "AI & Building",
        ["Developer Tools", "Agentic AI", "AI Quality"],
    ),
    "referral-links-are-not-checkout-discount-codes": (
        "Commerce & Marketing",
        ["Ecommerce", "Marketing Technology", "Customer Experience"],
    ),
    "shopify-customer-account-extensions-app-proxy-cross-origin": (
        "AI & Building",
        ["Developer Tools", "Agentic AI", "Enterprise AI"],
    ),
    "deploy-without-git-tag-you-cannot-roll-back": (
        "AI & Building",
        ["Developer Tools", "Enterprise AI", "AI Quality"],
    ),
}

ALL_OVERRIDES = {**POST_OVERRIDES, **DRAFT_OVERRIDES}


def resolve_category(slug: str, old_category: str) -> str:
    if slug in ALL_OVERRIDES:
        return ALL_OVERRIDES[slug][0]
    if slug in FORMER_ENTERPRISE_AI_SLUGS:
        return FORMER_ENTERPRISE_AI_SLUGS[slug]
    return CATEGORY_RENAME.get(old_category, old_category)

MAX_TAGS_PER_POST = 6


def title_case_tag(raw: str) -> str:
    """Normalize known Title Case tags from lowercase input."""
    key = raw.strip().lower()
    if key in TAG_ALIASES:
        return TAG_ALIASES[key]
    # Preserve already-canonical tags
    for allowed in ALLOWED_BY_CATEGORY.values():
        for tag in allowed:
            if key == tag.lower():
                return tag
    # Default: title-case each word
    return " ".join(word.capitalize() for word in raw.strip().split())


def closest_allowed(tag: str, allowed: list[str]) -> str:
    lower = tag.lower()
    for candidate in allowed:
        if candidate.lower() == lower:
            return candidate
    for candidate in allowed:
        c_lower = candidate.lower()
        if lower in c_lower or c_lower in lower:
            return candidate
    return allowed[0]


def normalize_tags(category: str, tags: list) -> list[str]:
    allowed = ALLOWED_BY_CATEGORY.get(category, [])
    allowed_set = set(allowed)
    out: list[str] = []
    seen: set[str] = set()

    for raw in tags or []:
        if not raw:
            continue
        tag = title_case_tag(str(raw))
        if tag == "Personal Productivity":
            tag = "Obsidian"
        if tag == "Personal AI":
            tag = "AI Memory"
        if tag not in allowed_set:
            fallback = CATEGORY_FALLBACK.get(category)
            tag = closest_allowed(tag, allowed) if allowed else tag
            if fallback and tag not in allowed_set:
                tag = fallback
        if tag not in seen:
            seen.add(tag)
            out.append(tag)

    return out[:MAX_TAGS_PER_POST]


def parse_frontmatter(text: str) -> tuple[dict, str]:
    parts = text.split("---", 2)
    if len(parts) < 3:
        raise ValueError("Missing frontmatter")
    data = yaml.safe_load(parts[1]) or {}
    return data, parts[2]


def dump_frontmatter(data: dict, body: str) -> str:
    dumped = yaml.dump(data, default_flow_style=False, allow_unicode=True, sort_keys=False)
    return f"---\n{dumped}---{body}"


def process_file(path: pathlib.Path, dry_run: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    data, body = parse_frontmatter(text)
    slug = data.get("slug") or path.stem
    old_category = (data.get("category") or "").strip()
    old_tags = data.get("tags") or []

    category = resolve_category(slug, old_category)
    if slug in ALL_OVERRIDES:
        _, new_tags = ALL_OVERRIDES[slug]
        new_tags = normalize_tags(category, new_tags)
    else:
        new_tags = normalize_tags(category, old_tags if isinstance(old_tags, list) else [])

    if old_tags == new_tags and old_category == category:
        return False

    if not dry_run:
        data["category"] = category
        data["tags"] = new_tags
        path.write_text(dump_frontmatter(data, body), encoding="utf-8")

    print(f"{'[dry] ' if dry_run else ''}{path.name}")
    if old_category != category:
        print(f"  category: {old_category} -> {category}")
    print(f"  tags: {old_tags} -> {new_tags}")
    return True


def main() -> int:
    dry_run = "--dry-run" in sys.argv
    changed = 0
    dirs = [POSTS_DIR]
    for vault_dir in (VAULT_PUBLISHED, VAULT_DRAFTS, VAULT_READY):
        if vault_dir.exists():
            dirs.append(vault_dir)

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
