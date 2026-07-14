#!/usr/bin/env node
/**
 * Lighthouse baseline for key URLs (requires lighthouse CLI).
 *
 * Usage:
 *   node scripts/audit-lighthouse.mjs
 *   node scripts/audit-lighthouse.mjs --url https://petralian.com/posts/foo
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dir, "..");
const outDir = path.join(repoRoot, "docs", "seo", "lighthouse");
const site =
  process.argv.find((a, i) => process.argv[i - 1] === "--url") ||
  null;

const DEFAULT_URLS = [
  "https://petralian.com/",
  "https://petralian.com/posts",
  "https://petralian.com/posts/is-cursor-only-for-developers",
];

const urls = site ? [site] : DEFAULT_URLS;
const stamp = new Date().toISOString().slice(0, 10);

fs.mkdirSync(outDir, { recursive: true });

console.log("\n── Lighthouse audit ─────────────────────────────────────────────");

for (const url of urls) {
  const slug = url.replace(/https?:\/\/[^/]+/, "").replace(/\//g, "_") || "home";
  const outFile = path.join(outDir, `${stamp}-${slug}.json`);
  console.log(`  ${url}`);
  try {
    execSync(
      `npx --yes lighthouse "${url}" --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path="${outFile}"`,
      { stdio: "inherit", cwd: repoRoot, timeout: 180000 }
    );
    const report = JSON.parse(fs.readFileSync(outFile, "utf8"));
    const scores = ["performance", "accessibility", "best-practices", "seo"].map(
      (c) => `${c}: ${Math.round((report.categories[c]?.score ?? 0) * 100)}`
    );
    console.log(`    → ${scores.join(" | ")}`);
  } catch (e) {
    console.warn(`    FAILED: ${e.message}`);
  }
}

console.log(`  Reports: docs/seo/lighthouse/`);
console.log("─────────────────────────────────────────────────────────────────\n");
