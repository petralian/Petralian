#!/usr/bin/env node
/**
 * Convert raster images in Obsidian vault Blog tree to AVIF; update wiki embeds + slots.
 *
 * Usage:
 *   node scripts/vault-raster-to-avif.mjs
 *   node scripts/vault-raster-to-avif.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  convertRastersInDirectory,
  loadImagePipelineConfig,
  rewriteImageRefsInText,
  walkFiles,
} from "./lib/image-pipeline.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const cfg = loadImagePipelineConfig();
const vaultBlog = cfg.paths?.vault_blog;

if (!vaultBlog || !fs.existsSync(vaultBlog)) {
  console.warn(`Vault Blog path missing or not found: ${vaultBlog || "(unset)"}`);
  process.exit(0);
}

const STAGES = new Set(["01 Drafts", "02 Ready to publish", "03 Published"]);

function collectImageDirs() {
  const dirs = new Set();
  for (const full of walkFiles(vaultBlog)) {
    const dir = path.dirname(full);
    const base = path.basename(dir);
    if (base === "Attachments" || base === "00 Attachments") {
      dirs.add(dir);
    }
  }
  for (const stage of STAGES) {
    const stageDir = path.join(vaultBlog, stage);
    if (!fs.existsSync(stageDir)) continue;
    for (const name of fs.readdirSync(stageDir)) {
      const articleDir = path.join(stageDir, name);
      if (fs.statSync(articleDir).isDirectory()) {
        dirs.add(articleDir);
      }
    }
  }
  return [...dirs];
}

function updateVaultMarkdown(renameMap) {
  if (renameMap.size === 0) return 0;
  let updated = 0;
  for (const filePath of walkFiles(vaultBlog, (_, name) => name.endsWith(".md"))) {
    const raw = fs.readFileSync(filePath, "utf8");
    const next = rewriteImageRefsInText(raw, renameMap);
    if (next !== raw) {
      updated += 1;
      if (!dryRun) {
        fs.writeFileSync(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
      }
    }
  }
  return updated;
}

function updateBodyImageSlotFilenames(renameMap) {
  if (renameMap.size === 0) return 0;
  let updated = 0;
  for (const filePath of walkFiles(vaultBlog, (_, name) => name.endsWith(".md"))) {
    let raw = fs.readFileSync(filePath, "utf8");
    let next = raw;
    for (const [oldName, newName] of renameMap) {
      next = next.replace(
        new RegExp(`(filename:\\s*["']?)${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"),
        `$1${newName}`
      );
    }
    if (next !== raw) {
      updated += 1;
      if (!dryRun) {
        fs.writeFileSync(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
      }
    }
  }
  return updated;
}

async function main() {
  const tag = dryRun ? "[dry-run] " : "";
  const globalRename = new Map();

  for (const dir of collectImageDirs()) {
    const local = await convertRastersInDirectory(dir, { dryRun });
    for (const [oldName, newName] of local) {
      globalRename.set(oldName, newName);
    }
  }

  const mdUpdated = updateVaultMarkdown(globalRename);
  const slotsUpdated = updateBodyImageSlotFilenames(globalRename);

  console.log(
    `${tag}Vault: ${globalRename.size} image(s) → AVIF | ${mdUpdated} note(s) | ${slotsUpdated} body_images slot(s)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
