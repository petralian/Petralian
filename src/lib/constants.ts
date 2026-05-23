// ── Site-wide constants ─────────────────────────────────────────────────────
// Update these to match your real profiles before going live.

export const SITE_NAME = "Petralian";
export const SITE_TAGLINE =
  "Writing on enterprise AI, digital transformation, and what it takes to make change stick in large organisations.";
export const SITE_URL = "https://petralian.com";

export const AUTHOR_NAME = "Nathan Petralia";
export const AUTHOR_TITLE = "Managing Director, Hong Kong";
export const AUTHOR_BIO =
  "Managing Director, Hong Kong. Twenty years inside APAC's most demanding digital programs — Estée Lauder, Shiseido, Microsoft, Merkle. In 2024 started building AI products from scratch. Writes about enterprise AI, commercial growth, and digital transformation.";

export const SOCIAL_LINKS = {
  email: "mailto:nathan@petralian.com",
  linkedin: "https://www.linkedin.com/in/petralian/",
  github: "https://github.com/petralian/",
} as const;

export const NAV_LINKS = [
  { label: "Writing", href: "/posts" },
  { label: "About", href: "/about" },
] as const;
