#!/usr/bin/env node
/**
 * Image Optimization Script
 * Resizes and compresses all images in public/images/posts/ to reduce
 * PageSpeed "Improve image delivery" bytes.
 *
 * Usage:
 *   node scripts/optimize-images.mjs             # optimize in-place
 *   node scripts/optimize-images.mjs --dry-run   # preview savings only
 *
 * Requires: sharp (installed by Next.js — run `npm install sharp` if missing)
 * Settings: MAX_WIDTH=1200px (covers 3x DPR on 400px card), JPEG/WebP quality=80
 */

import sharp from "sharp";
import { readdir, stat, unlink, copyFile } from "fs/promises";
import { join, extname, dirname } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";

const isDryRun = process.argv.includes("--dry-run");
const __dir = dirname(fileURLToPath(import.meta.url));

const TARGET_DIRS = [join(__dir, "..", "public", "images", "posts")];

/** Max pixel width served — covers 3x HiDPI on a 400px column */
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
const PNG_COMPRESSION = 9; // zlib level 0-9

const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/** Format bytes to human-readable KB */
const kb = (n) => (n / 1024).toFixed(1);

async function processFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!SUPPORTED.has(ext)) return null;

  const originalSize = (await stat(filePath)).size;
  const meta = await sharp(filePath).metadata();

  let pipeline = sharp(filePath, { failOn: "none" });

  // Resize if wider than MAX_WIDTH
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  // Re-encode with optimized settings
  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY, effort: 6 });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION, adaptiveFiltering: true });
  }

  if (isDryRun) {
    const { data } = await pipeline.toBuffer({ resolveWithObject: true });
    return { filePath, originalSize, newSize: data.length };
  }

  // Temp file outside target dir avoids Windows EPERM on in-place rename
  const tmp = join(
    tmpdir(),
    `petralian-opt-${randomBytes(6).toString("hex")}${ext}`
  );
  try {
    const info = await pipeline.toFile(tmp);
    if (info.size <= originalSize) {
      await copyFile(tmp, filePath);
    }
    return { filePath, originalSize, newSize: Math.min(info.size, originalSize) };
  } finally {
    await unlink(tmp).catch(() => {});
  }
}

async function run() {
  let totalOriginal = 0;
  let totalNew = 0;
  let count = 0;

  for (const dir of TARGET_DIRS) {
    let files;
    try {
      files = await readdir(dir);
    } catch {
      console.warn(`Skipping missing directory: ${dir}`);
      continue;
    }

    for (const name of files) {
      const filePath = join(dir, name);
      try {
        const result = await processFile(filePath);
        if (!result) continue;
        count++;
        totalOriginal += result.originalSize;
        totalNew += result.newSize;
        const saving = result.originalSize - result.newSize;
        const pct = ((saving / result.originalSize) * 100).toFixed(1);
        const tag = isDryRun ? "[dry-run] " : "";
        const note =
          saving > 0
            ? `saved ${kb(saving)} KB (${pct}%)`
            : "already optimal";
        console.log(
          `${tag}${name}: ${kb(result.originalSize)} KB → ${kb(result.newSize)} KB  ${note}`
        );
      } catch (err) {
        console.error(`Error processing ${name}: ${err.message}`);
      }
    }
  }

  const totalSaved = totalOriginal - totalNew;
  const tag = isDryRun ? "[DRY-RUN] " : "";
  console.log(
    `\n${tag}${count} images | ${kb(totalOriginal)} KB → ${kb(totalNew)} KB | ${kb(totalSaved)} KB saved total`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
