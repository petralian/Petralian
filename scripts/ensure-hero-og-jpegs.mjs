#!/usr/bin/env node
/**
 * JPEG sidecars for post featured_image only (newsletter + social previews).
 * Skips body-image AVIFs — full `raster-to-avif.mjs --og-only` is for local/sync batches.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { socialOgPathFor, writeSocialOgJpeg } from "./lib/image-pipeline.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = path.join(ROOT, "content", "posts");
const publicRoot = path.join(ROOT, "public");
const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!fs.existsSync(postsDir)) {
    console.log("No content/posts — skip hero og.jpg");
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(postsDir, file), "utf8"));
    const img = data.featured_image;
    if (!img || typeof img !== "string") continue;

    const rel = img.startsWith("/") ? img.slice(1) : img;
    if (!/\.avif$/i.test(rel)) continue;

    const avifPath = path.join(publicRoot, rel);
    const ogRel = socialOgPathFor(`/${rel}`).replace(/^\//, "");
    const ogPath = path.join(publicRoot, ogRel);

    if (!fs.existsSync(avifPath)) {
      console.warn(`WARN missing hero AVIF: ${rel}`);
      continue;
    }
    if (fs.existsSync(ogPath)) {
      skipped += 1;
      continue;
    }
    if (dryRun) {
      console.log(`[dry-run] would write ${ogRel}`);
      created += 1;
      continue;
    }
    await writeSocialOgJpeg(avifPath);
    created += 1;
    console.log(`  og: ${path.basename(ogPath)}`);
  }

  console.log(`Hero og.jpg: ${created} created, ${skipped} already present`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
