#!/usr/bin/env node
/**
 * Generate Google disavow file from Ahrefs referring-domains CSV export.
 *
 * Usage:
 *   node scripts/generate-disavow.mjs --input path/to/export.csv
 *   node scripts/generate-disavow.mjs --input export.csv --output docs/seo/disavow-2026-07-13.txt
 *   node scripts/generate-disavow.mjs --input export.csv --include-legacy  (adds contao.org, curiosithee.be)
 */
import fs from "node:fs";
import path from "node:path";

const LEGACY_DOFOLLOW = ["contao.org", "curiosithee.be"];

function parseArgs(argv) {
  const args = { input: "", output: "", includeLegacy: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--input" && argv[i + 1]) args.input = argv[++i];
    else if (argv[i] === "--output" && argv[i + 1]) args.output = argv[++i];
    else if (argv[i] === "--include-legacy") args.includeLegacy = true;
  }
  return args;
}

function readCsvRows(filePath) {
  const raw = fs.readFileSync(filePath);
  let text;
  if (raw[0] === 0xff && raw[1] === 0xfe) {
    text = raw.toString("utf16le");
  } else {
    text = raw.toString("utf8");
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split("\t").map((h) =>
    h.replace(/^\uFEFF/, "").replace(/^"|"$/g, "")
  );
  return lines.slice(1).map((line) => {
    const cols = line.split("\t").map((c) => c.replace(/^"|"$/g, ""));
    const row = {};
    header.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function domainFromRow(row) {
  return (row.Domain || row.domain || Object.values(row)[0] || "")
    .trim()
    .toLowerCase();
}

const args = parseArgs(process.argv);
if (!args.input) {
  console.error(
    "Usage: node scripts/generate-disavow.mjs --input <ahrefs-csv> [--output <path>] [--include-legacy]"
  );
  process.exit(1);
}

const inputPath = path.resolve(args.input);
const rows = readCsvRows(inputPath);

const spamDomains = rows
  .filter((r) => r["Is spam"] === "true")
  .map(domainFromRow)
  .filter(Boolean);

const legacy = args.includeLegacy ? LEGACY_DOFOLLOW : [];
const domains = [...new Set([...spamDomains, ...legacy])].sort();

const date = new Date().toISOString().slice(0, 10);
const defaultOut = path.resolve(
  import.meta.dirname,
  `../docs/seo/disavow-${date}.txt`
);
const outputPath = args.output ? path.resolve(args.output) : defaultOut;

const lines = [
  "# Petralian — passive spam / link-farm domains (not purchased)",
  `# Generated: ${date}`,
  `# Source: ${path.basename(inputPath)}`,
  `# Spam domains: ${spamDomains.length}`,
  `# Upload to GSC only if Manual Action exists or indexation fails after 4-6 weeks`,
  "",
  ...domains.map((d) => `domain:${d}`),
  "",
];

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

console.log(`Wrote ${outputPath}`);
console.log(`  Total domains: ${domains.length}`);
console.log(`  Spam (Ahrefs): ${spamDomains.length}`);
if (args.includeLegacy) console.log(`  Legacy dofollow: ${legacy.join(", ")}`);
