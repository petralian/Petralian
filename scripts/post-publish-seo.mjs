#!/usr/bin/env node
/**
 * Post-publish SEO/GEO refresh after vault → content/posts sync.
 *
 * - Regenerates public/llms.txt (GEO discovery file)
 * - Prints reminders for dynamic artifacts (sitemap, robots, feed — built at deploy)
 * - Validates SEO fields on newly published slugs
 *
 * Usage:
 *   node scripts/post-publish-seo.mjs [slug ...]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dir, "..");
const POSTS_DIR = path.join(repoRoot, "content/posts");
const SITE_URL = "https://petralian.com";

const slugs = process.argv.slice(2).filter(Boolean);

function countPublishedPosts() {
  if (!fs.existsSync(POSTS_DIR)) return 0;
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const { data } = matter(raw);
      return data.status || "published";
    })
    .filter((s) => s === "published").length;
}

function auditSlug(slug) {
  const fp = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) {
    console.log(`  WARN ${slug}: file missing in content/posts`);
    return;
  }
  const { data } = matter(fs.readFileSync(fp, "utf8"));
  const missing = [];
  if (!data.seo_description) missing.push("seo_description");
  if (!data.focus_keyword) missing.push("focus_keyword");
  if (!data.featured_image_alt) missing.push("featured_image_alt");

  if (missing.length > 0) {
    console.log(`  WARN ${slug}: missing ${missing.join(", ")}`);
  } else {
    console.log(`  OK   ${slug}: seo_description, focus_keyword, featured_image_alt`);
  }
  console.log(`  GSC  → URL Inspection → Request indexing: ${SITE_URL}/posts/${slug}`);
}

console.log("\n── Post-publish SEO/GEO ─────────────────────────────────────────");

execSync(`node "${path.join(__dir, "generate-llms-txt.mjs")}"`, {
  stdio: "inherit",
  cwd: repoRoot,
});

const published = countPublishedPosts();
const staticUrls = 4; // /, /posts, /about, /lost-in-space

console.log("");
console.log("  Artifact          │ Source                         │ Notes");
console.log("  ──────────────────┼────────────────────────────────┼──────────────────────────");
console.log("  public/llms.txt   │ scripts/generate-llms-txt.mjs  │ commit + prebuild refresh");
console.log("  /sitemap.xml      │ src/app/sitemap.ts             │ dynamic at Vercel build");
console.log("  /robots.txt       │ src/app/robots.ts              │ dynamic at Vercel build");
console.log("  /feed.xml         │ src/app/feed.xml/route.ts      │ dynamic, 1h revalidate");
console.log("  /llm.txt, /ai.txt │ next.config.ts redirects       │ → /llms.txt");
console.log("");
console.log(`  Expected sitemap URLs: ~${published + staticUrls} (${published} posts + ${staticUrls} pages)`);
console.log(`  GSC sitemap: ${SITE_URL}/sitemap.xml (auto-updates on deploy — no manual resubmit)`);

if (slugs.length > 0) {
  console.log("\n  Newly published:");
  for (const slug of slugs) auditSlug(slug);
} else {
  console.log("\n  No new slugs passed — skipped per-post SEO audit.");
}

// IndexNow + GSC URL list for new slugs
if (slugs.length > 0) {
  try {
    const slugArgs = slugs.map((s) => `"${s}"`).join(" ");
    execSync(`node "${path.join(__dir, "request-indexing.mjs")}" ${slugArgs}`, {
      stdio: "inherit",
      cwd: repoRoot,
    });
  } catch (e) {
    console.warn("  Indexing pass failed (non-fatal):", e.message);
  }
}

console.log("─────────────────────────────────────────────────────────────────\n");
