#!/usr/bin/env node
/**
 * Pre-publish gate: internal links + SEO meta on target slugs.
 *
 * Usage:
 *   node scripts/audit-pre-publish.mjs slug [slug ...]
 *   node scripts/audit-pre-publish.mjs --from-stdin   # slugs one per line
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  auditSeoFields,
  readPost,
  NEW_BATCH_SLUGS_2026_07_14,
} from "./lib/seo-utils.mjs";

const POSTS_DIR = path.resolve(import.meta.dirname, "../content/posts");

let slugs = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (process.argv.includes("--batch-2026-07-14")) {
  slugs = [...NEW_BATCH_SLUGS_2026_07_14];
}

if (process.argv.includes("--from-stdin")) {
  slugs = fs.readFileSync(0, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

if (slugs.length === 0) {
  console.error("Usage: node scripts/audit-pre-publish.mjs slug [slug ...]");
  process.exit(1);
}

console.log("\n── Pre-publish audit ────────────────────────────────────────────");

let failed = false;

for (const slug of slugs) {
  const post = readPost(POSTS_DIR, slug);
  if (!post) {
    console.log(`  FAIL ${slug}: missing in content/posts`);
    failed = true;
    continue;
  }
  const { issues } = auditSeoFields(post.data);
  const blocking = issues.filter(
    (i) =>
      i.includes("missing seo_description") ||
      i.includes("missing focus_keyword") ||
      i.includes("missing featured_image_alt")
  );
  if (blocking.length > 0) {
    console.log(`  FAIL ${slug}: ${blocking.join("; ")}`);
    failed = true;
  } else if (issues.length > 0) {
    console.log(`  WARN ${slug}: ${issues.join("; ")}`);
  } else {
    console.log(`  OK   ${slug}`);
  }
}

// Internal links — full repo scan (fast enough)
try {
  execSync("node scripts/audit-internal-links.mjs", {
    stdio: "pipe",
    cwd: path.join(import.meta.dirname, ".."),
  });
  console.log("  OK   internal links");
} catch {
  console.log("  FAIL internal links (see audit-internal-links.mjs)");
  failed = true;
}

console.log("─────────────────────────────────────────────────────────────────\n");
process.exit(failed ? 1 : 0);
