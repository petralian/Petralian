// ── Site-wide constants ─────────────────────────────────────────────────────
// Update these to match your real profiles before going live.

export const SITE_NAME = "Petralian";
export const SITE_TAGLINE =
  "Practical writing on enterprise AI, execution, and commercial outcomes.";
export const SITE_URL = "https://petralian.com";

/** Google Analytics 4 measurement ID (override via NEXT_PUBLIC_GA_MEASUREMENT_ID). */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-EWJYJZ0QN6";

/** Microsoft Clarity project ID (override via NEXT_PUBLIC_CLARITY_PROJECT_ID). */
export const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "r1quxeqt95";

export const AUTHOR_NAME = "Nathan Petralia";
export const AUTHOR_TITLE = "Managing Director, Hong Kong";
export const AUTHOR_BIO =
  "Operator and advisor focused on enterprise AI and tech delivery across Asia.";

export const SOCIAL_LINKS = {
  email: "mailto:nathan@petralian.com",
  linkedin: "https://www.linkedin.com/in/petralian/",
  github: "https://github.com/petralian/",
} as const;

export const NAV_LINKS = [
  { label: "Writing", href: "/posts" },
  { label: "About", href: "/about" },
] as const;

/** Calendar-day comparison for `date` frontmatter (scheduled publishing). */
export const EDITORIAL_TIMEZONE =
  process.env.EDITORIAL_TIMEZONE ?? "Asia/Hong_Kong";
