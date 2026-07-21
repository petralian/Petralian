import type { PostMeta } from "@/lib/posts";

export interface SeriesHub {
  series: string;
  hub: PostMeta;
  partCount: number;
}

function hubPostForSeries(parts: PostMeta[]): PostMeta {
  const explicit = parts.find((p) => p.series_order === 0);
  if (explicit) return explicit;

  return parts.reduce((best, post) => {
    const order = post.series_order ?? Number.MAX_SAFE_INTEGER;
    const bestOrder = best.series_order ?? Number.MAX_SAFE_INTEGER;
    if (order !== bestOrder) return order < bestOrder ? post : best;
    return new Date(post.date).getTime() > new Date(best.date).getTime()
      ? post
      : best;
  });
}

/** Published posts grouped by `series`; hub = `series_order: 0` or lowest order. */
export function getSeriesHubs(posts: PostMeta[]): SeriesHub[] {
  const bySeries = new Map<string, PostMeta[]>();

  for (const post of posts) {
    const name = post.series.trim();
    if (!name) continue;
    const list = bySeries.get(name) ?? [];
    list.push(post);
    bySeries.set(name, list);
  }

  const hubs: SeriesHub[] = [];
  for (const [series, parts] of bySeries) {
    if (parts.length < 2) continue;
    hubs.push({
      series,
      hub: hubPostForSeries(parts),
      partCount: parts.length,
    });
  }

  return hubs.sort(
    (a, b) =>
      new Date(b.hub.date).getTime() - new Date(a.hub.date).getTime()
  );
}

/** Curated slugs first, then fill with newest series hubs up to `limit`. */
export function getStartHerePosts(
  posts: PostMeta[],
  preferredSlugs: string[],
  limit = 4
): PostMeta[] {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const picked: PostMeta[] = [];
  const seen = new Set<string>();

  for (const slug of preferredSlugs) {
    const post = bySlug.get(slug);
    if (!post || seen.has(slug)) continue;
    picked.push(post);
    seen.add(slug);
    if (picked.length >= limit) return picked;
  }

  for (const { hub } of getSeriesHubs(posts)) {
    if (seen.has(hub.slug)) continue;
    picked.push(hub);
    seen.add(hub.slug);
    if (picked.length >= limit) break;
  }

  return picked;
}
