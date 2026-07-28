#!/usr/bin/env node
/**
 * Audit content/posts for publish integrity (body, format, vault leaks, hero diversity).
 *
 *   node scripts/audit-live-posts.mjs
 *   node scripts/audit-live-posts.mjs --slug my-post
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { getPostPublishConfig } from "./lib/load-post-publish-yaml.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = path.join(ROOT, "content", "posts");
const cfg = getPostPublishConfig();

function parseArgs() {
  const idx = process.argv.indexOf("--slug");
  return { slug: idx !== -1 ? process.argv[idx + 1] : null };
}

function wordCount(content) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function auditPost(slug) {
  const fp = path.join(POSTS, `${slug}.md`);
  const errors = [];
  const warnings = [];
  const raw = fs.readFileSync(fp, "utf8");

  if (!/^---\s*\n[\s\S]+?\n---/.test(raw)) {
    errors.push("frontmatter missing closing --- delimiter");
  }

  const parsed = matter(raw);
  const wc = wordCount(parsed.content);

  for (const field of cfg.required_frontmatter) {
    const val = parsed.data[field];
    if (val === undefined || val === null || String(val).trim() === "") {
      errors.push(`missing required frontmatter: ${field}`);
    }
  }

  if (parsed.data.format && !cfg.format_allowed.includes(parsed.data.format)) {
    errors.push(`invalid format: ${parsed.data.format}`);
  }

  for (const key of cfg.vault_only_frontmatter) {
    if (parsed.data[key] !== undefined) {
      warnings.push(`vault-only field leaked to live post: ${key}`);
    }
  }

  if (wc < cfg.body.min_words_blocking) {
    errors.push(`body too short: ${wc} words (blocking < ${cfg.body.min_words_blocking})`);
  } else if (wc < cfg.body.min_words) {
    warnings.push(`low word count: ${wc} (recommended ≥ ${cfg.body.min_words})`);
  }

  if (parsed.data.tags?.[0] && !parsed.data.format) {
    warnings.push(
      `no format — card badge falls back to first tag "${parsed.data.tags[0]}" (use strategic|hands-on|hybrid)`
    );
  }

  return { slug, errors, warnings, wc, data: parsed.data };
}

function auditHeroDiversity(results) {
  const warnings = [];
  const window = results.slice(0, cfg.hero_diversity.window_posts);
  const markers = cfg.hero_diversity.lane_c_markers.map((m) => m.toLowerCase());
  let laneC = 0;
  for (const r of window) {
    const prompt = String(r.data.image_prompt || "").toLowerCase();
    if (markers.some((m) => prompt.includes(m))) laneC++;
  }
  if (laneC > cfg.hero_diversity.max_lane_c_primary) {
    warnings.push(
      `hero diversity: ${laneC}/${window.length} recent posts use Lane C (isometric/poster) primary prompts — cap is ${cfg.hero_diversity.max_lane_c_primary}`
    );
  }
  return warnings;
}

const { slug: slugFilter } = parseArgs();
const slugs = slugFilter
  ? [slugFilter]
  : fs.readdirSync(POSTS).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));

console.log("\n── Live posts audit ─────────────────────────────────────────────");

let fail = 0;
const results = [];

for (const slug of slugs) {
  const r = auditPost(slug);
  results.push(r);
  const status = r.errors.length ? "FAIL" : r.warnings.length ? "WARN" : "PASS";
  if (r.errors.length) fail++;
  console.log(`  [${status}] ${slug} (${r.wc} words)`);
  for (const e of r.errors) console.log(`        ERROR   ${e}`);
  for (const w of r.warnings) console.log(`        WARN    ${w}`);
}

if (!slugFilter) {
  for (const w of auditHeroDiversity(results)) {
    console.log(`  [WARN] site-wide   ${w}`);
  }
}

console.log("────────────────────────────────────────────────────────────────\n");
process.exit(fail > 0 ? 1 : 0);
