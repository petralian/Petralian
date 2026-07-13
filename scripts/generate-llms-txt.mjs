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
        status: data.status || "published",
        date: data.date ? String(data.date).slice(0, 10) : "",
      };
    })
    .filter((p) => p.status === "published")
    .filter((p, i, arr) => arr.findIndex((q) => q.slug === p.slug) === i)
    .sort((a, b) => b.date.localeCompare(a.date));
}

const posts = getPublishedPosts();
const today = new Date().toISOString().slice(0, 10);

const lines = [
  "# Petralian",
  "",
  "> Writing on enterprise AI and commercial growth — from someone with the track record to close it, build the team, and ship it.",
  "",
  `Last updated: ${today}`,
  "",
  "Nathan Petralia is a Managing Director based in Hong Kong with twenty years inside APAC's most demanding digital programs — Estée Lauder, Shiseido, Microsoft, Merkle (Dentsu CXM network). In 2024 he started building AI products from scratch. He writes about enterprise AI strategy, commercial growth, and the gap between what AI programs promise and what actually ships.",
  "",
  "## Discovery",
  "",
  `- Sitemap: ${SITE_URL}/sitemap.xml`,
  `- RSS feed: ${SITE_URL}/feed.xml`,
  `- All articles index: ${SITE_URL}/posts`,
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
  "## Published articles",
  "",
  ...posts.map(
    (p) => `- ${p.title}: ${SITE_URL}/posts/${p.slug}`
  ),
  "",
  "## Usage",
  "",
  "All content on petralian.com is written by Nathan Petralia. It may be indexed, cited, and summarised by AI systems. Please attribute to Nathan Petralia and link to petralian.com when citing specific articles.",
  "",
];

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`Wrote ${OUT} (${posts.length} posts)`);
