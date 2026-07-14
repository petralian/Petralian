import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { isPostFormat, type PostFormat } from "@/lib/post-format";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function generateExcerpt(content: string): string {
  const plain = content
    .replace(/^#{1,6}\s+.*/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~`>]/g, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= 160) return plain;
  return plain.slice(0, 160).replace(/\s+\S*$/, "") + "\u2026";
}

export interface PostMeta {
  title: string;
  slug: string;
  date: string;
  category: string;
  tags: string[];
  series: string;
  related_posts: string[];
  excerpt: string;
  featured_image: string;
  seo_title: string;
  seo_description: string;
  featured_image_alt: string;
  readingTime: string;
  format: PostFormat | "";
  best_for: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((filename) => getPostMeta(filename.replace(/\.mdx?$/, "")))
    .filter((p, i, arr) => arr.findIndex((q) => q.slug === p.slug) === i)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getPostMeta(slug: string): PostMeta {
  const raw = readPostFile(slug);
  const { data, content } = matter(raw);
  return {
    title: data.title || "",
    slug: data.slug || slug,
    date: data.date
      ? data.date instanceof Date
        ? data.date.toISOString().split("T")[0]
        : String(data.date)
      : "",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    series: typeof data.series === "string" ? data.series : "",
    related_posts: Array.isArray(data.related_posts)
      ? data.related_posts.filter((s): s is string => typeof s === "string")
      : [],
    excerpt: data.excerpt || generateExcerpt(content),
    featured_image: data.featured_image || "",
    seo_title: data.seo_title || "",
    seo_description: data.seo_description || data.excerpt || "",
    featured_image_alt: data.featured_image_alt || "",
    readingTime: readingTime(content).text,
    format: isPostFormat(data.format) ? data.format : "",
    best_for: typeof data.best_for === "string" ? data.best_for : "",
  };
}

export function getPost(slug: string): Post {
  const raw = readPostFile(slug);
  const { data, content } = matter(raw);
  return {
    ...getPostMeta(slug),
    content,
  };
}

function resolvePostFilePath(slug: string): string {
  const mdx = path.join(POSTS_DIR, `${slug}.mdx`);
  const md = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(mdx)) return mdx;
  if (fs.existsSync(md)) return md;
  throw new Error(`Post not found: ${slug}`);
}

function readPostFile(slug: string): string {
  return fs.readFileSync(resolvePostFilePath(slug), "utf8");
}

/** Latest of frontmatter date and file mtime — for sitemap freshness signals */
export function getPostLastModified(slug: string, dateStr: string): Date {
  const fileMtime = fs.statSync(resolvePostFilePath(slug)).mtime;
  const postDate = dateStr ? new Date(dateStr) : new Date(0);
  return fileMtime > postDate ? fileMtime : postDate;
}

export function getAllCategories(): string[] {
  return [...new Set(getAllPosts().map((p) => p.category).filter(Boolean))].sort();
}

export function getAllTags(): string[] {
  return [...new Set(getAllPosts().flatMap((p) => p.tags).filter(Boolean))].sort();
}
