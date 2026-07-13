#!/usr/bin/env node
/**
 * Merge domain lists into docs/seo/disavow-YYYY-MM-DD.txt
 *
 * Usage:
 *   node scripts/merge-disavow-domains.mjs
 *   node scripts/merge-disavow-domains.mjs --out docs/seo/disavow-2026-07-13.txt path/to/new.csv
 *
 * CSV: uses "Source Domain" column (Semrush Backlink Audit export).
 * TXT: existing disavow file with domain:example.com lines.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_OUT = path.join(ROOT, "docs/seo/disavow-2026-07-13.txt");
const DEFAULT_CSV =
  process.env.SEMRUSH_BACKLINK_CSV ||
  "C:/Users/User/Downloads/backlink_audit_domains_30396432_2026-07-13.csv";

const args = process.argv.slice(2);
let outFile = DEFAULT_OUT;
const inputs = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out" && args[i + 1]) {
    outFile = path.resolve(ROOT, args[++i]);
  } else {
    inputs.push(path.resolve(args[i]));
  }
}

if (inputs.length === 0) {
  inputs.push(DEFAULT_OUT, DEFAULT_CSV);
}

function parseDisavow(text) {
  return new Set(
    [...text.matchAll(/^domain:(.+)$/gm)].map((m) => m[1].trim().toLowerCase())
  );
}

function parseSemrushCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return new Set();
  const header = lines[0].split(",");
  const domainIdx = header.findIndex((h) => h.trim() === "Source Domain");
  if (domainIdx === -1) {
    throw new Error('CSV missing "Source Domain" column');
  }
  const domains = new Set();
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const domain = cols[domainIdx]?.trim().toLowerCase();
    if (domain) domains.add(domain);
  }
  return domains;
}

function readDomains(file) {
  const text = fs.readFileSync(file, "utf8");
  if (file.endsWith(".csv")) return parseSemrushCsv(text);
  return parseDisavow(text);
}

const merged = new Set();
const sources = [];

for (const file of inputs) {
  if (!fs.existsSync(file)) {
    console.warn(`Skip (not found): ${file}`);
    continue;
  }
  const domains = readDomains(file);
  sources.push({ file: path.basename(file), count: domains.size });
  for (const d of domains) merged.add(d);
}

const sorted = [...merged].sort();
const today = new Date().toISOString().slice(0, 10);
const sourceLines = sources.map((s) => `#   - ${s.file} (${s.count} domains)`).join("\n");

const output = [
  "# Petralian — passive spam / link-farm domains (not purchased)",
  `# Updated: ${today}`,
  "# Sources:",
  sourceLines,
  `# Total unique domains: ${sorted.length}`,
  "# Upload to GSC only if Manual Action exists or indexation stalls after 4-6 weeks",
  "# See docs/seo/backlink-audit-2026-07-13.md",
  "",
  ...sorted.map((d) => `domain:${d}`),
  "",
].join("\n");

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, output);

console.log(`Wrote ${sorted.length} domains → ${path.relative(ROOT, outFile)}`);
for (const s of sources) {
  console.log(`  ${s.file}: ${s.count}`);
}
