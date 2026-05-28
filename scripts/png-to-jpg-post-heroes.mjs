#!/usr/bin/env node
/**
 * Convert oversized PNG post heroes to JPEG and update frontmatter paths.
 * Usage: node scripts/png-to-jpg-post-heroes.mjs [--dry-run]
 */
import sharp from "sharp";
import { readFile, writeFile, unlink, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dryRun = process.argv.includes("--dry-run");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(root, "public", "images", "posts");
const contentDir = join(root, "content", "posts");

const SLUGS = [
  "external-memory-series-guide",
  "obsidian-memory-layers-personal-productivity-beyond-chat",
  "three-layer-external-brain-for-ai-first-development",
  "why-deliberate-file-memory-beats-hoping-agents-remember",
  "why-file-memory-beats-the-three-layer-diagram-for-builders",
  "getting-to-lighthouse-100-on-nextjs-16",
  "how-i-built-the-petralian-weekly-digest-on-brevo-free",
  "publishing-obsidian-drafts-through-github-actions",
];

async function convertSlug(slug) {
  const pngPath = join(postsDir, `${slug}.png`);
  const jpgPath = join(postsDir, `${slug}.jpg`);
  const mdPath = join(contentDir, `${slug}.md`);

  let pngStat;
  try {
    pngStat = await stat(pngPath);
  } catch {
    return;
  }

  if (!dryRun) {
    await sharp(pngPath)
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(jpgPath);
  }

  const jpgStat = dryRun ? { size: pngStat.size * 0.15 } : await stat(jpgPath);
  if (jpgStat.size >= pngStat.size * 0.9) {
    console.log(`${slug}: skip — JPEG not smaller`);
    return;
  }

  const md = await readFile(mdPath, "utf8");
  const from = `featured_image: /images/posts/${slug}.png`;
  const to = `featured_image: /images/posts/${slug}.jpg`;
  if (!md.includes(from)) {
    console.log(`${slug}: frontmatter path mismatch`);
    return;
  }

  if (!dryRun) {
    await writeFile(mdPath, md.replace(from, to));
    await unlink(pngPath);
  }

  console.log(
    `${slug}: ${(pngStat.size / 1024).toFixed(0)} KB → ${(jpgStat.size / 1024).toFixed(0)} KB`,
  );
}

for (const slug of SLUGS) {
  await convertSlug(slug);
}
