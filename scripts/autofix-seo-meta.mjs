#!/usr/bin/env node
/**
 * Auto-fix easy SEO/GEO frontmatter gaps in content/posts.
 * Only fills missing or clearly broken fields — does not rewrite good copy.
 *
 * Usage:
 *   node scripts/autofix-seo-meta.mjs              # all published posts
 *   node scripts/autofix-seo-meta.mjs slug [slug]    # specific slugs
 *   node scripts/autofix-seo-meta.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  trimSeoTitle,
  trimSeoDescription,
  deriveFocusKeyword,
  deriveFeaturedAlt,
  generateExcerpt,
  auditSeoFields,
} from "./lib/seo-utils.mjs";

const POSTS_DIR = path.resolve(import.meta.dirname, "../content/posts");
const dryRun = process.argv.includes("--dry-run");
const slugArgs = process.argv.slice(2).filter((a) => !a.startsWith("--"));

function listSlugs() {
  if (slugArgs.length > 0) return slugArgs;
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function upsertFrontmatterLine(fmBlock, key, value) {
  const line = `${key}: "${value.replace(/"/g, '\\"')}"`;
  const re = new RegExp(`^${key}:\\s*.+$`, "m");
  if (re.test(fmBlock)) return fmBlock.replace(re, line);
  return fmBlock.trimEnd() + "\n" + line;
}

let fixed = 0;
let skipped = 0;

for (const slug of listSlugs()) {
  const fp = path.join(POSTS_DIR, `${slug}.md`);
  const raw = fs.readFileSync(fp, "utf8");
  const parsed = matter(raw);
  const { data, content } = parsed;
  if ((data.status || "published") !== "published") continue;

  const before = auditSeoFields(data);
  if (before.issues.length === 0) {
    skipped++;
    continue;
  }

  let next = { ...data };
  const changes = [];

  if (!next.seo_description?.trim()) {
    const ex = next.excerpt?.trim() || generateExcerpt(content);
    if (ex) {
      next.seo_description = trimSeoDescription(ex);
      changes.push("seo_description");
    }
  } else if (next.seo_description.length > 165) {
    next.seo_description = trimSeoDescription(next.seo_description);
    changes.push("seo_description(trim)");
  }

  if (!next.seo_title?.trim()) {
    next.seo_title = trimSeoTitle(next.title || slug);
    changes.push("seo_title");
  } else if (next.seo_title.length > 65) {
    next.seo_title = trimSeoTitle(next.seo_title);
    changes.push("seo_title(trim)");
  } else if (next.seo_title.length < 50 && next.title && next.title.length >= 50) {
    next.seo_title = trimSeoTitle(next.title);
    changes.push("seo_title(from title)");
  }

  if (!next.excerpt?.trim() && next.seo_description) {
    next.excerpt = next.seo_description.slice(0, 200);
    changes.push("excerpt");
  }

  if (!next.focus_keyword?.trim()) {
    next.focus_keyword = deriveFocusKeyword(next);
    changes.push("focus_keyword");
  }

  if (!next.featured_image_alt?.trim()) {
    next.featured_image_alt = deriveFeaturedAlt(next);
    changes.push("featured_image_alt");
  }

  if (changes.length === 0) {
    skipped++;
    continue;
  }

  if (dryRun) {
    console.log(`[dry-run] ${slug}: ${changes.join(", ")}`);
    fixed++;
    continue;
  }

  const rebuilt = matter.stringify(content, next);
  fs.writeFileSync(fp, rebuilt, "utf8");
  console.log(`FIX ${slug}: ${changes.join(", ")}`);
  fixed++;
}

console.log(`\n${dryRun ? "[dry-run] " : ""}Fixed ${fixed}, skipped ${skipped} (no easy fixes).`);
