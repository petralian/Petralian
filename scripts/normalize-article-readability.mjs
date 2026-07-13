#!/usr/bin/env node
/**
 * Apply readability normalization to published posts (content/posts + vault mirror).
 *
 * Safe transforms:
 * - Add TL;DR block from excerpt when missing (posts >1200 words)
 * - Demote reference/template H2s to H3 under "## Reference"
 * - Demote orientation micro-H2s under "## Getting oriented" when H2 count >8
 * - Simplify vertical D2 blocks: direction down → direction right when ≤5 top-level nodes
 *
 * Usage:
 *   node scripts/normalize-article-readability.mjs [--dry-run]
 *   node scripts/normalize-article-readability.mjs --vault "D:/Obsidian/.../Blog/03 Published"
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const REPO_POSTS = path.join(__dir, "..", "content", "posts");
const DEFAULT_VAULT = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Blog",
  "03 Published",
);

const REFERENCE_H2 =
  /^(decision note template|stakeholder map|meeting prep|voice for|governance footer|decision index|beginner:|advanced:|quick reference|applied ai thought leadership|limitations|sources|reader action|what you can do next|replication kit|folder scaffold|work-routing|voice-guide|bootstrap block|current priority|open loops|next physical action|status$|this week|blockers|decisions pending|links$|context$|options considered|decision$|who was informed|review date|raid log|bridge\.md|escalation ladder|batch routing)/i;

const ORIENT_H2 =
  /^(who this is for|where this sits|how to start with this playbook|how to start)/i;

const BOILERPLATE_H2 = /^(common mistakes|faq|sources|quick reference|reader action|what you can do next)$/i;

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

function countH2(content) {
  return content.split(/\r?\n/).filter((l) => /^## /.test(l)).length;
}

function addTldr(content, excerpt, title) {
  if (hasTldr(content)) return content;
  let bullets = [];
  if (excerpt) {
    bullets = excerpt
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20)
      .slice(0, 3);
  }
  if (bullets.length === 0 && title) {
    bullets = [`What ${title.replace(/^The /i, "").slice(0, 80)} covers`, "Who it is for and when to use it", "Practical next steps after reading"];
  }
  if (bullets.length === 0) return content;
  const block = [
    "**TL;DR**",
    "",
    ...bullets.map((b) => `- ${b}.`),
    "",
  ].join("\n");

  const hr = content.indexOf("\n---\n");
  if (hr >= 0) {
    return content.slice(0, hr + 5) + block + content.slice(hr + 5);
  }
  const firstPara = content.search(/\n\n/);
  if (firstPara >= 0) {
    return content.slice(0, firstPara + 2) + block + "\n" + content.slice(firstPara + 2);
  }
  return block + "\n\n" + content;
}

function demoteH2Section(content, titlePattern, parentTitle) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let i = 0;
  let parentInserted = false;

  while (i < lines.length) {
    const m = lines[i].match(/^## (.+)$/);
    if (m && titlePattern.test(m[1].trim())) {
      if (!parentInserted) {
        out.push(`## ${parentTitle}`, "");
        parentInserted = true;
      }
      out.push(`### ${m[1]}`);
      i++;
      while (i < lines.length && !/^## /.test(lines[i])) {
        out.push(lines[i]);
        i++;
      }
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n");
}

function normalizeD2(content) {
  return content.replace(/```d2\n([\s\S]*?)```/g, (full, chart) => {
    if (!/^direction:\s*down/im.test(chart)) return full;
    const topNodes = chart.match(/^[a-zA-Z][\w-]*\s*:/gm) || [];
    if (topNodes.length > 6) return full;
    const next = chart.replace(/^direction:\s*down\s*\n?/im, "direction: right\n\n");
    return `\`\`\`d2\n${next}\`\`\``;
  });
}

function demoteExcessH2(content, maxKeep = 5) {
  const lines = content.split(/\r?\n/);
  const h2Indices = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (.+)$/);
    if (m && !BOILERPLATE_H2.test(m[1].trim())) {
      h2Indices.push({ i, title: m[1].trim() });
    }
  }
  if (h2Indices.length <= maxKeep) return content;

  const demoteSet = new Set(
    h2Indices.slice(maxKeep).map((h) => h.i),
  );
  let parentInserted = false;
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (.+)$/);
    if (m && demoteSet.has(i)) {
      if (!parentInserted) {
        out.push("## Additional detail", "");
        parentInserted = true;
      }
      out.push(`### ${m[1]}`);
      continue;
    }
    out.push(lines[i]);
  }
  return out.join("\n");
}

function normalizeBody(content, excerpt, title) {
  let body = content;
  if (wordCount(body) > 800) {
    body = addTldr(body, excerpt, title);
  }

  if (countH2(body) > 8) {
    body = demoteH2Section(body, REFERENCE_H2, "Reference");
  }
  if (countH2(body) > 8) {
    body = demoteH2Section(body, ORIENT_H2, "Getting oriented");
  }

  body = normalizeD2(body);

  if (countH2(body) > 8) {
    body = demoteExcessH2(body, 5);
  }

  return body;
}

function processFile(filePath, dryRun) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const beforeH2 = countH2(parsed.content);
  const nextContent = normalizeBody(parsed.content, parsed.data.excerpt || "", parsed.data.title || "");
  const afterH2 = countH2(nextContent);

  if (nextContent === parsed.content) return null;

  const result = matter.stringify(nextContent, parsed.data);
  if (!dryRun) fs.writeFileSync(filePath, result, "utf8");
  return { file: path.basename(filePath), beforeH2, afterH2 };
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const vaultIdx = process.argv.indexOf("--vault");
  const vaultDir =
    vaultIdx >= 0 && process.argv[vaultIdx + 1]
      ? process.argv[vaultIdx + 1]
      : fs.existsSync(DEFAULT_VAULT)
        ? DEFAULT_VAULT
        : null;

  const dirs = [REPO_POSTS];
  if (vaultDir) dirs.push(vaultDir);

  const changed = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const res = processFile(path.join(dir, file), dryRun);
      if (res) changed.push({ ...res, dir });
    }
  }

  console.log(dryRun ? "[dry-run] " : "", `Updated ${changed.length} files`);
  for (const c of changed.slice(0, 30)) {
    console.log(`  ${c.file}: H2 ${c.beforeH2} → ${c.afterH2}`);
  }
  if (changed.length > 30) console.log(`  ... +${changed.length - 30} more`);
}

main();
