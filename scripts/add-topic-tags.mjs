#!/usr/bin/env node
/**
 * Add Playbook and GEO topic tags to published posts (repo + vault mirror).
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const VAULT_DIR =
  "D:\\Obsidian\\Obsidian\\40_VSCode\\Petralian\\Blog\\03 Published";

const PLAYBOOK_SERIES = [
  "Knowledge Work Engine Series",
  "External Memory Series",
  "Cursor Agent Harness Series",
];

const PLAYBOOK_SLUGS = new Set([
  "gravio-multi-repo-rollout-playbook",
  "three-layer-external-brain-for-ai-first-development",
  "why-file-memory-beats-the-three-layer-diagram-for-builders",
  "obsidian-memory-layers-personal-productivity-beyond-chat",
  "external-memory-series-guide",
  "why-deliberate-file-memory-beats-hoping-agents-remember",
  "cursor-harness-measurement-2026",
  "cursor-harness-memory-loop-2026",
  "cursor-lightweight-harness-without-microservice-2026",
  "cursor-token-saving-tools-beyond-headroom-2026",
  "vscode-copilot-to-cursor-what-changed-in-my-ai-workflow",
  "how-gravio-scoring-engine-was-built",
  "getting-enterprise-ai-right-the-work-that-comes-before-deployment",
  "boutiques-agencies-consultancies-digital-transformation-roi",
]);

const GEO_SLUGS = new Set([
  "knowledge-work-engine-marketing-voice-2026",
  "the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo",
  "best-practices-for-founders-integrating-ai-and-seo-for-effective-digital-campaign-management",
  "knowledge-work-agent-engine-guide-2026",
  "contextual-ai-for-ecommerce-beyond-the-click-and-into-the-conversation",
  "ai-shopping-revolution-will-shopifys-chatgpt-integration-redefine-retail-strategy",
  "building-petralian-the-technical-reality",
  "why-i-rebuilt-petralian-on-nextjs",
]);

function addTag(tags, tag) {
  const list = Array.isArray(tags) ? [...tags] : [];
  if (!list.includes(tag)) list.push(tag);
  return list;
}

function shouldPlaybook(data, slug) {
  if (PLAYBOOK_SLUGS.has(slug)) return true;
  const series = typeof data.series === "string" ? data.series.trim() : "";
  return PLAYBOOK_SERIES.includes(series);
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const slug = parsed.data.slug || path.basename(filePath, ".md");
  let tags = Array.isArray(parsed.data.tags) ? [...parsed.data.tags] : [];
  const before = JSON.stringify(tags);

  if (shouldPlaybook(parsed.data, slug)) {
    tags = addTag(tags, "Playbook");
  }
  if (GEO_SLUGS.has(slug)) {
    tags = addTag(tags, "GEO");
  }

  if (JSON.stringify(tags) === before) return false;

  parsed.data.tags = tags;
  fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data));
  return true;
}

function runDir(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    if (processFile(path.join(dir, file))) n += 1;
  }
  return n;
}

const repoN = runDir(POSTS_DIR);
const vaultN = runDir(VAULT_DIR);
console.log(`Updated ${repoN} repo + ${vaultN} vault posts with Playbook/GEO tags`);
