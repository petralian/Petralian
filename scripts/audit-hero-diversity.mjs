#!/usr/bin/env node
/**
 * Hero prompt diversity — vault pre-publish gate (SSOT: data/post-publish.yaml).
 *
 *   node scripts/audit-hero-diversity.mjs --slug a --slug b
 *   node scripts/audit-hero-diversity.mjs --ready   # all 02 Ready + 03 Published
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { getPostPublishConfig } from "./lib/load-post-publish-yaml.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = path.join("D:", "Obsidian", "Obsidian", "40_VSCode", "Petralian");
const READY = path.join(VAULT, "Blog", "02 Ready to publish");
const PUBLISHED = path.join(VAULT, "Blog", "03 Published");
const cfg = getPostPublishConfig();

function parseArgs() {
  const slugs = [];
  let ready = false;
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === "--slug") slugs.push(process.argv[++i]);
    else if (process.argv[i] === "--ready") ready = true;
  }
  if (ready) {
    const out = new Set();
    for (const folder of [READY, PUBLISHED]) {
      if (!fs.existsSync(folder)) continue;
      for (const f of fs.readdirSync(folder).filter((x) => x.endsWith(".md"))) {
        out.add(f.replace(/\.md$/, ""));
      }
    }
    return [...out];
  }
  return slugs;
}

function laneCScore(prompt) {
  const p = String(prompt || "").toLowerCase();
  const markers = cfg.hero_diversity.lane_c_markers.map((m) => m.toLowerCase());
  return markers.some((m) => p.includes(m)) ? 1 : 0;
}

function bannedHits(prompt) {
  const p = String(prompt || "").toLowerCase();
  return cfg.hero_diversity.banned_in_image_prompt.filter((t) =>
    p.includes(String(t).toLowerCase())
  );
}

function auditVaultSlug(slug) {
  const errors = [];
  const warnings = [];
  let fp = null;
  for (const folder of [READY, PUBLISHED]) {
    const candidate = path.join(folder, `${slug}.md`);
    if (fs.existsSync(candidate)) {
      fp = candidate;
      break;
    }
  }
  if (!fp) {
    warnings.push("no vault file");
    return { slug, errors, warnings, laneC: 0 };
  }

  const { data } = matter(fs.readFileSync(fp, "utf8"));
  const primary = data.image_prompt || "";
  const laneC = laneCScore(primary);

  for (const hit of bannedHits(primary)) {
    warnings.push(`image_prompt contains discouraged token: "${hit}"`);
  }

  if (
    primary &&
    /\b(node graph|readme|labeled|text overlay|readable)\b/i.test(primary)
  ) {
    warnings.push("image_prompt may embed too much text — prefer cinematic/surreal lanes");
  }

  return { slug, errors, warnings, laneC, date: data.date || "" };
}

const slugs = parseArgs();
if (slugs.length === 0) {
  console.error("Usage: audit-hero-diversity.mjs --slug <slug> | --ready");
  process.exit(1);
}

console.log("\n── Hero diversity (vault) ───────────────────────────────────────");

const results = slugs.map(auditVaultSlug);
let fail = 0;

for (const r of results) {
  const status = r.errors.length ? "FAIL" : r.warnings.length ? "WARN" : "PASS";
  if (r.errors.length) fail++;
  console.log(`  [${status}] ${r.slug}${r.laneC ? " (Lane C primary)" : ""}`);
  for (const e of r.errors) console.log(`        ERROR   ${e}`);
  for (const w of r.warnings) console.log(`        WARN    ${w}`);
}

const batch = results
  .filter((r) => r.date)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  .slice(0, cfg.hero_diversity.window_posts);
const laneCCount = batch.reduce((n, r) => n + (r.laneC ? 1 : 0), 0);

if (batch.length > 0 && laneCCount > cfg.hero_diversity.max_lane_c_primary) {
  console.log(
    `  [FAIL] batch   ${laneCCount}/${batch.length} recent vault posts use Lane C primary (cap ${cfg.hero_diversity.max_lane_c_primary})`
  );
  fail++;
}

console.log("────────────────────────────────────────────────────────────────\n");
process.exit(fail > 0 ? 1 : 0);
