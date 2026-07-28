#!/usr/bin/env node
/**
 * Convert raster post images to AVIF and rewrite content/posts paths.
 *
 * Usage:
 *   node scripts/raster-to-avif.mjs
 *   node scripts/raster-to-avif.mjs --dry-run
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  convertRastersInDirectory,
  loadImagePipelineConfig,
  rasterOutputExt,
  recompressAvifInDirectory,
  updateMarkdownFilesInDir,
} from "./lib/image-pipeline.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const cfg = loadImagePipelineConfig();

const imagesDir = path.join(ROOT, cfg.paths?.repo_posts_images || "public/images/posts");
const markdownDir = path.join(ROOT, cfg.paths?.repo_posts_markdown || "content/posts");

async function main() {
  const out = rasterOutputExt();
  const tag = dryRun ? "[dry-run] " : "";
  console.log(`${tag}Raster → ${out}: ${imagesDir}`);

  const renameMap = await convertRastersInDirectory(imagesDir, { dryRun });
  const recompressed = await recompressAvifInDirectory(imagesDir, { dryRun });

  if (renameMap.size === 0 && recompressed === 0) {
    console.log(`${tag}No raster files to convert.`);
    return;
  }

  const updated = updateMarkdownFilesInDir(markdownDir, renameMap, { dryRun });
  console.log(
    `${tag}${renameMap.size} file(s) converted | ${recompressed} ${out} recompressed | ${updated} markdown updated`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
