#!/usr/bin/env node
/**
 * Audit content/posts for body images: missing files, orphan captions, TBD credits.
 * Usage: node scripts/audit-body-image-embeds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");
const IMG_DIR = path.join(ROOT, "public", "images", "posts");

const tbd = [];
const orphans = [];
const missing = [];

for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const text = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  if (/Photo: TBD/i.test(text)) tbd.push(file);

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^\*Photo:/i.test(line) && !/TBD/i.test(line)) {
      const prev = lines.slice(Math.max(0, i - 3), i).join("\n");
      if (!/!\[[^\]]*\]\([^)]+\)/.test(prev)) {
        orphans.push(`${file}:${i + 1}`);
      }
    }
    const m = line.match(/^!\[[^\]]*\]\((\/images\/posts\/[^)]+)\)/);
    if (m) {
      const rel = m[1].replace(/^\/images\/posts\//, "");
      if (!fs.existsSync(path.join(IMG_DIR, rel))) {
        missing.push(`${file}: ${rel}`);
      }
    }
  }
}

let exit = 0;
if (tbd.length) {
  console.log("TBD captions:");
  for (const f of tbd) console.log(`  - ${f}`);
  exit = 1;
}
if (orphans.length) {
  console.log("Captions without image above (within 3 lines):");
  for (const f of orphans) console.log(`  - ${f}`);
  exit = 1;
}
if (missing.length) {
  console.log("Markdown image refs missing on disk:");
  for (const f of missing) console.log(`  - ${f}`);
  exit = 1;
}
if (exit === 0) {
  console.log("OK — all body image embeds look consistent.");
}
process.exit(exit);
