#!/usr/bin/env node
/**
 * Audit vault attachment folders for non-SEO image filenames.
 *
 *   node scripts/audit-vault-attachments.mjs
 *   node scripts/audit-vault-attachments.mjs --slug my-article
 *
 * Exit: 0 PASS | 1 FAIL (bad names in Ready/Published attachments)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  badSeoReason,
  isBadSeoFilename,
  isImageFile,
} from "./lib/vault-image-filename.mjs";

const VAULT = path.join("D:", "Obsidian", "Obsidian", "40_VSCode", "Petralian");
const BLOG = path.join(VAULT, "Blog");

const FOLDERS = {
  drafts: { dir: path.join(BLOG, "01 Drafts", "Attachments"), level: "warn" },
  ready: { dir: path.join(BLOG, "02 Ready to publish", "Attachments"), level: "error" },
  published: { dir: path.join(BLOG, "03 Published", "Attachments"), level: "error" },
};

function parseArgs() {
  const idx = process.argv.indexOf("--slug");
  return { slugFilter: idx !== -1 ? process.argv[idx + 1] : null };
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => isImageFile(f))
    .map((f) => path.join(dir, f));
}

function articleAttachmentDirs(slugFilter) {
  const dirs = [];
  for (const folder of ["02 Ready to publish", "03 Published"]) {
    const base = path.join(BLOG, folder);
    if (!fs.existsSync(base)) continue;
    for (const f of fs.readdirSync(base)) {
      if (!f.endsWith(".md")) continue;
      const slug = f.replace(/\.md$/, "");
      if (slugFilter && slug !== slugFilter) continue;
      const att = path.join(base, slug, "Attachments");
      if (fs.existsSync(att)) dirs.push({ slug, dir: att, level: "error" });
      const loose = path.join(base, "Attachments");
      if (fs.existsSync(loose)) dirs.push({ slug, dir: loose, level: "error", shared: true });
    }
  }
  return dirs;
}

function main() {
  const { slugFilter } = parseArgs();
  const errors = [];
  const warnings = [];

  console.log("── Vault attachment filename audit ───────────────────────────");

  for (const [label, { dir, level }] of Object.entries(FOLDERS)) {
    if (slugFilter && label !== "drafts") {
      // Shared folders still scanned; per-article dirs handled below
    }
    for (const file of listImages(dir)) {
      const name = path.basename(file);
      if (!isBadSeoFilename(name)) continue;
      const msg = `${label}/Attachments: "${name}" — ${badSeoReason(name)}`;
      if (level === "error") errors.push(msg);
      else warnings.push(msg);
    }
  }

  for (const { slug, dir, level, shared } of articleAttachmentDirs(slugFilter)) {
    for (const file of listImages(dir)) {
      const name = path.basename(file);
      if (!isBadSeoFilename(name)) continue;
      const where = shared ? `${slug} (shared Attachments)` : `${slug}/Attachments`;
      const msg = `${where}: "${name}" — ${badSeoReason(name)}`;
      if (level === "error") errors.push(msg);
      else warnings.push(msg);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("  [PASS] All scanned attachment folders use SEO-safe names");
  } else {
    for (const e of errors) console.log(`  [FAIL] ${e}`);
    for (const w of warnings) console.log(`  [WARN] ${w}`);
  }

  console.log("────────────────────────────────────────────────────────────────");
  if (errors.length) {
    console.log("Attachment audit FAIL — rename to {slug}.avif or {slug}-body-NN-descriptor.ext");
    process.exit(1);
  }
  if (warnings.length) {
    console.log("Attachment audit WARN — clean up Drafts/Attachments when convenient");
  }
  process.exit(0);
}

main();
