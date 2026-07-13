/** Article orientation — who gets the most value, not skill level. */
export type PostFormat = "strategic" | "hands-on" | "hybrid";

export interface FormatMeta {
  id: PostFormat;
  label: string;
  shortLabel: string;
  description: string;
  /** CSS custom property token for accent color */
  colorVar: string;
  hex: string;
}

export const POST_FORMATS: Record<PostFormat, FormatMeta> = {
  strategic: {
    id: "strategic",
    label: "Strategic",
    shortLabel: "Strategy",
    description: "Decisions, org design, and commercial tradeoffs",
    colorVar: "--format-strategic",
    hex: "#2563eb",
  },
  "hands-on": {
    id: "hands-on",
    label: "Hands-on",
    shortLabel: "Build",
    description: "Implementation, code, and tooling",
    colorVar: "--format-hands-on",
    hex: "#059669",
  },
  hybrid: {
    id: "hybrid",
    label: "Hybrid",
    shortLabel: "Both",
    description: "Strategy plus practical depth",
    colorVar: "--format-hybrid",
    hex: "#d97706",
  },
};

export const FORMAT_ORDER: PostFormat[] = ["strategic", "hands-on", "hybrid"];

export function isPostFormat(value: unknown): value is PostFormat {
  return value === "strategic" || value === "hands-on" || value === "hybrid";
}

export function getFormatMeta(format: PostFormat | ""): FormatMeta | null {
  if (!format || !isPostFormat(format)) return null;
  return POST_FORMATS[format];
}

export function formatFilterLabel(format: PostFormat): string {
  return POST_FORMATS[format].label;
}
