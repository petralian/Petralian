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
        "Shopify",
        "SEO",
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
        "Agency Landscape",
        "Marketing Technology",
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
        "Shopify",
        "SEO",
        "ChatGPT",
        "Salesforce",
        "CDP",
        "Developer Tools",
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
    "future of search": "SEO",
    "search engine optimization": "SEO",
    "search engine": "SEO",
    "shopify": "Shopify",
    "chatgpt": "ChatGPT",
    "openai": "ChatGPT",
    "salesforce": "Salesforce",
    "cdp": "CDP",
    "customer data platform": "CDP",
    "extension": "Developer Tools",
    "extensions": "Developer Tools",
    "ux": "Customer Experience",
    "user experience": "Customer Experience",
    "retail": "Ecommerce",
    "retail strategy": "Ecommerce",
    "cursor": "Developer Tools",
    "openrouter": "Developer Tools",
    "copilot": "Developer Tools",
    "composer": "Agentic AI",
    "referral": "Ecommerce",
    "loyalty": "Customer Experience",
    "social commerce": "Social Commerce",
    "conversational commerce": "ChatGPT",
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
    "customer-account-monolith-anti-pattern-shopify-extensions": (
        "Commerce & Marketing",
        ["Shopify", "Ecommerce", "Customer Experience", "Marketing Technology", "Developer Tools"],
    ),
    "how-i-built-the-petralian-weekly-digest-on-brevo-free": (
        "Commerce & Marketing",
        ["Developer Tools", "Marketing Technology", "Brand Strategy"],
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

# SEO-optimized tags (3–6 searchable topic terms per post). Merged with POST_OVERRIDES.
SEO_POST_TAGS: dict[str, list[str]] = {
    "ai-agent-quality-drift-detection": [
        "AI Quality", "Gravio", "Agentic AI", "Enterprise AI",
    ],
    "ai-quality-gate-ci-gravio": [
        "Developer Tools", "AI Quality", "Agentic AI", "Gravio",
    ],
    "ai-shopping-revolution-will-shopifys-chatgpt-integration-redefine-retail-strategy": [
        "Shopify", "ChatGPT", "Ecommerce", "Social Commerce", "AI in Marketing", "Customer Experience",
    ],
    "best-practices-for-founders-integrating-ai-and-seo-for-effective-digital-campaign-management": [
        "SEO", "AI in Marketing", "Marketing Technology", "Brand Strategy",
    ],
    "boutiques-agencies-consultancies-digital-transformation-roi": [
        "Agency Landscape", "Digital Transformation", "Marketing Technology",
    ],
    "bringing-the-retail-mindset-to-finance-how-personalization-can-transform-banking-in-apac": [
        "Digital Transformation", "APAC", "Customer Experience", "Ecommerce",
    ],
    "building-petralian-the-technical-reality": [
        "Developer Tools", "Obsidian", "Agentic AI", "SEO",
    ],
    "capturing-ui-designs-for-ai-agents-prompt-injection-risk": [
        "Agentic AI", "AI Quality", "Developer Tools", "Generative AI",
    ],
    "composer-2-5-baseline-model-tighter-bootstrap-better-results": [
        "Agentic AI", "Developer Tools", "AI Memory", "Enterprise AI",
    ],
    "contextual-ai-for-ecommerce-beyond-the-click-and-into-the-conversation": [
        "AI in Marketing", "Ecommerce", "Customer Experience", "ChatGPT", "Social Commerce",
    ],
    "crafting-a-strong-digital-identity-for-startups-essential-branding-tips": [
        "Brand Strategy", "Marketing Technology", "Ecommerce",
    ],
    "css-masonry-reading-order-column-count-fix": [
        "Developer Tools", "SEO",
    ],
    "cursor-harness-measurement-2026": [
        "Agentic AI", "Developer Tools", "AI Quality",
    ],
    "cursor-harness-memory-loop-2026": [
        "Agentic AI", "AI Memory", "Obsidian",
    ],
    "cursor-lightweight-harness-without-microservice-2026": [
        "Agentic AI", "Developer Tools", "AI Quality",
    ],
    "cursor-token-saving-tools-beyond-headroom-2026": [
        "Agentic AI", "Developer Tools", "AI Memory",
    ],
    "cursorbench-fable-5-composer-2-5-cost-vs-score": [
        "Agentic AI", "Developer Tools", "AI Quality", "Generative AI",
    ],
    "customer-account-monolith-anti-pattern-shopify-extensions": [
        "Shopify", "Ecommerce", "Customer Experience", "Marketing Technology", "Developer Tools",
    ],
    "data-warehousing-as-a-cdp-can-you-really-have-it-all": [
        "CDP", "Marketing Technology", "AI in Marketing", "Customer Experience",
    ],
    "e-commerce-in-2025-trends-statistics-and-strategies-to-stay-ahead": [
        "Ecommerce", "AI in Marketing", "Social Commerce", "ChatGPT",
    ],
    "ex-merkle-md-joins-silk-commerce": [
        "Leadership", "APAC", "Agency Landscape", "Ecommerce",
    ],
    "external-memory-series-guide": [
        "AI Memory", "Agentic AI", "Obsidian", "External Memory Series",
    ],
    "first-gravio-score-in-10-minutes": [
        "Gravio", "Agentic AI", "Developer Tools",
    ],
    "fractional-marketing-revolutionize-startups-small-businesses": [
        "Marketing Technology", "Brand Strategy", "Agency Landscape",
    ],
    "generative-ai-in-marketing-my-thoughts-on-the-industrys-progress-and-challenges": [
        "Generative AI", "AI in Marketing", "Agency Landscape",
    ],
    "getting-enterprise-ai-right-the-work-that-comes-before-deployment": [
        "Enterprise AI", "Program Delivery", "Digital Transformation", "Leadership",
    ],
    "getting-to-lighthouse-100-on-nextjs-16": [
        "Developer Tools", "SEO",
    ],
    "github-copilot-vs-openrouter-real-cost-comparison-for-developers": [
        "Agentic AI", "Developer Tools", "Generative AI",
    ],
    "gravio-multi-repo-rollout-playbook": [
        "Gravio", "Enterprise AI", "Agentic AI", "AI Quality",
    ],
    "how-ai-and-human-imagination-work-together": [
        "Generative AI", "AI in Marketing", "Brand Strategy",
    ],
    "how-gravio-scoring-engine-was-built": [
        "Agentic AI", "AI Quality", "Developer Tools", "Gravio",
    ],
    "how-i-built-the-petralian-weekly-digest-on-brevo-free": [
        "Developer Tools", "Marketing Technology", "Brand Strategy",
    ],
    "infinity-loops-the-framework-behind-successful-brand-stories": [
        "Customer Experience", "Brand Strategy", "Ecommerce",
    ],
    "is-saas-being-dismantled-by-ai": [
        "AI in Marketing", "Digital Transformation", "Marketing Technology", "Ecommerce",
    ],
    "is-salesforce-becoming-invisible-on-purpose-or-becoming-irrelevant": [
        "Salesforce", "AI in Marketing", "Marketing Technology", "CDP", "Digital Transformation",
    ],
    "is-using-ai-in-creative-work-wrong": [
        "Generative AI", "AI in Marketing", "Agency Landscape",
    ],
    "knowledge-work-agent-engine-guide-2026": [
        "Program Delivery", "Leadership", "Agentic AI", "Digital Transformation",
    ],
    "knowledge-work-engine-leadership-decisions-2026": [
        "Leadership", "Enterprise AI", "Program Delivery", "Agentic AI",
    ],
    "knowledge-work-engine-marketing-voice-2026": [
        "Brand Strategy", "AI in Marketing", "Marketing Technology", "Generative AI",
    ],
    "knowledge-work-engine-project-management-2026": [
        "Program Delivery", "Digital Transformation", "Agentic AI", "Enterprise AI",
    ],
    "leadership-lessons-from-the-vatican-consensus-as-a-catalyst-for-digital-transformation": [
        "Leadership", "Digital Transformation", "Program Delivery",
    ],
    "leadership-styles-and-their-impact-on-marketing-and-branding": [
        "Leadership", "Brand Strategy", "Marketing Technology",
    ],
    "marketing-101-fundamental-principles-for-sustainable-business-growth": [
        "Marketing Technology", "Brand Strategy", "Customer Experience",
    ],
    "mastering-ai-prompting-frameworks-for-marketers-transforming-campaigns-with-the-right-ai-tools": [
        "AI in Marketing", "Generative AI", "Marketing Technology", "SEO",
    ],
    "new-merkle-md": [
        "Leadership", "APAC", "Agency Landscape",
    ],
    "obsidian-memory-layers-personal-productivity-beyond-chat": [
        "Obsidian", "Agentic AI", "External Memory Series", "AI Memory",
    ],
    "programmatic-transparency-in-2026-why-agencies-are-fighting-the-trade-desk": [
        "Marketing Technology", "Agency Landscape", "Digital Transformation",
    ],
    "publishing-obsidian-drafts-through-github-actions": [
        "Obsidian", "Developer Tools", "Agentic AI",
    ],
    "redefining-media-agency-success-embracing-innovation-in-the-digital-era": [
        "Agency Landscape", "AI in Marketing", "Digital Transformation",
    ],
    "redefining-the-career-ladder-how-ai-sidelines-entry-level-learning-in-apac": [
        "Leadership", "APAC", "Enterprise AI", "AI in Marketing",
    ],
    "shoppable-media-as-an-omnichannel-strategy-a-warc-exclusive-article": [
        "Ecommerce", "Social Commerce", "Marketing Technology",
    ],
    "thank-you-merkle": [
        "Leadership", "APAC", "Agency Landscape",
    ],
    "the-ad-agency-holding-company-transformation-what-2026-is-really-telling-us-about-the-future-of-marketing": [
        "Agency Landscape", "Digital Transformation", "AI in Marketing",
    ],
    "the-ai-memory-problem-openclaw-hermes-karpathy-approach-that-survives": [
        "AI Memory", "Agentic AI", "Obsidian",
    ],
    "the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo": [
        "SEO", "AI in Marketing", "Generative AI", "ChatGPT",
    ],
    "the-future-of-social-commerce-why-brands-need-to-own-their-customer-data": [
        "Social Commerce", "Marketing Technology", "Ecommerce", "CDP",
    ],
    "the-power-of-engagement-how-buy-socials-messaging-and-notifications-system-stands-out": [
        "Customer Experience", "Marketing Technology", "Ecommerce", "Social Commerce",
    ],
    "the-rise-of-cxm": [
        "Customer Experience", "Marketing Technology", "Ecommerce",
    ],
    "three-layer-external-brain-for-ai-first-development": [
        "AI Memory", "Agentic AI", "Obsidian", "Developer Tools", "External Memory Series",
    ],
    "training-an-ai-is-like-managing-an-employee": [
        "Leadership", "Agentic AI", "Program Delivery", "Generative AI",
    ],
    "vscode-copilot-to-cursor-what-changed-in-my-ai-workflow": [
        "Developer Tools", "Agentic AI", "Obsidian", "AI Memory",
    ],
    "what-i-learned-directing-ai-as-my-primary-engineer": [
        "Enterprise AI", "Agentic AI", "Program Delivery", "Leadership",
    ],
    "why-deliberate-file-memory-beats-hoping-agents-remember": [
        "AI Memory", "Agentic AI", "Obsidian", "External Memory Series",
    ],
    "why-file-memory-beats-the-three-layer-diagram-for-builders": [
        "AI Memory", "Agentic AI", "Obsidian", "External Memory Series",
    ],
    "why-i-rebuilt-petralian-on-nextjs": [
        "Developer Tools", "Obsidian", "SEO", "Agentic AI",
    ],
    "why-retail-often-leads-in-digital-innovation-over-banking-and-what-we-can-learn-from-it": [
        "Digital Transformation", "Ecommerce", "APAC",
    ],
    "why-your-ai-program-may-fail-before-it-starts": [
        "Enterprise AI", "Program Delivery", "Digital Transformation", "Leadership",
    ],
    "your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian": [
        "Leadership", "Enterprise AI", "Obsidian", "Generative AI",
    ],
    "zero-knowledge-ai-quality-gravio": [
        "Gravio", "Agentic AI", "Developer Tools", "AI Quality",
    ],
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
    if slug in SEO_POST_TAGS:
        new_tags = normalize_tags(category, SEO_POST_TAGS[slug])
    elif slug in ALL_OVERRIDES:
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
