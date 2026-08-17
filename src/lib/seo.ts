import { SITE_URL } from "@/lib/constants";

const SOCIAL_RASTER_RE = /\.(avif|webp)$/i;

/** Map on-site AVIF/WebP asset path to JPEG sidecar for social crawlers (LinkedIn, X, Facebook). */
export function socialShareImagePath(
  assetPath: string | undefined
): string | undefined {
  if (!assetPath) return undefined;
  const base = assetPath.split("?")[0];
  if (SOCIAL_RASTER_RE.test(base)) {
    return base.replace(SOCIAL_RASTER_RE, ".og.jpg");
  }
  return base;
}

export function absoluteAssetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${SITE_URL}${path}`;
  return `${SITE_URL}/${path}`;
}

export function absoluteSocialShareUrl(
  path: string | undefined
): string | undefined {
  return absoluteAssetUrl(socialShareImagePath(path));
}

/** Extract FAQ Q&A from a ## FAQ section with ### question headings. */
export function extractFaqPairs(markdownBody: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const faqSection = markdownBody.match(
    /##\s+FAQ[\s\S]*?(?=\n##\s+[^#]|\n---\s*$|$)/i
  );
  if (!faqSection) return faqs;

  const block = faqSection[0];
  const re = /###\s+(.+?)\n+([\s\S]*?)(?=\n###\s+|\n##\s+|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    const question = m[1].trim().replace(/\?$/, "") + "?";
    const answer = m[2]
      .trim()
      .replace(/\n+/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .slice(0, 500);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}
