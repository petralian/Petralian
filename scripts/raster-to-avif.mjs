#!/usr/bin/env node
/**
 * Convert raster post images to AVIF and rewrite content/posts paths.
 *
 * Usage:
 *   node scripts/raster-to-avif.mjs
 *   node scripts/raster-to-avif.mjs --dry-run
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  convertRastersInDirectory,
  convertRasterFile,
  loadImagePipelineConfig,
  rasterNameFor,
  rasterOutputExt,
  recompressAvifInDirectory,
  rewriteImageRefsInText,
  updateMarkdownFilesInDir,
  walkFiles,
} from "./lib/image-pipeline.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const cfg = loadImagePipelineConfig();

const imagesDir = path.join(ROOT, cfg.paths?.repo_posts_images || "public/images/posts");
const brandDir = path.join(ROOT, cfg.paths?.repo_brand_images || "public/images");
const markdownDir = path.join(ROOT, cfg.paths?.repo_posts_markdown || "content/posts");

const REF_UPDATE_DIRS = [
  path.join(ROOT, "content"),
  path.join(ROOT, "src"),
  path.join(ROOT, "memories"),
  path.join(ROOT, "scripts"),
];

function updateTextRefsInDirs(dirs, renameMap, { dryRun = false } = {}) {
  if (renameMap.size === 0) return 0;
  const exts = new Set([".md", ".tsx", ".ts", ".json", ".mjs"]);
  let count = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const filePath of walkFiles(dir, (full) => exts.has(path.extname(full)))) {
      const raw = fs.readFileSync(filePath, "utf8");
      const next = rewriteImageRefsInText(raw, renameMap);
      if (next !== raw) {
        count += 1;
        if (!dryRun) {
          fs.writeFileSync(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
        }
      }
    }
  }
  return count;
}

async function convertBrandJpegs(dir, { dryRun = false } = {}) {
  const renameMap = new Map();
  if (!fs.existsSync(dir)) return renameMap;

  for (const name of fs.readdirSync(dir)) {
    const ext = path.extname(name).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg") continue;

    const srcPath = path.join(dir, name);
    if (!fs.statSync(srcPath).isFile()) continue;

    const destName = rasterNameFor(name);
    const destPath = path.join(dir, destName);
    const originalSize = fs.statSync(srcPath).size;

    if (dryRun) {
      renameMap.set(name, destName);
      continue;
    }

    await convertRasterFile(srcPath, destPath);
    const newSize = fs.statSync(destPath).size;
    fs.unlinkSync(srcPath);
    renameMap.set(name, destName);
    console.log(
      `  ${name} → ${destName}: ${(originalSize / 1024).toFixed(1)} KB → ${(newSize / 1024).toFixed(1)} KB`
    );
  }

  return renameMap;
}

async function main() {
  const out = rasterOutputExt();
  const tag = dryRun ? "[dry-run] " : "";
  console.log(`${tag}Raster → ${out}: ${imagesDir}`);

  const postsRename = await convertRastersInDirectory(imagesDir, { dryRun });
  const brandRename = await convertBrandJpegs(brandDir, { dryRun });
  const renameMap = new Map([...postsRename, ...brandRename]);
  const recompressed =
    (await recompressAvifInDirectory(imagesDir, { dryRun })) +
    (await recompressAvifInDirectory(brandDir, { dryRun }));

  if (renameMap.size === 0 && recompressed === 0) {
    console.log(`${tag}No raster files to convert.`);
    return;
  }

  const markdownUpdated = updateMarkdownFilesInDir(markdownDir, renameMap, { dryRun });
  const refsUpdated = updateTextRefsInDirs(REF_UPDATE_DIRS, renameMap, { dryRun });
  console.log(
    `${tag}${renameMap.size} file(s) converted | ${recompressed} ${out} recompressed | ${markdownUpdated} markdown + ${refsUpdated} other refs updated`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
