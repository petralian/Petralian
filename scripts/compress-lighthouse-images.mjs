#!/usr/bin/env node
/** One-off aggressive compress for Lighthouse LCP targets. */
import sharp from "sharp";
import { stat } from "fs/promises";

const TARGETS = [
  {
    path: "public/images/nathan-petralia.jpg",
    maxWidth: 720,
    quality: 68,
  },
  {
    path: "public/images/posts/cursor-conversation-search-vs-bridge-file-2026.jpg",
    maxWidth: 960,
    quality: 65,
  },
  {
    path: "public/images/posts/cursor-conversation-search-body-01-transcript-search.png",
    out: "public/images/posts/cursor-conversation-search-body-01-transcript-search.jpg",
    maxWidth: 1100,
    quality: 72,
  },
  {
    path: "public/images/posts/cursor-conversation-search-body-02-bridge-template.png",
    out: "public/images/posts/cursor-conversation-search-body-02-bridge-template.jpg",
    maxWidth: 1100,
    quality: 72,
  },
];

for (const t of TARGETS) {
  const before = (await stat(t.path)).size;
  let pipeline = sharp(t.path);
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > t.maxWidth) {
    pipeline = pipeline.resize(t.maxWidth, null, { withoutEnlargement: true });
  }
  const dest = t.out ?? t.path;
  await pipeline.jpeg({ quality: t.quality, mozjpeg: true, progressive: true }).toFile(dest + ".tmp");
  const after = (await stat(dest + ".tmp")).size;
  const { rename, unlink } = await import("fs/promises");
  if (dest !== t.path) {
    await rename(dest + ".tmp", dest);
    console.log(`${t.path} -> ${dest}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`);
  } else if (after < before) {
    await rename(dest + ".tmp", dest);
    console.log(`${dest}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`);
  } else {
    await unlink(dest + ".tmp");
    console.log(`${dest}: kept ${Math.round(before / 1024)}KB`);
  }
}
