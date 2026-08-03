import { format, parseISO } from "date-fns";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import { formatFilterLabel, POST_FORMATS, type PostFormat } from "@/lib/post-format";
import type { PostMeta } from "@/lib/posts";

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

/** Email clients handle JPEG/PNG better than AVIF. */
export function heroImageUrl(featuredImage: string): string | null {
  if (!featuredImage) return null;
  const path = featuredImage.startsWith("/") ? featuredImage : `/${featuredImage}`;
  if (path.endsWith(".avif")) {
    return `${SITE_URL}${path.replace(/\.avif$/, ".og.jpg")}`;
  }
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path}`;
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

function renderPostCard(post: PostMeta, index: number): string {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const imageUrl = heroImageUrl(post.featured_image);
  const badge = formatBadge(post.format);
  const summary = post.seo_description || post.excerpt;
  const bestFor = post.best_for ? `Best for: ${post.best_for}` : "";

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
              <p style="margin:12px 0 0;font-size:15px;line-height:1.65;color:${BRAND.inkMuted};">${esc(summary)}</p>
              ${bestFor ? `<p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:${BRAND.inkSoft};font-style:italic;">${esc(bestFor)}</p>` : ""}
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
  const logoUrl = `${SITE_URL}/images/petralian_blue.png`;
  const postsUrl = `${SITE_URL}/posts`;

  const formatCounts = posts.reduce<Record<string, number>>((acc, post) => {
    const label = post.format ? formatFilterLabel(post.format) : "Articles";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const formatSummary = Object.entries(formatCounts)
    .map(([label, count]) => `${count} ${label.toLowerCase()}`)
    .join(" · ");

  const items = posts.map((post, index) => renderPostCard(post, index)).join("");

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
                        ${esc(SITE_TAGLINE)} Here is your curated roundup of what shipped this week.
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
                      <p style="margin:0 0 8px;font-size:18px;line-height:1.4;font-weight:700;color:${BRAND.ink};">Want more than the digest?</p>
                      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:${BRAND.inkMuted};">
                        Explore the full archive, follow on LinkedIn, or reply with what you want covered next.
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
