#!/usr/bin/env node
/**
 * Replaces ```d2 blocks in markdown with content from content/diagrams/snippets/<name>.d2
 * Usage in post: ```d2 snippet:four-tier-memory
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const snippetDir = join(root, "content", "diagrams", "snippets");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith(".md")) files.push(p);
  }
  return files;
}

const snippetPattern = /```d2\s+snippet:([a-z0-9-]+)\s*\n```/g;

for (const file of walk(join(root, "content", "posts"))) {
  let text = readFileSync(file, "utf8");
  let changed = false;
  text = text.replace(snippetPattern, (_, name) => {
    const src = join(snippetDir, `${name}.d2`);
    const body = readFileSync(src, "utf8").trim();
    changed = true;
    return "```d2\n" + body + "\n```";
  });
  if (changed) {
    writeFileSync(file, text);
    console.log("Updated", file);
  }
}
