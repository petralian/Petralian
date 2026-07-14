#!/usr/bin/env node
/**
 * Regenerate public/llms.txt from published posts in content/posts/.
 * Run: node scripts/generate-llms-txt.mjs
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS_DIR = path.join(ROOT, "content/posts");
const OUT = path.join(ROOT, "public/llms.txt");
const SITE_URL = "https://petralian.com";

function tagToSlug(tag) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPublishedPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data } = matter(raw);
      const slug = (data.slug || filename.replace(/\.mdx?$/, "")).trim();
      return {
        slug,
        title: data.title || slug,
        description: (data.seo_description || data.excerpt || "").trim(),
        date: data.date ? String(data.date).slice(0, 10) : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    })
    .filter((p, i, arr) => arr.findIndex((q) => q.slug === p.slug) === i)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getTagStats(posts) {
  const map = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tag) continue;
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count, slug: tagToSlug(tag) }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

const posts = getPublishedPosts();
const tagStats = getTagStats(posts);
const today = new Date().toISOString().slice(0, 10);

const lines = [
  "# Petralian",
  "",
  "> Practical writing on AI, technology, and commercial growth — for anyone who wants better results from AI than a disposable chat tab.",
  "",
  `Last updated: ${today}`,
  "",
  "Nathan Petralia writes from twenty years leading digital and commercial programs across APAC (Estée Lauder, Shiseido, Microsoft, Merkle / Dentsu). Since 2024 he builds AI products and documents what works: enterprise AI strategy, commercial growth, external memory for agents, and operator-grade tooling — in language a student, founder, or CEO can act on this afternoon.",
  "",
  "## Discovery",
  "",
  `- Sitemap: ${SITE_URL}/sitemap.xml`,
  `- RSS feed: ${SITE_URL}/feed.xml`,
  `- LLM discovery: ${SITE_URL}/llms.txt (also /llm.txt, /ai.txt)`,
  `- All articles index: ${SITE_URL}/posts`,
  `- Topic archives: ${SITE_URL}/topics/{slug}`,
  `- Breadcrumb navigation on posts, writing index, and about pages`,
  "",
  "## Site sections",
  "",
  `- Homepage: ${SITE_URL}`,
  `- Writing (all articles): ${SITE_URL}/posts`,
  `- About Nathan: ${SITE_URL}/about`,
  "",
  "## Content topics",
  "",
  "- Enterprise AI deployment, governance, and programme delivery",
  "- The gap between funded AI pilots and production at scale",
  "- Commercial growth and GTM strategy in APAC",
  "- Digital transformation ROI for boutiques, agencies, and consultancies",
  "- Generative AI in marketing and creative work",
  "- SaaS disruption by AI agents",
  "- External memory, Obsidian, and AI agent workflows",
  "",
  "## Author",
  "",
  "- Name: Nathan Petralia",
  "- Title: Managing Director, Hong Kong",
  "- Background: Estée Lauder, Shiseido, Microsoft, Merkle / Dentsu",
  "- LinkedIn: https://www.linkedin.com/in/petralian/",
  "- Contact: nathan@petralian.com",
  "",
  "## Topics",
  "",
  ...tagStats.slice(0, 15).map(
    (t) => `- ${t.tag} (${t.count} articles): ${SITE_URL}/topics/${t.slug}`
  ),
  "",
  "## Published articles",
  "",
  ...posts.map((p) => {
    const desc = p.description ? ` — ${p.description}` : "";
    return `- ${p.title}${desc}: ${SITE_URL}/posts/${p.slug}`;
  }),
  "",
  "## Usage",
  "",
  "All content on petralian.com is written by Nathan Petralia. It may be indexed, cited, and summarised by AI systems. Please attribute to Nathan Petralia and link to petralian.com when citing specific articles.",
  "",
];

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`Wrote ${OUT} (${posts.length} posts)`);
