#!/usr/bin/env node
/**
 * Re-copy vault articles into content/posts (fixes truncated syncs).
 *
 *   node scripts/resync-from-vault.mjs --slug hong-kong-customer-ai-is-still-mostly-a-label
 *   node scripts/resync-from-vault.mjs --broken   # resync posts failing live audit
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { transformVaultArticle } from "./lib/vault-publish-transform.mjs";
import { getPostPublishConfig } from "./lib/load-post-publish-yaml.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = path.join("D:", "Obsidian", "Obsidian", "40_VSCode", "Petralian");
const PUBLISHED = path.join(VAULT, "Blog", "03 Published");
const READY = path.join(VAULT, "Blog", "02 Ready to publish");
const SITE_POSTS = path.join(ROOT, "content", "posts");
const SITE_IMAGES = path.join(ROOT, "public", "images", "posts");

function vaultPathForSlug(slug) {
  for (const folder of [READY, PUBLISHED]) {
    const fp = path.join(folder, `${slug}.md`);
    if (fs.existsSync(fp)) return fp;
  }
  return null;
}

function listBrokenSlugs() {
  const cfg = getPostPublishConfig();
  return fs
    .readdirSync(SITE_POSTS)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .filter((slug) => {
      const raw = fs.readFileSync(path.join(SITE_POSTS, `${slug}.md`), "utf8");
      const parsed = matter(raw);
      const wc = parsed.content.trim().split(/\s+/).filter(Boolean).length;
      if (wc < cfg.body.min_words_blocking) return true;
      if (!parsed.data.format) return true;
      if (!/^---\s*\n[\s\S]+?\n---/.test(raw)) return true;
      return false;
    });
}

function main() {
  const broken = process.argv.includes("--broken");
  const slugIdx = process.argv.indexOf("--slug");
  const slugs =
    slugIdx !== -1
      ? [process.argv[slugIdx + 1]]
      : broken
        ? listBrokenSlugs()
        : [];

  if (slugs.length === 0) {
    console.error("Usage: node scripts/resync-from-vault.mjs --slug <slug> | --broken");
    process.exit(1);
  }

  const cfg = getPostPublishConfig();
  let ok = 0;

  for (const slug of slugs) {
    const vaultFile = vaultPathForSlug(slug);
    if (!vaultFile) {
      console.error(`  SKIP ${slug} — not in vault 02 Ready or 03 Published`);
      continue;
    }
    const raw = fs.readFileSync(vaultFile, "utf8");
    const articleFolder = path.dirname(vaultFile);
    const out = transformVaultArticle(raw, {
      articleFolder,
      siteImages: SITE_IMAGES,
      vaultRoot: VAULT,
    });
    const parsed = matter(out);
    const wc = parsed.content.trim().split(/\s+/).filter(Boolean).length;
    if (wc < cfg.body.min_words_blocking) {
      console.error(`  FAIL ${slug} — vault transform still short (${wc} words)`);
      continue;
    }
    if (!parsed.data.format) {
      console.error(`  FAIL ${slug} — missing format in vault frontmatter`);
      continue;
    }
    fs.writeFileSync(path.join(SITE_POSTS, `${slug}.md`), out, "utf8");
    console.log(`  OK ${slug} → content/posts (${wc} words, format=${parsed.data.format})`);
    ok++;
  }

  process.exit(ok === slugs.length ? 0 : 1);
}

main();
