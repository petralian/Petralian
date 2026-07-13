import fs from "node:fs";
import path from "node:path";

export type LegacyRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

/** Two-letter WPML / Polylang prefixes seen in crawl logs. */
const WP_LOCALES =
  "nl|fr|de|es|it|pt|ja|zh|ko|pl|sv|da|fi|no|ru|ar|tr|id|th|vi|cs|hu|ro|el|uk|ca|ms";

function buildLocaleHomeRedirects(): LegacyRedirect[] {
  return WP_LOCALES.split("|").map((locale) => ({
    source: `/${locale}`,
    destination: "/",
    permanent: true,
  }));
}

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
  "lost-in-space",
  "feed",
  "rss",
  "atom",
  "tag",
  "category",
  "author",
  "page",
  "portfolio",
  "case-studies",
  "case-study",
  "wp-content",
  "wp-includes",
  "wp-admin",
  "wp-json",
  "comments",
  "index.php",
  "xmlrpc.php",
  "llms.txt",
  "llm.txt",
  "ai.txt",
  // WP locale prefixes (must not become /posts/:slug root redirects)
  "nl",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "ja",
  "zh",
  "ko",
  "pl",
  "sv",
  "da",
  "fi",
  "no",
  "ru",
  "ar",
  "tr",
  "id",
  "th",
  "vi",
  "cs",
  "hu",
  "ro",
  "el",
  "uk",
  "ca",
  "ms",
]);

/**
 * WordPress URL patterns from the pre-Next.js site.
 * Ordered most-specific first in the returned array.
 * All permanent (301) to pass link equity to the closest live page.
 */
export function buildWordPressLegacyRedirects(): LegacyRedirect[] {
  const permanent = true;
  const L = WP_LOCALES;

  return [
    // Locale home pages first (e.g. /nl → /)
    ...buildLocaleHomeRedirects(),

    // Feeds → canonical RSS
    { source: "/feed", destination: "/feed.xml", permanent },
    { source: "/feed/:path*", destination: "/feed.xml", permanent },
    { source: "/rss", destination: "/feed.xml", permanent },
    { source: "/rss/:path*", destination: "/feed.xml", permanent },
    { source: "/atom", destination: "/feed.xml", permanent },
    { source: "/atom/:path*", destination: "/feed.xml", permanent },
    { source: "/comments/feed", destination: "/feed.xml", permanent },
    { source: "/comments/feed/:path*", destination: "/feed.xml", permanent },

    // Taxonomy → writing hub or about (commercial intent)
    { source: "/tag/:path*", destination: "/posts", permanent },
    { source: "/category/:path*", destination: "/posts", permanent },
    { source: "/author/:path*", destination: "/about", permanent },

    // Services subtree (root /services handled in next.config.ts)
    { source: "/services/:path*", destination: "/about", permanent },

    // WP static pages and portfolio patterns
    { source: "/page/:path*", destination: "/about", permanent },
    { source: "/portfolio/:path*", destination: "/posts", permanent },
    { source: "/case-studies/:path*", destination: "/posts", permanent },
    { source: "/case-study/:path*", destination: "/posts", permanent },

    // Locale-prefixed paths (e.g. /nl/my-post)
    { source: `/:locale(${L})/tag/:path*`, destination: "/posts", permanent },
    { source: `/:locale(${L})/category/:path*`, destination: "/posts", permanent },
    { source: `/:locale(${L})/author/:path*`, destination: "/about", permanent },
    { source: `/:locale(${L})/services/:path*`, destination: "/about", permanent },
    { source: `/:locale(${L})/about`, destination: "/about", permanent },
    { source: `/:locale(${L})/contact`, destination: "/about", permanent },
    { source: `/:locale(${L})/blog/:slug`, destination: "/posts/:slug", permanent },
    { source: `/:locale(${L})/:slug`, destination: "/posts/:slug", permanent },
    { source: `/:locale(${L})/:path+`, destination: "/posts", permanent },

    // Numeric WordPress IDs (e.g. /8/)
    { source: "/:id(\\d+)", destination: "/posts", permanent },

    // WP system paths (low equity; stop 404 noise)
    { source: "/wp-content/:path*", destination: "/", permanent },
    { source: "/wp-includes/:path*", destination: "/", permanent },
    { source: "/wp-admin/:path*", destination: "/", permanent },
    { source: "/wp-json/:path*", destination: "/", permanent },
    { source: "/xmlrpc.php", destination: "/", permanent },
    { source: "/index.php", destination: "/", permanent },
    { source: "/index.php/:path*", destination: "/", permanent },
  ];
}

/**
 * WordPress used root slugs (petralian.com/my-post). Next uses /posts/my-post.
 * Generate one 301 per published post file.
 */
export function buildLegacyPostRedirects(): LegacyRedirect[] {
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
