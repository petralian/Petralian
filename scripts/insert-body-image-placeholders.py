#!/usr/bin/env python3
"""Insert body_images shot lists + in-body wiki placeholders that sync strips if missing.

Usage:
  python scripts/insert-body-image-placeholders.py
  python scripts/insert-body-image-placeholders.py --dry-run

Sync behavior (sync-obsidian.ps1 / publish-from-vault.mjs):
  - Missing ![[file]] embeds (+ following *caption* line) are skipped on publish
  - <!-- petralian-img-slot ... --> comments are always stripped
  - body_images YAML is vault-only (stripped from content/posts)
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

VAULT = Path(r"D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog")
DIRS = [
    VAULT / "01 Drafts",
    VAULT / "02 Ready to publish",
    VAULT / "03 Published",
]

# Curated shot lists for the thin-tag uplift batch (+ CDP live post).
BODY_IMAGES_BY_SLUG: dict[str, list[dict[str, str]]] = {
    "cdp-your-agents-need-is-a-folder-contract": [
        {
            "id": "01",
            "kind": "stock",
            "filename": "cdp-your-agents-need-is-a-folder-contract-body-01-filing-vault.jpg",
            "alt": "Open steel filing cabinet with labeled folders suggesting governed customer context paths.",
            "source": "Pexels: filing cabinet open drawers OR Unsplash: archive folders steel",
            "section": "What agents need from a CDP",
            "caption": '*Photo: TBD — Pexels/Unsplash search "filing cabinet open drawers"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "diagram",
            "filename": "cdp-your-agents-need-is-a-folder-contract-body-02-lake-cdp-folder.png",
            "alt": "Diagram of lake to optional CDP to folder contract to agent read path.",
            "source": "Export D2 from this article or Excalidraw; keep labels short for mobile",
            "section": "Composable systems: best practice and where agents fit",
            "caption": "*Diagram: Lake → CDP → folder contract → agent — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "screenshot",
            "filename": "cdp-your-agents-need-is-a-folder-contract-body-03-segments-yaml.png",
            "alt": "Editor showing segments YAML and consent flags in a governed customer folder.",
            "source": "Screenshot your vault/repo customer or segments YAML; redact real emails and IDs",
            "section": "Example implementation",
            "caption": "*Screenshot: folder-contract YAML sample (redacted) — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "04",
            "kind": "stock",
            "filename": "cdp-your-agents-need-is-a-folder-contract-body-04-data-pipes.jpg",
            "alt": "Abstract industrial pipes suggesting composable data plumbing between systems.",
            "source": "Pexels: industrial pipes abstract OR Unsplash: data center cable tray",
            "section": "Path A",
            "caption": '*Photo: TBD — Pexels "industrial pipes" or "cable tray"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "shopify-hydrogen-vs-online-store-when-ai-is-front-end": [
        {
            "id": "01",
            "kind": "screenshot",
            "filename": "shopify-hydrogen-vs-online-store-when-ai-is-front-end-body-01-hydrogen-docs.png",
            "alt": "Shopify Hydrogen documentation homepage showing the React storefront toolkit.",
            "source": "Screenshot https://shopify.dev/docs/custom-storefronts/hydrogen — product UI fair use with credit",
            "section": "Hydrogen vs Online Store when AI writes the front end",
            "caption": "*Screenshot: [Shopify Hydrogen docs](https://shopify.dev/docs/custom-storefronts/hydrogen) — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "screenshot",
            "filename": "shopify-hydrogen-vs-online-store-when-ai-is-front-end-body-02-theme-editor.png",
            "alt": "Shopify Online Store 2.0 theme editor with sections and blocks panel.",
            "source": "Screenshot Shopify Admin theme editor (demo shop); redact store name if needed",
            "section": "Online Store 2.0 when speed and merchant control win",
            "caption": "*Screenshot: Shopify Online Store 2.0 theme editor — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "stock",
            "filename": "shopify-hydrogen-vs-online-store-when-ai-is-front-end-body-03-storefront-desk.jpg",
            "alt": "Laptop on a retail desk with product packaging suggesting commerce operations.",
            "source": "Pexels: ecommerce laptop packaging OR Unsplash: retail checkout desk",
            "section": "Decision matrix",
            "caption": '*Photo: TBD — Pexels "ecommerce laptop"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "when-chatgpt-is-research-and-cursor-is-build-layer": [
        {
            "id": "01",
            "kind": "ui",
            "filename": "when-chatgpt-is-research-and-cursor-is-build-layer-body-01-research-md.png",
            "alt": "Markdown RESEARCH handoff file with Decision, Sources, and Build instructions sections.",
            "source": "Screenshot your RESEARCH.md template filled with a redacted example",
            "section": "Handoff template",
            "caption": "*Screenshot: RESEARCH.md handoff template — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "stock",
            "filename": "when-chatgpt-is-research-and-cursor-is-build-layer-body-02-two-desks.jpg",
            "alt": "Two workstations suggesting a research layer and a build layer side by side.",
            "source": "Pexels: two desks office OR Unsplash: split workspace monitors",
            "section": "How the two layers connect",
            "caption": '*Photo: TBD — Pexels "two monitors desk"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "screenshot",
            "filename": "when-chatgpt-is-research-and-cursor-is-build-layer-body-03-cursor-agent.png",
            "alt": "Cursor agent panel applying build instructions from a research handoff file.",
            "source": "Screenshot Cursor agent with RESEARCH.md open; redact secrets",
            "section": "Example implementation: how I run it",
            "caption": "*Screenshot: Cursor applying a research handoff — Petralian (2026)*",
            "status": "planned",
        },
    ],
    "session-bridge-as-standup-file-agents-read-first": [
        {
            "id": "01",
            "kind": "ui",
            "filename": "session-bridge-as-standup-file-agents-read-first-body-01-bridge-fields.png",
            "alt": "Session Bridge markdown with Priority, Blockers, Next, and Decisions filled for standup.",
            "source": "Screenshot Operations/AI Session Bridge.md (redact client names)",
            "section": "Bridge fields for delivery leads",
            "caption": "*Screenshot: Session Bridge standup fields — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "stock",
            "filename": "session-bridge-as-standup-file-agents-read-first-body-02-standup-room.jpg",
            "alt": "Empty meeting room before standup with a clipboard on the table.",
            "source": "Pexels: empty conference room morning OR Unsplash: standup meeting clipboard",
            "section": "Ritual: five minutes after standup",
            "caption": '*Photo: TBD — Pexels "conference room morning"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "apac-program-delivery-breaks-on-us-agent-hours": [
        {
            "id": "01",
            "kind": "stock",
            "filename": "apac-program-delivery-breaks-on-us-agent-hours-body-01-offset-clocks.jpg",
            "alt": "Two wall clocks showing offset hours in an operations office at dawn.",
            "source": "Pexels: wall clocks office OR Unsplash: timezone clocks airport",
            "section": "Timezone mismatch hurts before model quality does",
            "caption": '*Photo: TBD — Pexels "wall clocks office"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "stock",
            "filename": "apac-program-delivery-breaks-on-us-agent-hours-body-02-hk-skyline-dawn.jpg",
            "alt": "Hong Kong skyline at dawn suggesting APAC working hours before US markets open.",
            "source": "Pexels: Hong Kong skyline dawn OR Unsplash: Singapore financial district morning",
            "section": "Retail pace vs banking pace in one portfolio",
            "caption": '*Photo: TBD — Pexels "Hong Kong dawn skyline"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "ui",
            "filename": "apac-program-delivery-breaks-on-us-agent-hours-body-03-handoff-table.png",
            "alt": "Simple timezone handoff table mapping reviewer hours and overlap windows.",
            "source": "Screenshot your Path A table filled for one initiative",
            "section": "Path A: one afternoon test",
            "caption": "*Screenshot: timezone handoff table (redacted) — Petralian (2026)*",
            "status": "planned",
        },
    ],
    "scoring-marketing-site-repo-with-gravio": [
        {
            "id": "01",
            "kind": "screenshot",
            "filename": "scoring-marketing-site-repo-with-gravio-body-01-gravio-dashboard.png",
            "alt": "Gravio dashboard category scores for a marketing-site repository scan.",
            "source": "gravio.dev dashboard; redact keys and internal paths",
            "section": "What moved on a marketing repo",
            "caption": "*Screenshot: Gravio category scores (redacted) — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "screenshot",
            "filename": "scoring-marketing-site-repo-with-gravio-body-02-cli-scan.png",
            "alt": "Terminal running a Gravio CLI scan against a Next.js marketing site repo.",
            "source": "Local terminal: Gravio once-scan; redact machine paths",
            "section": "Example implementation: how I ran the scan",
            "caption": "*Screenshot: Gravio CLI scan output — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "stock",
            "filename": "scoring-marketing-site-repo-with-gravio-body-03-gauge.jpg",
            "alt": "Analog gauge dial suggesting a measurable quality threshold.",
            "source": "Pexels: gauge dial instrument OR Unsplash: quality control meter",
            "section": "Why score the site that publishes the scores?",
            "caption": '*Photo: TBD — Pexels "gauge dial"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "wechat-mini-programs-vs-instagram-shop-social-commerce": [
        {
            "id": "01",
            "kind": "stock",
            "filename": "wechat-mini-programs-vs-instagram-shop-social-commerce-body-01-phone-qr.jpg",
            "alt": "Smartphone showing a QR code style commerce entry point in a retail setting.",
            "source": "Pexels: phone QR retail OR Unsplash: wechat pay phone (no brand logos if avoidable)",
            "section": "Where social commerce still needs a human program owner",
            "caption": '*Photo: TBD — Pexels "phone QR retail"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "stock",
            "filename": "wechat-mini-programs-vs-instagram-shop-social-commerce-body-02-social-feed.jpg",
            "alt": "Person scrolling a social commerce feed on a phone in a cafe.",
            "source": "Pexels: scrolling phone cafe shopping OR Unsplash: instagram shopping phone",
            "section": "Why Instagram Shop wins discovery and loses the program thread",
            "caption": '*Photo: TBD — Pexels "phone shopping cafe"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "diagram",
            "filename": "wechat-mini-programs-vs-instagram-shop-social-commerce-body-03-owner-map.png",
            "alt": "RACI-style map of who owns catalog, refunds, and CRM across social commerce channels.",
            "source": "Export D2 from article or draw RACI in Excalidraw",
            "section": "What the human program owner actually owns",
            "caption": "*Diagram: social commerce program ownership — Petralian (2026)*",
            "status": "planned",
        },
    ],
    "indexnow-sitemaps-agentic-browsing-llms-txt": [
        {
            "id": "01",
            "kind": "screenshot",
            "filename": "indexnow-sitemaps-agentic-browsing-llms-txt-body-01-lighthouse-agentic.png",
            "alt": "Chrome Lighthouse Agentic Browsing audit highlighting llms.txt structure checks.",
            "source": "Chrome DevTools Lighthouse on petralian.com after deploy",
            "section": "What Lighthouse Agentic Browsing checks on llms.txt",
            "caption": "*Screenshot: Lighthouse Agentic Browsing / llms.txt — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "screenshot",
            "filename": "indexnow-sitemaps-agentic-browsing-llms-txt-body-02-llms-txt.png",
            "alt": "Excerpt of public llms.txt listing posts with one-line descriptions.",
            "source": "Browser or editor open on https://petralian.com/llms.txt",
            "section": "Three discovery files, three audiences",
            "caption": "*Screenshot: petralian.com/llms.txt excerpt — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "screenshot",
            "filename": "indexnow-sitemaps-agentic-browsing-llms-txt-body-03-indexnow-403.png",
            "alt": "API client or terminal showing IndexNow response including a 403 status.",
            "source": "request-indexing.mjs output; redact keys; show 403 honestly if still open",
            "section": "IndexNow in the pipeline",
            "caption": "*Screenshot: IndexNow response (keys redacted) — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "04",
            "kind": "stock",
            "filename": "indexnow-sitemaps-agentic-browsing-llms-txt-body-04-interchange.jpg",
            "alt": "Aerial highway interchange suggesting multiple crawl and discovery paths.",
            "source": "Pexels: aerial highway interchange night OR Unsplash: network map roads",
            "section": "Why discovery sync matters before agent browsers arrive",
            "caption": '*Photo: TBD — Pexels "highway interchange aerial"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "geo-is-site-legibility-for-agents": [
        {
            "id": "01",
            "kind": "stock",
            "filename": "geo-is-site-legibility-for-agents-body-01-library-light.jpg",
            "alt": "Library stacks with a single shelf lit, suggesting readable passages for retrieval.",
            "source": "Pexels: library light beams OR Unsplash: reading room shelves",
            "section": "What GEO is in 2026",
            "caption": '*Photo: TBD — Pexels "library light shelves"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "screenshot",
            "filename": "geo-is-site-legibility-for-agents-body-02-answer-capsule.png",
            "alt": "Article opening with answer capsule highlighted for extractable GEO passages.",
            "source": "Browser screenshot of a petralian.com post first screen; annotate capsule if useful",
            "section": "What site legibility looks like",
            "caption": "*Screenshot: answer capsule on a published post — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "stock",
            "filename": "geo-is-site-legibility-for-agents-body-03-citation.jpg",
            "alt": "Open book with sticky notes suggesting citable passages.",
            "source": "Pexels: book sticky notes OR Unsplash: highlighted textbook",
            "section": "Path A: test legibility this afternoon",
            "caption": '*Photo: TBD — Pexels "book sticky notes"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "three-file-minimum-for-any-agent-project": [
        {
            "id": "01",
            "kind": "ui",
            "filename": "three-file-minimum-for-any-agent-project-body-01-three-files.png",
            "alt": "File explorer showing Bridge, open-loops, and harness-verify YAML side by side.",
            "source": "Screenshot vault/repo with the three files open; redact secrets",
            "section": "What the three-file minimum is",
            "caption": "*Screenshot: Bridge, open-loops, harness-verify — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "screenshot",
            "filename": "three-file-minimum-for-any-agent-project-body-02-yaml-params.png",
            "alt": "data harness-verify YAML excerpt showing interdependent SEO limits.",
            "source": "VS Code open on data/harness-verify.yaml seo_limits block",
            "section": "File 3: parametric YAML",
            "caption": "*Screenshot: harness-verify.yaml seo_limits — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "stock",
            "filename": "three-file-minimum-for-any-agent-project-body-03-foundation-blocks.jpg",
            "alt": "Three foundation blocks stacked suggesting a minimum operating system for agents.",
            "source": "Pexels: concrete blocks construction OR Unsplash: three stone steps",
            "section": "Path A: start in 30 minutes without a repo",
            "caption": '*Photo: TBD — Pexels "three concrete blocks"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "brand-voice-in-yaml-source-for-humans-and-agents": [
        {
            "id": "01",
            "kind": "screenshot",
            "filename": "brand-voice-in-yaml-source-for-humans-and-agents-body-01-voice-yaml.png",
            "alt": "YAML brand voice file with tone, banned words, and claim limits.",
            "source": "Screenshot your voice YAML (or the article sketch filled); no client secrets",
            "section": "Example YAML sketch",
            "caption": "*Screenshot: brand voice YAML fields — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "stock",
            "filename": "brand-voice-in-yaml-source-for-humans-and-agents-body-02-tuning-fork.jpg",
            "alt": "Tuning fork on a desk suggesting aligned human and agent voice.",
            "source": "Pexels: tuning fork OR Unsplash: metronome desk",
            "section": "What brand voice in YAML means",
            "caption": '*Photo: TBD — Pexels "tuning fork"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "ui",
            "filename": "brand-voice-in-yaml-source-for-humans-and-agents-body-03-agent-load.png",
            "alt": "Agent session start reading brand voice YAML before drafting copy.",
            "source": "Screenshot Cursor/Chat with voice file in context; redact",
            "section": "Example implementation: how I run it",
            "caption": "*Screenshot: agent loading voice YAML — Petralian (2026)*",
            "status": "planned",
        },
    ],
    "cx-metrics-agents-cannot-fake": [
        {
            "id": "01",
            "kind": "stock",
            "filename": "cx-metrics-agents-cannot-fake-body-01-scoreboard.jpg",
            "alt": "Simple scoreboard or KPI board suggesting metrics that resist gaming.",
            "source": "Pexels: scoreboard gym OR Unsplash: kpi dashboard printout (no logos)",
            "section": "Which CX metrics survive agent assistance",
            "caption": '*Photo: TBD — Pexels "scoreboard"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "diagram",
            "filename": "cx-metrics-agents-cannot-fake-body-02-hardness-test.png",
            "alt": "Hardness test flowchart for deciding if a CX metric can be agent-inflated.",
            "source": "Export D2 from this article or redraw as a simple gate chain",
            "section": "Hardness test for any CX metric",
            "caption": "*Diagram: CX metric hardness test — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "stock",
            "filename": "cx-metrics-agents-cannot-fake-body-03-support-desk.jpg",
            "alt": "Customer support desk headset suggesting outcomes agents cannot fake alone.",
            "source": "Pexels: call center headset desk OR Unsplash: support agent empty chair",
            "section": "Metrics that resist gaming",
            "caption": '*Photo: TBD — Pexels "support headset desk"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
    "digital-transformation-is-repo-with-agents-and-bridge-file": [
        {
            "id": "01",
            "kind": "stock",
            "filename": "digital-transformation-is-repo-with-agents-and-bridge-file-body-01-site-office.jpg",
            "alt": "Construction site office trailer at dusk suggesting delivery mechanics over vision slides.",
            "source": "Pexels: construction site office dusk OR Unsplash: site trailer evening",
            "section": "What digital transformation looks like as delivery mechanics",
            "caption": '*Photo: TBD — Pexels "construction site office"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
        {
            "id": "02",
            "kind": "ui",
            "filename": "digital-transformation-is-repo-with-agents-and-bridge-file-body-02-bridge-repo.png",
            "alt": "Split view of Bridge markdown and git repo history for one transformation workstream.",
            "source": "Screenshot Bridge + git log; redact program names",
            "section": "The three delivery objects",
            "caption": "*Screenshot: Bridge file beside repo history — Petralian (2026)*",
            "status": "planned",
        },
        {
            "id": "03",
            "kind": "stock",
            "filename": "digital-transformation-is-repo-with-agents-and-bridge-file-body-03-crane.jpg",
            "alt": "Crane lifting materials suggesting agents accelerate delivery inside guardrails.",
            "source": "Pexels: construction crane sky OR Unsplash: crane lifting beam",
            "section": "What good looks like at week eight",
            "caption": '*Photo: TBD — Pexels "construction crane"; credit photographer; Petralian (2026)*',
            "status": "planned",
        },
    ],
}


def format_body_images_yaml(items: list[dict[str, str]]) -> str:
    lines = ["body_images:"]
    for item in items:
        lines.append(f'  - id: "{item["id"]}"')
        lines.append(f'    kind: {item["kind"]}')
        lines.append(f'    filename: "{item["filename"]}"')
        lines.append(f'    alt: "{item["alt"]}"')
        lines.append(f'    source: "{item["source"]}"')
        lines.append(f'    section: "{item["section"]}"')
        lines.append(f'    status: {item["status"]}')
    return "\n".join(lines)


def upsert_body_images(fm: str, items: list[dict[str, str]]) -> str:
    block = format_body_images_yaml(items) + "\n"
    if re.search(r"^body_images:", fm, re.M):
        fm = re.sub(r"^body_images:.*?(?=\n(?:[A-Za-z_][\w-]*:|\Z))", block, fm, count=1, flags=re.M | re.S)
        return fm
    if re.search(r"^featured_image_alt:", fm, re.M):
        return re.sub(r"(^featured_image_alt:.*\n)", r"\1" + block, fm, count=1, flags=re.M)
    if re.search(r"^format:", fm, re.M):
        return re.sub(r"(^format:)", block + r"\1", fm, count=1, flags=re.M)
    return fm.rstrip() + "\n" + block


def find_h2_insert_index(body: str, section: str) -> int | None:
    """Return index after the first H2 whose text contains the section hint."""
    needle = section.strip().lower()
    for m in re.finditer(r"(?m)^(## .+)$", body):
        heading = m.group(1)[3:].strip().lower()
        if needle in heading or heading in needle:
            # insert after heading line + following blank line / first paragraph break
            after = m.end()
            # skip one newline after heading
            if after < len(body) and body[after] == "\n":
                after += 1
            # if next line is blank, insert after the blank
            if after < len(body) and body[after] == "\n":
                after += 1
            # otherwise insert after first paragraph (until blank line)
            else:
                nxt = body.find("\n\n", after)
                if nxt != -1:
                    after = nxt + 2
            return after
    return None


def embed_block(item: dict[str, str]) -> str:
    caption = item.get("caption") or f'*Photo: TBD — {item["source"]}; Petralian (2026)*'
    return f'![[{item["filename"]}|{item["alt"]}]]\n{caption}\n\n'


def insert_embeds(body: str, items: list[dict[str, str]]) -> tuple[str, int]:
    inserted = 0
    for item in items:
        fname = item["filename"]
        if fname in body or f"![[{fname}" in body:
            continue
        idx = find_h2_insert_index(body, item["section"])
        if idx is None:
            # fallback: before first Path A / Limitations / What to do next
            for fallback in ("Path A", "Limitations", "What to do next", "What program"):
                idx = find_h2_insert_index(body, fallback)
                if idx is not None:
                    break
        if idx is None:
            # append before end
            idx = len(body.rstrip()) + 1
            body = body.rstrip() + "\n\n" + embed_block(item)
            inserted += 1
            continue
        body = body[:idx] + embed_block(item) + body[idx:]
        inserted += 1
    return body, inserted


def process_file(path: Path, dry_run: bool) -> str | None:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None
    fm, body = parts[1], parts[2]
    slug_m = re.search(r"^slug:\s*[\"']?([^\s\"']+)", fm, re.M)
    slug = slug_m.group(1) if slug_m else path.stem
    items = BODY_IMAGES_BY_SLUG.get(slug)
    if not items:
        return None

    new_fm = upsert_body_images(fm, items)
    new_body, n = insert_embeds(body, items)
    new_text = f"---{new_fm}---{new_body}"
    if new_text == text:
        return f"unchanged {path.name}"
    if not dry_run:
        path.write_text(new_text, encoding="utf-8")
    return f"{'would update' if dry_run else 'updated'} {path.name} (+{n} embeds)"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument(
        "--only",
        nargs="*",
        help="Optional slug substrings to limit which files are processed",
    )
    args = ap.parse_args()
    only = [s.lower() for s in (args.only or [])]

    reports = []
    for d in DIRS:
        if not d.is_dir():
            continue
        for md in sorted(d.glob("*.md")):
            if only and not any(o in md.stem.lower() for o in only):
                continue
            # Only touch curated slugs (or published CDP)
            if md.stem not in BODY_IMAGES_BY_SLUG:
                continue
            msg = process_file(md, args.dry_run)
            if msg:
                reports.append(f"{d.name}/{msg}")
                print(reports[-1])
    print(f"done: {len(reports)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
