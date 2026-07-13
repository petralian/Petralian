// ── Site-wide constants ─────────────────────────────────────────────────────
// Update these to match your real profiles before going live.

export const SITE_NAME = "Petralian";
export const SITE_TAGLINE =
  "Practical writing on enterprise AI, execution, and commercial outcomes.";
export const SITE_URL = "https://petralian.com";

/** Google Analytics 4 measurement ID (override via NEXT_PUBLIC_GA_MEASUREMENT_ID). */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-EWJYJZ0QN6";

/** TruConversion ti-js path segment (override via NEXT_PUBLIC_TRUCONVERSION_SCRIPT_PATH). */
export const TRUCONVERSION_SCRIPT_PATH =
  process.env.NEXT_PUBLIC_TRUCONVERSION_SCRIPT_PATH ?? "35198/d46f0";

/** TruConversion Reveal visitor-tracking client ID. */
export const TRUCONVERSION_REVEAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_TRUCONVERSION_REVEAL_CLIENT_ID ??
  "bYWmatUgWapY699k1o1sgm";

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
