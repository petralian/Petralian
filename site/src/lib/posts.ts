import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

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
  status: string;
  category: string;
  tags: string[];
  excerpt: string;
  featured_image: string;
  seo_description: string;
  readingTime: string;
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
    .filter((p) => p.status === "published")
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
    status: data.status || "published",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: data.excerpt || generateExcerpt(content),
    featured_image: data.featured_image || "",
    seo_description: data.seo_description || data.excerpt || "",
    readingTime: readingTime(content).text,
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

function readPostFile(slug: string): string {
  const mdx = path.join(POSTS_DIR, `${slug}.mdx`);
  const md = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(mdx)) return fs.readFileSync(mdx, "utf8");
  if (fs.existsSync(md)) return fs.readFileSync(md, "utf8");
  throw new Error(`Post not found: ${slug}`);
}

export function getAllCategories(): string[] {
  return [...new Set(getAllPosts().map((p) => p.category).filter(Boolean))].sort();
}

export function getAllTags(): string[] {
  return [...new Set(getAllPosts().flatMap((p) => p.tags).filter(Boolean))].sort();
}
