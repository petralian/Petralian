#!/usr/bin/env node
/**
 * Remove Obsidian-only frontmatter keys before writing content/posts/.
 * SSOT: data/post-publish.yaml vault_only_frontmatter
 */
import fs from "node:fs";
import matter from "gray-matter";
import { getPostPublishConfig } from "./load-post-publish-yaml.mjs";

export function vaultOnlyKeys() {
  return getPostPublishConfig().vault_only_frontmatter;
}

export function stripVaultOnlyFrontmatter(raw) {
  const parsed = matter(raw);
  for (const key of vaultOnlyKeys()) {
    delete parsed.data[key];
  }
  return matter.stringify(parsed.content, parsed.data);
}

if (process.argv[1]?.includes("strip-vault-frontmatter")) {
  const file = process.argv[2];
  const input = file ? fs.readFileSync(file, "utf8") : fs.readFileSync(0, "utf8");
  process.stdout.write(stripVaultOnlyFrontmatter(input));
}
