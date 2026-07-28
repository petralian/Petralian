#!/usr/bin/env node
/**
 * Resize/recompress post images per data/image-pipeline.yaml (AVIF output).
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *   node scripts/optimize-images.mjs --dry-run
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  convertRastersInDirectory,
  loadImagePipelineConfig,
  rasterOutputExt,
  recompressAvifInDirectory,
} from "./lib/image-pipeline.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const cfg = loadImagePipelineConfig();
const imagesDir = path.join(ROOT, cfg.paths?.repo_posts_images || "public/images/posts");

async function main() {
  const out = rasterOutputExt();
  const tag = dryRun ? "[dry-run] " : "";
  console.log(`${tag}Optimize ${imagesDir} → ${out}`);

  const renamed = await convertRastersInDirectory(imagesDir, { dryRun });
  const recompressed = await recompressAvifInDirectory(imagesDir, { dryRun });

  console.log(
    `${tag}Done: ${renamed.size} converted, ${recompressed} ${out} recompressed (run raster-to-avif.mjs to update markdown paths)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
