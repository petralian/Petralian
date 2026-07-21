#!/usr/bin/env python3
"""Build about-trust.json and extract client logo PNGs from wpress backup."""

from __future__ import annotations

import json
import re
from pathlib import Path

HEADER = 4377
ROOT = Path(__file__).resolve().parents[1]
SQL = Path(__file__).with_name("_wpress-database.sql")
OUT_JSON = ROOT / "content" / "pages" / "about-trust.json"
LOGO_OUT = ROOT / "public" / "images" / "about" / "clients"
WPRESS = Path(
    r"O:\petralian\Backup - Petralian VPS\2025 - VPS backups\2025 06 fr to nn.petralian.com backups\petralian-com-20250605-142740-sczmqawvw0ut.wpress"
)


def iter_wpress_files(path: Path):
    with path.open("rb") as f:
        while True:
            header = f.read(HEADER)
            if len(header) < HEADER:
                break
            name = header[:255].split(b"\x00", 1)[0].decode("utf-8", errors="replace")
            size_str = header[255:269].split(b"\x00", 1)[0].decode("utf-8", errors="replace")
            if not name:
                break
            try:
                size = int(size_str)
            except ValueError:
                break
            yield name, f.read(size)


def pick_logo_paths(sql: str) -> list[str]:
    paths = sorted(
        set(
            re.findall(
                r"wp-content/uploads/2025/01/[A-Za-z0-9_-]+-logo\.png",
                sql,
                re.I,
            )
        )
    )
    bases: dict[str, str] = {}
    for p in paths:
        if ".bk." in p or re.search(r"-\d+x\d+\.png$", p):
            continue
        bases[Path(p).name] = p
    return list(bases.keys())


def extract_testimonials(sql: str) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []

    for m in re.finditer(
        r'author=\\"([^\\"]+)\\".*?job_title=\\"([^\\"]*)\\".*?\](.*?)\\[/et_pb_testimonial\\]',
        sql,
        re.S,
    ):
        quote = re.sub(r"<[^>]+>", " ", m.group(3))
        quote = re.sub(r"\\n", " ", quote)
        quote = re.sub(r"\s+", " ", quote).strip()
        if len(quote) > 30:
            results.append(
                {
                    "author": m.group(1).strip(),
                    "role": m.group(2).strip(),
                    "quote": quote[:500],
                }
            )

    # LayerSlider text layers
    for m in re.finditer(r'"text":"((?:\\.|[^"\\]){20,800})"', sql):
        raw = m.group(1)
        try:
            text = json.loads(f'"{raw}"')
        except json.JSONDecodeError:
            continue
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) < 40 or "{" in text:
            continue
        if text.lower().startswith("brands i worked"):
            continue
        results.append({"author": "", "role": "", "quote": text[:500]})

    seen: set[str] = set()
    deduped: list[dict[str, str]] = []
    for item in results:
        key = item["quote"][:100]
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped[:8]


def main() -> None:
    sql = SQL.read_text("utf-8", errors="replace")
    logo_filenames = pick_logo_paths(sql)
    testimonials = extract_testimonials(sql)

    archive_by_name: dict[str, bytes] = {}
    for name, content in iter_wpress_files(WPRESS):
        archive_by_name[Path(name).name] = content

    LOGO_OUT.mkdir(parents=True, exist_ok=True)
    logos: list[dict[str, str]] = []

    for filename in sorted(logo_filenames):
        content = archive_by_name.get(filename)
        if not content:
            continue
        dest = LOGO_OUT / filename
        dest.write_bytes(content)
        label = filename.replace("-logo.png", "").replace("-", " ")
        logos.append(
            {
                "src": f"/images/about/clients/{filename}",
                "alt": f"{label} logo",
            }
        )

    payload = {
        "logos_heading": "Brands I worked with",
        "testimonials_heading": "What clients say",
        "client_logos": logos,
        "testimonials": testimonials,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"logos extracted: {len(logos)}")
    print(f"testimonials: {len(testimonials)}")
    for t in testimonials[:3]:
        print(" quote:", t.get("quote", "")[:100])


if __name__ == "__main__":
    main()
