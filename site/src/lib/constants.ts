// ── Site-wide constants ─────────────────────────────────────────────────────
// Update these to match your real profiles before going live.

export const SITE_NAME = "Petralian";
export const SITE_TAGLINE =
  "Writing from inside enterprise AI and transformation — what it looks like at the level where strategy meets delivery.";
export const SITE_URL = "https://petralian.com";

export const SOCIAL_LINKS = {
  email: "mailto:nathan@petralian.com",
  linkedin: "https://www.linkedin.com/in/petralian/",
  github: "https://github.com/petralian/",
} as const;

export const NAV_LINKS = [
  { label: "Writing", href: "/posts" },
  { label: "About", href: "/about" },
] as const;
