#!/usr/bin/env node
/**
 * Audit seo_title / seo_description on published posts (Alli AI substitute).
 * Usage: node scripts/audit-seo-meta.mjs [--json] [--top N]
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.resolve(import.meta.dirname, "../content/posts");
const asJson = process.argv.includes("--json");
const topArg = process.argv.indexOf("--top");
const topN = topArg >= 0 ? parseInt(process.argv[topArg + 1], 10) : 0;

const PILLAR_SLUGS = new Set([
  "knowledge-work-agent-engine-guide-2026",
  "external-memory-series-guide",
  "knowledge-work-engine-project-management-2026",
  "knowledge-work-engine-leadership-decisions-2026",
  "knowledge-work-engine-marketing-voice-2026",
  "obsidian-memory-layers-personal-productivity-beyond-chat",
  "why-i-rebuilt-petralian-on-nextjs",
  "building-petralian-the-technical-reality",
  "the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo",
  "cursor-harness-memory-loop-2026",
  "three-layer-external-brain-for-ai-first-development",
  "why-file-memory-beats-the-three-layer-diagram-for-builders",
  "your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian",
  "vscode-copilot-to-cursor-what-changed-in-my-ai-workflow",
  "gravio-multi-repo-rollout-playbook",
  "how-gravio-scoring-engine-was-built",
  "ai-quality-gate-ci-gravio",
  "getting-to-lighthouse-100-on-nextjs-16",
  "publishing-obsidian-drafts-through-github-actions",
  "training-an-ai-is-like-managing-an-employee",
]);

function auditPost(slug, data) {
  const issues = [];
  const title = data.seo_title || data.title || "";
  const desc = data.seo_description || data.excerpt || "";
  const focus = data.focus_keyword || "";

  if (!title) issues.push("missing title");
  else if (title.length < 50) issues.push(`title short (${title.length}/55-60)`);
  else if (title.length > 65) issues.push(`title long (${title.length})`);

  if (!desc) issues.push("missing seo_description/excerpt");
  else if (desc.length < 140) issues.push(`seo_description short (${desc.length}/150-160)`);
  else if (desc.length > 165) issues.push(`seo_description long (${desc.length})`);

  if (!focus) issues.push("missing focus_keyword");

  return {
    slug,
    title: data.title,
    seo_title: title,
    seo_title_len: title.length,
    seo_description_len: desc.length,
    focus_keyword: focus,
    issues,
    pillar: PILLAR_SLUGS.has(slug),
  };
}

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const { data } = matter(raw);
      return auditPost(data.slug || slug, data);
    })
  .filter(Boolean);

let flagged = posts.filter((p) => p.issues.length > 0);
if (topN > 0) {
  flagged = posts
    .filter((p) => p.pillar)
    .sort((a, b) => b.issues.length - a.issues.length)
    .slice(0, topN);
}

if (asJson) {
  console.log(JSON.stringify({ total: posts.length, flagged }, null, 2));
  process.exit(flagged.length ? 1 : 0);
}

console.log(`Published posts: ${posts.length}`);
console.log(`Posts with SEO issues: ${posts.filter((p) => p.issues.length).length}`);
console.log(`Pillar posts tracked: ${PILLAR_SLUGS.size}\n`);

for (const p of flagged.sort((a, b) => b.issues.length - a.issues.length)) {
  console.log(`${p.slug}${p.pillar ? " [pillar]" : ""}`);
  console.log(`  title: ${p.seo_title_len} chars`);
  console.log(`  desc:  ${p.seo_description_len} chars`);
  console.log(`  issues: ${p.issues.join("; ")}\n`);
}

process.exit(flagged.length ? 1 : 0);
