// ── Site-wide constants ─────────────────────────────────────────────────────
// Update these to match your real profiles before going live.

export const SITE_NAME = "Petralian";
export const SITE_TAGLINE =
  "Practical writing on enterprise AI, execution, and commercial outcomes.";
export const SITE_URL = "https://petralian.com";

/** Google Analytics 4 measurement ID (override via NEXT_PUBLIC_GA_MEASUREMENT_ID). */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-EWJYJZ0QN6";

/** TruConversion site ID (override via NEXT_PUBLIC_TRUCONVERSION_SITE_ID). */
export const TRUCONVERSION_SITE_ID =
  process.env.NEXT_PUBLIC_TRUCONVERSION_SITE_ID ?? "";

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
