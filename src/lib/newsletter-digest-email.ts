import fs from "fs";
import path from "path";
import { format, parseISO } from "date-fns";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import { formatFilterLabel, POST_FORMATS, type PostFormat } from "@/lib/post-format";
import { getPost, type PostMeta } from "@/lib/posts";
import { socialShareImagePath } from "@/lib/seo";

const BRAND = {
  ink: "#1b2430",
  inkMuted: "#545468",
  inkSoft: "#6b7280",
  surface: "#ffffff",
  surfaceAlt: "#f5f7fa",
  border: "#e1e1e9",
  accent: "#ff6a3d",
  accentHover: "#e55a2d",
  header: "#1c2a31",
} as const;

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseReadMinutes(readingTime: string): number {
  const match = readingTime.match(/(\d+)/);
  return match ? Number(match[1]) : 5;
}

function formatPostDate(date: string): string {
  try {
    return format(parseISO(date), "MMM d, yyyy");
  } catch {
    return date;
  }
}

function digestDateRange(posts: PostMeta[]): string {
  if (posts.length === 0) return "";
  const times = posts
    .map((p) => new Date(p.date).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  if (times.length === 0) return "";
  const start = format(new Date(times[0]), "MMM d");
  const end = format(new Date(times[times.length - 1]), "MMM d, yyyy");
  return `${start}–${end}`;
}

/** Email clients need JPEG/PNG — resolve first existing sidecar on disk (not AVIF). */
export function heroImageUrl(featuredImage: string): string | null {
  if (!featuredImage) return null;
  if (featuredImage.startsWith("http")) return featuredImage;

  const webPath = featuredImage.startsWith("/") ? featuredImage : `/${featuredImage}`;
  const publicRoot = path.join(process.cwd(), "public");
  const candidates: string[] = [];

  const ogPath = socialShareImagePath(webPath);
  if (ogPath) candidates.push(ogPath);

  if (/\.avif$/i.test(webPath)) {
    candidates.push(webPath.replace(/\.avif$/i, ".jpg"));
    candidates.push(webPath.replace(/\.avif$/i, ".jpeg"));
    candidates.push(webPath.replace(/\.avif$/i, ".png"));
  } else if (/\.webp$/i.test(webPath)) {
    candidates.push(webPath.replace(/\.webp$/i, ".jpg"));
    candidates.push(webPath.replace(/\.webp$/i, ".png"));
  }

  candidates.push(webPath);

  for (const rel of candidates) {
    const disk = path.join(publicRoot, rel.replace(/^\//, ""));
    if (fs.existsSync(disk)) {
      return `${SITE_URL}${rel}`;
    }
  }

  return null;
}

function extractTldrBullets(content: string): string[] {
  const match = content.match(/\*\*TL;DR\*\*\s*\n+([\s\S]*?)(?=\n## |\n---\s*$|$)/);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^[-*+]\s+/, "").replace(/\*\*/g, "").trim())
    .filter((line) => line.length > 24);
}

function extractLeadParagraph(content: string): string {
  const stripped = content.replace(/^[\s\S]*?\*\*TL;DR\*\*[\s\S]*?(?=\n## )/m, "");
  const match = stripped.match(/\n\n([^#\n*!][^\n]{80,420}?)\n\n/);
  if (!match) return "";
  return match[1]
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function paragraphAlreadyCovered(paragraphs: string[], candidate: string): boolean {
  const key = candidate.slice(0, 48).toLowerCase();
  return paragraphs.some((p) => p.toLowerCase().includes(key) || key.includes(p.slice(0, 48).toLowerCase()));
}

/** Multi-paragraph teaser — excerpt, SEO line, TL;DR hooks, lead paragraph (no spoilers). */
export function buildDigestTeaser(post: PostMeta, content: string): string[] {
  const paragraphs: string[] = [];
  const excerpt = post.excerpt?.trim();
  const seo = post.seo_description?.trim();

  if (excerpt) paragraphs.push(excerpt);
  if (seo && seo !== excerpt && !paragraphAlreadyCovered(paragraphs, seo)) {
    paragraphs.push(seo);
  }

  for (const bullet of extractTldrBullets(content)) {
    if (paragraphs.length >= 5) break;
    if (!paragraphAlreadyCovered(paragraphs, bullet)) paragraphs.push(bullet);
  }

  const learn = content.match(/\*\*What you will learn:\*\*\s*([^\n]+)/)?.[1]?.trim();
  if (learn && paragraphs.length < 5 && !paragraphAlreadyCovered(paragraphs, learn)) {
    paragraphs.push(`You'll leave with a clear read on ${learn.charAt(0).toLowerCase()}${learn.slice(1)}`);
  }

  if (paragraphs.length < 4) {
    const lead = extractLeadParagraph(content);
    if (lead && !paragraphAlreadyCovered(paragraphs, lead)) {
      paragraphs.push(lead.length > 280 ? `${lead.slice(0, 277).replace(/\s+\S*$/, "")}…` : lead);
    }
  }

  return paragraphs.slice(0, 6);
}

function formatBadge(format: PostFormat | ""): { label: string; color: string } | null {
  if (!format || !(format in POST_FORMATS)) return null;
  const meta = POST_FORMATS[format];
  return { label: meta.label, color: meta.hex };
}

function ctaButton(href: string, label: string, fullWidth = false): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" ${fullWidth ? 'width="100%"' : ""} style="margin:0;">
      <tr>
        <td align="center" style="border-radius:8px;background:${BRAND.accent};">
          <a href="${href}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;line-height:1.2;">${esc(label)}</a>
        </td>
      </tr>
    </table>`;
}

function statPill(label: string, value: string): string {
  return `
    <td style="padding:0 6px 0 0;vertical-align:top;">
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:${BRAND.surfaceAlt};border:1px solid ${BRAND.border};border-radius:999px;">
        <tr>
          <td style="padding:8px 14px;font-size:12px;line-height:1.3;color:${BRAND.inkMuted};">
            <span style="font-weight:700;color:${BRAND.ink};">${esc(value)}</span>
            <span style="color:${BRAND.inkSoft};"> ${esc(label)}</span>
          </td>
        </tr>
      </table>
    </td>`;
}

function renderPostCard(post: PostMeta, index: number, content: string): string {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const imageUrl = heroImageUrl(post.featured_image);
  const badge = formatBadge(post.format);
  const teaserParagraphs = buildDigestTeaser(post, content);
  const bestFor = post.best_for?.trim() ?? "";

  const imageBlock = imageUrl
    ? `
      <a href="${url}" style="text-decoration:none;">
        <img src="${imageUrl}" alt="${esc(post.featured_image_alt || post.title)}" width="584" style="display:block;width:100%;max-width:584px;height:auto;border:0;border-radius:10px 10px 0 0;" />
      </a>`
    : "";

  const badgeBlock = badge
    ? `<span style="display:inline-block;margin:0 8px 0 0;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#ffffff;background:${badge.color};">${esc(badge.label)}</span>`
    : "";

  const topicBlock =
    post.tags.length > 0
      ? `<span style="display:inline-block;margin:0 8px 0 0;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;color:${BRAND.inkMuted};background:${BRAND.surfaceAlt};border:1px solid ${BRAND.border};">${esc(post.tags[0])}</span>`
      : "";

  return `
    <tr>
      <td style="padding:0 0 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;background:${BRAND.surface};">
          ${imageUrl ? `<tr><td style="padding:0;line-height:0;">${imageBlock}</td></tr>` : ""}
          <tr>
            <td style="padding:${imageUrl ? "20px" : "24px"} 24px 24px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.accent};">
                ${String(index + 1).padStart(2, "0")} · ${esc(formatPostDate(post.date))}
              </p>
              <p style="margin:0 0 12px;line-height:1.3;">
                ${badgeBlock}${topicBlock}
                <span style="font-size:12px;color:${BRAND.inkSoft};">${esc(post.readingTime)}</span>
              </p>
              <a href="${url}" style="font-size:22px;line-height:1.35;color:${BRAND.ink};text-decoration:none;font-weight:700;">${esc(post.title)}</a>
              ${bestFor ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.55;color:${BRAND.inkSoft};font-style:italic;"><strong style="font-style:normal;color:${BRAND.inkMuted};">Best for:</strong> ${esc(bestFor)}</p>` : ""}
              ${teaserParagraphs
                .map(
                  (para, i) =>
                    `<p style="margin:${i === 0 && !bestFor ? "12px" : "10px"} 0 ${i === teaserParagraphs.length - 1 ? "0" : "12px"};font-size:15px;line-height:1.65;color:${BRAND.inkMuted};">${esc(para)}</p>`
                )
                .join("")}
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:18px;">
                <tr>
                  <td>${ctaButton(url, "Read article →")}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export function buildWeeklyDigestSubject(postCount: number): string {
  return `${SITE_NAME} weekly digest: ${postCount} new post${postCount > 1 ? "s" : ""}`;
}

export function buildWeeklyDigestHtml(params: {
  recipientName?: string;
  posts: PostMeta[];
  unsubscribeUrl: string;
}): string {
  const { recipientName, posts, unsubscribeUrl } = params;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const totalMinutes = posts.reduce((sum, post) => sum + parseReadMinutes(post.readingTime), 0);
  const range = digestDateRange(posts);
  const preheader = `${posts.length} new post${posts.length > 1 ? "s" : ""} · about ${totalMinutes} min of reading · ${range}`;
  const logoUrl = `${SITE_URL}/images/petralian_white.png`;
  const postsUrl = `${SITE_URL}/posts`;

  const formatCounts = posts.reduce<Record<string, number>>((acc, post) => {
    const label = post.format ? formatFilterLabel(post.format) : "Articles";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const formatSummary = Object.entries(formatCounts)
    .map(([label, count]) => `${count} ${label.toLowerCase()}`)
    .join(" · ");

  const items = posts
    .map((post, index) => {
      let content = "";
      try {
        content = getPost(post.slug).content;
      } catch {
        content = "";
      }
      return renderPostCard(post, index, content);
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${esc(buildWeeklyDigestSubject(posts.length))}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.surfaceAlt};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.surfaceAlt};padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:100%;">
            <tr>
              <td style="padding:0 0 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.header};border-radius:14px 14px 0 0;">
                  <tr>
                    <td style="padding:24px 28px 8px;">
                      <a href="${SITE_URL}" style="text-decoration:none;">
                        <img src="${logoUrl}" alt="${esc(SITE_NAME)}" width="148" style="display:block;border:0;height:auto;" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 28px 24px;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9fb0bb;">Weekly digest</p>
                      <h1 style="margin:8px 0 0;font-size:30px;line-height:1.2;color:#ffffff;font-weight:700;">This week on ${esc(SITE_NAME)}</h1>
                      <p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#c9d4db;">${esc(range)}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-top:4px solid ${BRAND.accent};border-radius:0 0 14px 14px;">
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 14px;font-size:17px;line-height:1.6;color:${BRAND.ink};">${esc(greeting)}</p>
                      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.inkMuted};">
                        ${esc(SITE_TAGLINE)} Here is what published this week.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 8px;">
                        <tr>
                          ${statPill("new posts", String(posts.length))}
                          ${statPill("min reading", String(totalMinutes))}
                        </tr>
                      </table>
                      ${formatSummary ? `<p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:${BRAND.inkSoft};">${esc(formatSummary)}</p>` : ""}
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:18px 0 8px;">
                        <tr>
                          <td>${ctaButton(postsUrl, "Browse all writing", false)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${items}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:14px;">
                  <tr>
                    <td style="padding:28px;text-align:center;">
                      <p style="margin:0 0 8px;font-size:18px;line-height:1.4;font-weight:700;color:${BRAND.ink};">Read the full archive</p>
                      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:${BRAND.inkMuted};">
                        Browse every post, follow on LinkedIn, or reply with what you want covered next.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 16px;">
                        <tr>
                          <td style="padding-right:8px;">${ctaButton(postsUrl, "Read all posts")}</td>
                          <td>${ctaButton(SOCIAL_LINKS.linkedin, "Connect on LinkedIn")}</td>
                        </tr>
                      </table>
                      <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.inkSoft};">
                        You are receiving this because you subscribed on ${esc(SITE_NAME)}.<br />
                        <a href="${unsubscribeUrl}" style="color:${BRAND.inkSoft};text-decoration:underline;">Unsubscribe</a>
                        · <a href="${SITE_URL}" style="color:${BRAND.inkSoft};text-decoration:underline;">petralian.com</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
