#!/usr/bin/env node
/**
 * Slug bundle integrity — filename, frontmatter, hero, body_images, embeds, attachments.
 *
 *   node scripts/audit-slug-bundle.mjs
 *   node scripts/audit-slug-bundle.mjs --slug my-article
 *   node scripts/audit-slug-bundle.mjs --slug my-article --old-slug previous-slug
 *
 * Exit: 0 = PASS | 1 = FAIL (mismatches block publish)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = path.join("D:", "Obsidian", "Obsidian", "40_VSCode", "Petralian");
const READY = path.join(VAULT, "Blog", "02 Ready to publish");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"]);

function parseArgs() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf("--slug");
  const oldIdx = args.indexOf("--old-slug");
  return {
    slugFilter: slugIdx !== -1 ? args[slugIdx + 1] : null,
    oldSlug: oldIdx !== -1 ? args[oldIdx + 1] : null,
  };
}

function stripWiki(val) {
  if (!val) return "";
  return String(val)
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function listArticles(slugFilter) {
  if (!fs.existsSync(READY)) return [];
  return fs
    .readdirSync(READY)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(READY, f))
    .filter((p) => !slugFilter || path.basename(p, ".md") === slugFilter);
}

function findImage(name, articleDir) {
  const dirs = [
    path.join(articleDir, "Attachments"),
    articleDir,
    path.join(VAULT, "Blog", "00 Attachments"),
  ];
  for (const d of dirs) {
    const p = path.join(d, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function collectAttachmentFiles(articleDir) {
  const out = [];
  for (const sub of ["Attachments", "."]) {
    const d = path.join(articleDir, sub);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      const ext = path.extname(f).toLowerCase();
      if (IMAGE_EXT.has(ext)) out.push(path.join(d, f));
    }
  }
  return out;
}

function auditArticle(filePath, { oldSlug } = {}) {
  const errors = [];
  const warnings = [];
  const articleDir = path.dirname(filePath);
  const fileStem = path.basename(filePath, ".md");
  const raw = fs.readFileSync(filePath, "utf8");
  const { data: fm, content: body } = matter(raw);
  const slug = String(fm.slug || "").trim();

  if (!slug) errors.push("Missing slug in frontmatter");
  if (fileStem !== slug) {
    errors.push(`Filename stem "${fileStem}" ≠ slug "${slug}" — rename ${fileStem}.md → ${slug}.md`);
  }

  const fi = stripWiki(fm.featured_image);
  const fiName = fi ? path.basename(fi) : "";
  const fiStem = fiName ? path.basename(fiName, path.extname(fiName)) : "";
  if (!fiName) {
    warnings.push("No featured_image");
  } else if (fiStem !== slug) {
    errors.push(`featured_image "${fiName}" stem ≠ slug — use ${slug}${path.extname(fiName) || ".png"}`);
  } else if (!findImage(fiName, articleDir)) {
    errors.push(`featured_image file not found: ${fiName}`);
  }

  const bodySlots = Array.isArray(fm.body_images) ? fm.body_images : [];
  const slotFilenames = new Set(bodySlots.map((s) => s?.filename).filter(Boolean));

  const isCanonicalAsset = (name) => {
    const stem = path.basename(name, path.extname(name));
    return stem === slug || name.startsWith(`${slug}-body-`);
  };

  const isBadSeoFilename = (name) => {
    if (!name || /[\s]/.test(name)) return true;
    if (/^pasted image /i.test(name)) return true;
    if (/^snipaste_/i.test(name)) return true;
    if (/^image\d+\./i.test(name)) return true;
    if (/^screenshot/i.test(name)) return true;
    if (/^capture/i.test(name)) return true;
    return false;
  };

  for (const slot of bodySlots) {
    const fn = slot?.filename;
    if (!fn) continue;
    if (isBadSeoFilename(fn)) {
      errors.push(`body_images ${slot.id}: non-SEO filename "${fn}" — use ${slug}-body-${slot.id}-descriptor.ext`);
    } else if (!isCanonicalAsset(fn)) {
      errors.push(`body_images ${slot.id}: filename "${fn}" must start with "${slug}-body-"`);
    }
    if (slot.status === "embedded" && !findImage(fn, articleDir)) {
      errors.push(`body_images ${slot.id}: embedded file missing: ${fn}`);
    }
  }

  const wikiEmbeds = [...body.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)];
  for (const m of wikiEmbeds) {
    const name = path.basename(m[1].trim());
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    if (isBadSeoFilename(name)) {
      errors.push(`Body embed "${name}" is not SEO-safe — rename to ${slug}-body-NN-descriptor${ext}`);
    } else if (!isCanonicalAsset(name)) {
      errors.push(`Body embed "${name}" must use slug prefix "${slug}-body-"`);
    }
    if (!findImage(name, articleDir)) {
      warnings.push(`Body embed file missing: ${name}`);
    }
  }

  for (const file of collectAttachmentFiles(articleDir)) {
    const base = path.basename(file);
    const referenced =
      base === fiName ||
      slotFilenames.has(base) ||
      body.includes(`[[${base}`) ||
      body.includes(`[[${base}|`);
    if (!referenced) continue;
    if (isBadSeoFilename(base)) {
      errors.push(`Referenced asset "${base}" is not SEO-safe — rename before publish`);
    } else if (!isCanonicalAsset(base)) {
      errors.push(`Referenced asset "${base}" must use slug prefix "${slug}-body-" or hero name`);
    }
  }

  if (oldSlug && oldSlug !== slug) {
    if (raw.includes(oldSlug)) {
      errors.push(`Body/frontmatter still contains old slug "${oldSlug}" — grep and replace`);
    }
    for (const file of collectAttachmentFiles(articleDir)) {
      if (path.basename(file).startsWith(`${oldSlug}-`) || path.basename(file) === `${oldSlug}.png`) {
        errors.push(`Orphan old-slug file: ${path.basename(file)} — rename to ${slug} prefix`);
      }
    }
  }

  return { slug: slug || fileStem, errors, warnings };
}

function grepRepoForSlug(slug) {
  const hits = [];
  const dirs = ["scripts", "data", "content/posts"];
  for (const dir of dirs) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    const walk = (d) => {
      for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, ent.name);
        if (ent.isDirectory()) walk(p);
        else if (/\.(mjs|js|py|json|yaml|md)$/.test(ent.name)) {
          const text = fs.readFileSync(p, "utf8");
          if (text.includes(slug)) hits.push(path.relative(ROOT, p));
        }
      }
    };
    walk(abs);
  }
  return hits;
}

function main() {
  const { slugFilter, oldSlug } = parseArgs();
  const files = listArticles(slugFilter);
  if (files.length === 0) {
    console.log("No Ready articles to audit.");
    process.exit(0);
  }

  let anyFail = false;
  console.log("── Slug bundle audit ─────────────────────────────────────────");

  for (const file of files) {
    const { slug, errors, warnings } = auditArticle(file, { oldSlug });
    const ok = errors.length === 0;
    console.log(`  [${ok ? "PASS" : "FAIL"}] ${slug}`);
    for (const e of errors) {
      console.log(`        ERROR  ${e}`);
      anyFail = true;
    }
    for (const w of warnings) console.log(`        WARN   ${w}`);

    if (oldSlug && oldSlug !== slug) {
      const repoHits = grepRepoForSlug(oldSlug);
      if (repoHits.length) {
        console.log(`        WARN   Repo still references old slug "${oldSlug}":`);
        for (const h of repoHits.slice(0, 8)) console.log(`               ${h}`);
        if (repoHits.length > 8) console.log(`               … +${repoHits.length - 8} more`);
      }
    }
  }

  console.log("────────────────────────────────────────────────────────────────");
  if (anyFail) {
    console.log("Slug bundle FAIL — rename files + frontmatter together, then re-run.");
    process.exit(1);
  }
  console.log("Slug bundle PASS");
}

main();
