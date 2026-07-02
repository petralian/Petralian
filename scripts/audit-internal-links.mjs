/**
 * Audit internal /posts/slug links against published content/posts.
 * Usage: node scripts/audit-internal-links.mjs
 */
import fs from "node:fs";
import path from "node:path";

const dir = "content/posts";
const slugs = new Set(
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
);
const linkRe = /(?<!\/images)\/posts\/([a-z0-9-]+)/g;
const broken = new Map();

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  for (const m of raw.matchAll(linkRe)) {
    const target = m[1];
    if (!slugs.has(target)) {
      if (!broken.has(target)) broken.set(target, []);
      const from = file.replace(/\.md$/, "");
      if (!broken.get(target).includes(from)) broken.get(target).push(from);
    }
  }
}

if (broken.size === 0) {
  console.log("No broken internal post links.");
  process.exit(0);
}

console.log(`Broken internal post links: ${broken.size}\n`);
for (const [t, from] of [...broken.entries()].sort(
  (a, b) => b[1].length - a[1].length
)) {
  console.log(`${t} (${from.length} posts)`);
  console.log(`  ${from.join(", ")}\n`);
}
process.exit(1);
