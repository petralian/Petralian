#!/usr/bin/env node
/**
 * Post-publish indexing: IndexNow ping + GSC URL Inspection links.
 *
 * GSC URL Inspection API requires OAuth/service account — not automated here.
 * IndexNow notifies Bing/Yandex; Google still needs manual URL Inspection (~10–20/day).
 *
 * Usage:
 *   node scripts/request-indexing.mjs slug [slug ...]
 *   node scripts/request-indexing.mjs --batch-2026-07-14
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SITE_URL,
  NEW_BATCH_SLUGS_2026_07_14,
} from "./lib/seo-utils.mjs";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dir, "..");
const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || "petralian-indexnow-2026";
const KEY_FILE = path.join(repoRoot, "public", `${INDEXNOW_KEY}.txt`);
const GSC_INSPECT_BASE =
  "https://search.google.com/search-console/inspect?resource_id=sc-domain%3Apetralian.com";

const args = process.argv.slice(2);
let slugs = args.filter((a) => !a.startsWith("--"));

if (args.includes("--batch-2026-07-14")) {
  slugs = [...NEW_BATCH_SLUGS_2026_07_14];
}

if (slugs.length === 0) {
  console.error("Usage: node scripts/request-indexing.mjs [--batch-2026-07-14] slug ...");
  process.exit(1);
}

const urls = slugs.map((s) => `${SITE_URL}/posts/${s}`);

// Ensure IndexNow key file exists (served at /{key}.txt)
if (!fs.existsSync(KEY_FILE)) {
  fs.writeFileSync(KEY_FILE, INDEXNOW_KEY, "utf8");
  console.log(`Created ${path.relative(repoRoot, KEY_FILE)} — commit for IndexNow verification.`);
}

console.log("\n── Indexing pass ────────────────────────────────────────────────");
console.log(`  URLs: ${urls.length}`);

// IndexNow (Bing, Yandex, and partners)
const indexNowBody = {
  host: "petralian.com",
  key: INDEXNOW_KEY,
  keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
  urlList: urls,
};

let indexNowOk = false;
try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowBody),
  });
  indexNowOk = res.ok || res.status === 202;
  console.log(`  IndexNow: ${res.status} ${indexNowOk ? "OK" : "FAILED"}`);
} catch (e) {
  console.log(`  IndexNow: skipped (${e.message})`);
}

console.log("\n  GSC URL Inspection (manual — ~10–20 requests/day):");
console.log(`  Open: ${GSC_INSPECT_BASE}\n`);

for (const url of urls) {
  const encoded = encodeURIComponent(url);
  console.log(`  • ${url}`);
  console.log(`    ${GSC_INSPECT_BASE}&url=${encoded}`);
}

console.log("\n  Sitemap (auto on deploy): " + `${SITE_URL}/sitemap.xml`);
console.log("─────────────────────────────────────────────────────────────────\n");

if (!indexNowOk) {
  console.log("Note: IndexNow failed or unverified until key file is deployed.");
}
