import { SITE_URL } from "@/lib/constants";

export function absoluteAssetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${SITE_URL}${path}`;
  return `${SITE_URL}/${path}`;
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
