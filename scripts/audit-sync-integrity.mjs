#!/usr/bin/env node
/**
 * Vault ↔ live integrity — blocks truncated syncs.
 *
 *   node scripts/audit-sync-integrity.mjs --slug a --slug b
 *   node scripts/audit-sync-integrity.mjs --all-synced   # every slug in content/posts with vault source
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { getPostPublishConfig } from "./lib/load-post-publish-yaml.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = path.join(ROOT, "content", "posts");
const VAULT = path.join("D:", "Obsidian", "Obsidian", "40_VSCode", "Petralian");
const READY = path.join(VAULT, "Blog", "02 Ready to publish");
const PUBLISHED = path.join(VAULT, "Blog", "03 Published");
const cfg = getPostPublishConfig();

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function vaultPathForSlug(slug) {
  for (const folder of [READY, PUBLISHED]) {
    const fp = path.join(folder, `${slug}.md`);
    if (fs.existsSync(fp)) return fp;
  }
  return null;
}

function parseArgs() {
  const slugs = [];
  let allSynced = false;
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === "--slug") slugs.push(process.argv[++i]);
    else if (process.argv[i] === "--all-synced") allSynced = true;
  }
  if (allSynced) {
    return fs
      .readdirSync(POSTS)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .filter((slug) => vaultPathForSlug(slug));
  }
  return slugs;
}

function auditSlug(slug) {
  const errors = [];
  const warnings = [];
  const vaultFp = vaultPathForSlug(slug);
  const liveFp = path.join(POSTS, `${slug}.md`);

  if (!vaultFp) {
    warnings.push("no vault source in 02 Ready or 03 Published");
    return { slug, errors, warnings };
  }
  if (!fs.existsSync(liveFp)) {
    errors.push("missing live file in content/posts");
    return { slug, errors, warnings };
  }

  const vaultRaw = fs.readFileSync(vaultFp, "utf8");
  const liveRaw = fs.readFileSync(liveFp, "utf8");
  const vault = matter(vaultRaw);
  const live = matter(liveRaw);
  const vaultWc = wordCount(vault.content);
  const liveWc = wordCount(live.content);

  if (!/^---\s*\n[\s\S]+?\n---/.test(liveRaw)) {
    errors.push("live post: frontmatter missing closing ---");
  }

  if (liveWc < cfg.body.min_words_blocking) {
    errors.push(`live body too short: ${liveWc} words`);
  }

  if (vaultWc >= cfg.body.min_words_blocking && liveWc < vaultWc * 0.85) {
    errors.push(
      `live body truncated vs vault (${liveWc} vs ${vaultWc} words — need ≥85% of vault)`
    );
  }

  if (!live.data.format && vault.data.format) {
    errors.push(
      `live missing format (vault has "${vault.data.format}") — card will show tag fallback`
    );
  }

  if (!live.data.format && !vault.data.format) {
    errors.push("missing format in both vault and live");
  }

  if (!live.data.best_for?.trim() && vault.data.best_for?.trim()) {
    errors.push("live missing best_for (present in vault)");
  }

  return { slug, errors, warnings, vaultWc, liveWc };
}

const slugs = parseArgs();
if (slugs.length === 0) {
  console.error("Usage: audit-sync-integrity.mjs --slug <slug> | --all-synced");
  process.exit(1);
}

console.log("\n── Vault ↔ live sync integrity ─────────────────────────────────");

let fail = 0;
for (const slug of slugs) {
  const r = auditSlug(slug);
  const status = r.errors.length ? "FAIL" : r.warnings.length ? "WARN" : "PASS";
  if (r.errors.length) fail++;
  const counts =
    r.vaultWc !== undefined ? ` (vault ${r.vaultWc} → live ${r.liveWc} words)` : "";
  console.log(`  [${status}] ${slug}${counts}`);
  for (const e of r.errors) console.log(`        ERROR   ${e}`);
  for (const w of r.warnings) console.log(`        WARN    ${w}`);
}

console.log("────────────────────────────────────────────────────────────────\n");
process.exit(fail > 0 ? 1 : 0);
