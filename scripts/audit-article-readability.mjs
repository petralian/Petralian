#!/usr/bin/env node
/**
 * Audit heading density and readability flags for all published posts.
 * Usage: node scripts/audit-article-readability.mjs [--out docs/editorial/readability-audit.md]
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dir, "..", "content", "posts");

const OUTLINE_EXCLUDE =
  /^(common mistakes|faq|sources|quick reference|reader action|what you can do next)$/i;

function countHeadings(content) {
  let h2 = 0;
  let h3 = 0;
  for (const line of content.split(/\r?\n/)) {
    if (/^## /.test(line)) h2++;
    if (/^### /.test(line)) h3++;
  }
  return { h2, h3, total: h2 + h3 };
}

function navEstimate(h2Titles) {
  return h2Titles.filter((t) => !OUTLINE_EXCLUDE.test(t.trim())).length;
}

function wordCount(content) {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_\[\]()!`~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function hasTldr(content) {
  return /\*\*TL;DR\*\*|^##\s+TL;DR/im.test(content);
}

const rows = [];
for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  if (data.status && data.status !== "published") continue;

  const { h2, h3, total } = countHeadings(content);
  const h2Titles = content
    .split(/\r?\n/)
    .filter((l) => /^## /.test(l))
    .map((l) => l.replace(/^##\s+/, "").trim());
  const nav = navEstimate(h2Titles);
  const words = wordCount(content);
  const flags = [];
  if (h2 > 8) flags.push(">8 H2");
  if (total > 12) flags.push(">12 headings");
  if (nav > 8) flags.push(">8 nav");
  if (words > 800 && !hasTldr(content)) flags.push("no TL;DR");

  rows.push({
    slug: data.slug || file.replace(/\.md$/, ""),
    h2,
    h3,
    total,
    nav,
    words,
    flags,
  });
}

rows.sort((a, b) => b.h2 - a.h2 || b.total - a.total);

const outArg = process.argv.indexOf("--out");
const outPath =
  outArg >= 0
    ? process.argv[outArg + 1]
    : path.join(__dir, "..", "docs", "editorial", `readability-audit-${new Date().toISOString().slice(0, 10)}.md`);

const lines = [
  "# Article readability audit",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Posts: ${rows.length} | Flagged: ${rows.filter((r) => r.flags.length).length}`,
  "",
  "| Slug | H2 | H3 | Nav est. | Words | Flags |",
  "|------|----|----|----------|-------|-------|",
  ...rows.map(
    (r) =>
      `| ${r.slug} | ${r.h2} | ${r.h3} | ${r.nav} | ${r.words} | ${r.flags.join(", ") || "—"} |`,
  ),
  "",
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath}`);
console.log(`Flagged: ${rows.filter((r) => r.flags.length).length} / ${rows.length}`);
