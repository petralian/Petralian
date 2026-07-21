import { getEditorialDateKey, normalizePostDateKey } from "@/lib/posts";
import { EDITORIAL_TIMEZONE } from "@/lib/constants";

/** Monday 00:00 of the current editorial week. */
function getEditorialWeekStart(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EDITORIAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  const local = new Date(Date.UTC(y, m - 1, d));
  const day = local.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  local.setUTCDate(local.getUTCDate() - diff);
  return local;
}

/** True when post editorial date falls in the current Mon–Sun week (HK). */
export function isPostNewThisWeek(
  dateStr: string,
  now: Date = new Date()
): boolean {
  const postKey = normalizePostDateKey(dateStr);
  if (!postKey) return false;

  const weekStart = getEditorialWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const postDate = new Date(`${postKey}T12:00:00Z`);
  return postDate >= weekStart && postDate <= weekEnd;
}

/** Slugs of posts published this editorial week (newest first). */
export function getNewThisWeekSlugs(
  posts: { slug: string; date: string }[],
  now: Date = new Date()
): Set<string> {
  return new Set(
    posts
      .filter((p) => isPostNewThisWeek(p.date, now))
      .map((p) => p.slug)
  );
}
