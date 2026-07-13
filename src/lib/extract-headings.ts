export interface HeadingEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/** H2 titles excluded from sidebar nav (still rendered in article). Prefix match for variants. */
const OUTLINE_EXCLUDE_H2_PREFIX =
  /^(sources|quick reference|reader action|what you can do next|additional detail|reference)\b/i;

function isOutlineExcludedH2(text: string): boolean {
  return OUTLINE_EXCLUDE_H2_PREFIX.test(text.trim());
}

/** Visible nav items before "+N more" collapse. */
export const OUTLINE_VISIBLE_MAX = 7;

/** Minimum filtered H2 sections before showing navigation. */
export const MIN_OUTLINE_HEADINGS = 4;

/** Match GitHub-style heading anchors (em dash → `--`, `+` → `--`). */
export function slugifyHeading(text: string): string {
  let s = text.trim().toLowerCase();
  s = s.replace(/\s*—\s*/g, "--");
  s = s.replace(/\s*–\s*/g, "--");
  s = s.replace(/\s*\+\s*/g, "--");
  s = s.replace(/[()]/g, "");
  s = s.replace(/[^\w\s-]/g, "");
  s = s.replace(/\s+/g, "-");
  return s.replace(/^-+|-+$/g, "");
}

function stripFencedCode(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

function cleanHeadingText(raw: string): string {
  return raw
    .replace(/\*\*|__/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function uniqueId(base: string, used: Map<string, number>): string {
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/** Parse h2/h3 headings from markdown (h1 is the page title in the hero). */
export function extractHeadings(markdown: string): HeadingEntry[] {
  const body = stripFencedCode(markdown);
  const used = new Map<string, number>();
  const headings: HeadingEntry[] = [];

  for (const line of body.split(/\r?\n/)) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = cleanHeadingText(match[2]);
    if (!text) continue;

    const base = slugifyHeading(text);
    if (!base) continue;

    headings.push({
      id: uniqueId(base, used),
      text,
      level,
    });
  }

  return headings;
}

/** Sidebar nav: major H2 sections only, minus boilerplate blocks. */
export function buildOutlineNav(headings: HeadingEntry[]): HeadingEntry[] {
  return headings.filter(
    (h) => h.level === 2 && !isOutlineExcludedH2(h.text),
  );
}

export function shouldShowOutline(navHeadings: HeadingEntry[]): boolean {
  return navHeadings.length >= MIN_OUTLINE_HEADINGS;
}
