/**
 * Shared SEO/GEO helpers for publish pipeline scripts.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getSeoLimits } from "./load-harness-yaml.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

export const SITE_URL = "https://petralian.com";

export const NEW_BATCH_SLUGS_2026_07_14 = [
  "vouch-referral-tracking-three-gates-shopify",
  "deploy-without-git-tag-you-cannot-roll-back",
  "cursor-obsidian-brain-handbook-2026",
  "cursorbench-vs-swe-bench-vs-human-eval",
  "open-models-cursorbench-3-2-grok-glm-kimi-longcat",
  "fable-5-pricing-cursor-every-tier-explained",
  "when-to-escalate-composer-2-5-to-fable-5",
  "best-cursor-model-by-task-2026",
  "is-cursor-only-for-developers",
];

export function absoluteUrl(maybePath) {
  if (!maybePath) return undefined;
  if (maybePath.startsWith("http")) return maybePath;
  if (maybePath.startsWith("/")) return `${SITE_URL}${maybePath}`;
  return `${SITE_URL}/${maybePath}`;
}

export function generateExcerpt(content) {
  const plain = content
    .replace(/^#{1,6}\s+.*/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~`>]/g, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= 160) return plain;
  return plain.slice(0, 160).replace(/\s+\S*$/, "") + "…";
}

export function trimSeoTitle(title, max) {
  const m = max ?? getSeoLimits(REPO_ROOT).title.max;
  if (!title) return "";
  const t = title.trim();
  if (t.length <= m) return t;
  const cut = t.slice(0, m - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

export function trimSeoDescription(desc, min, max) {
  const lim = getSeoLimits(REPO_ROOT).desc;
  const lo = min ?? lim.target;
  const hi = max ?? lim.max;
  if (!desc) return "";
  let d = desc.trim().replace(/\s+/g, " ");
  if (d.length > hi) {
    d = d.slice(0, hi - 1).replace(/\s+\S*$/, "") + "…";
  }
  if (d.length < lo && d.length >= Math.max(120, lim.min - 20)) return d;
  return d;
}

export function deriveFocusKeyword(data) {
  if (data.focus_keyword?.trim()) return data.focus_keyword.trim();
  const tag = Array.isArray(data.tags) ? data.tags[0] : "";
  if (tag) return tag.toLowerCase();
  const words = (data.title || "").toLowerCase().split(/\s+/).slice(0, 4);
  return words.join(" ").slice(0, 40);
}

export function deriveFeaturedAlt(data) {
  if (data.featured_image_alt?.trim()) return data.featured_image_alt.trim();
  const title = data.title || data.slug || "Article hero image";
  return `Hero illustration for ${title}`;
}

export function auditSeoFields(data, repoRoot = REPO_ROOT) {
  const { title: tlim, desc: dlim, label } = getSeoLimits(repoRoot);
  const issues = [];
  const title = data.seo_title || data.title || "";
  const desc = data.seo_description || data.excerpt || "";

  if (!title) issues.push("missing seo_title/title");
  else if (title.length < tlim.min)
    issues.push(`seo_title short (${title.length}/${label.title})`);
  else if (title.length > tlim.max)
    issues.push(`seo_title long (${title.length}/${tlim.max})`);

  if (!desc) issues.push("missing seo_description");
  else if (desc.length < dlim.min)
    issues.push(`seo_description short (${desc.length}/${label.desc})`);
  else if (desc.length > dlim.max)
    issues.push(`seo_description long (${desc.length}/${dlim.max})`);

  if (!data.focus_keyword) issues.push("missing focus_keyword");
  if (!data.featured_image_alt) issues.push("missing featured_image_alt");

  return { issues, title, desc };
}

export function extractFaqPairs(markdownBody) {
  const faqs = [];
  const faqSection = markdownBody.match(
    /##\s+FAQ[\s\S]*?(?=\n##\s+[^#]|\n---\s*$|$)/i
  );
  if (!faqSection) return faqs;

  const block = faqSection[0];
  const re = /###\s+(.+?)\n+([\s\S]*?)(?=\n###\s+|\n##\s+|$)/g;
  let m;
  while ((m = re.exec(block))) {
    const question = m[1].trim().replace(/\?$/, "") + "?";
    const answer = m[2]
      .trim()
      .replace(/\n+/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .slice(0, 500);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

export function readPost(postsDir, slug) {
  const fp = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(fp)) return null;
  const raw = fs.readFileSync(fp, "utf8");
  const { data, content } = matter(raw);
  return { fp, raw, data, content, slug: data.slug || slug };
}
