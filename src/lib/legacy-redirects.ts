import fs from "node:fs";
import path from "node:path";

/** Root paths that must not become /posts/:slug redirects. */
const RESERVED_ROOT_SEGMENTS = new Set([
  "about",
  "admin",
  "api",
  "diagram-compare",
  "feed.xml",
  "icon.png",
  "posts",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "images",
  "blog",
  "contact",
  "services",
  "writing",
]);

/**
 * WordPress used root slugs (petralian.com/my-post). Next uses /posts/my-post.
 * Generate one 301 per published post file.
 */
export function buildLegacyPostRedirects(): {
  source: string;
  destination: string;
  permanent: boolean;
}[] {
  const postsDir = path.join(process.cwd(), "content/posts");
  if (!fs.existsSync(postsDir)) return [];

  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx?$/, ""))
    .filter((slug) => slug.length > 0 && !RESERVED_ROOT_SEGMENTS.has(slug))
    .map((slug) => ({
      source: `/${slug}`,
      destination: `/posts/${slug}`,
      permanent: true,
    }));
}
