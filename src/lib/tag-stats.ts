import type { PostMeta } from "@/lib/posts";

export interface TagStat {
  tag: string;
  count: number;
  posts: PostMeta[];
}

export function getTagStats(posts: PostMeta[]): TagStat[] {
  const map = new Map<string, PostMeta[]>();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tag) continue;
      const list = map.get(tag) ?? [];
      list.push(post);
      map.set(tag, list);
    }
  }
  return [...map.entries()]
    .map(([tag, tagPosts]) => ({
      tag,
      count: tagPosts.length,
      posts: [...tagPosts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getTagTier(count: number): "xl" | "lg" | "md" | "sm" {
  if (count >= 10) return "xl";
  if (count >= 6) return "lg";
  if (count >= 3) return "md";
  return "sm";
}

export function getRelatedTags(
  posts: PostMeta[],
  tag: string,
  limit = 3
): { tag: string; count: number }[] {
  const coCounts = new Map<string, number>();
  for (const post of posts) {
    if (!post.tags.includes(tag)) continue;
    for (const t of post.tags) {
      if (t === tag) continue;
      coCounts.set(t, (coCounts.get(t) ?? 0) + 1);
    }
  }
  return [...coCounts.entries()]
    .map(([t, count]) => ({ tag: t, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

export function topicIntro(tag: string, count: number): string {
  return `${count} article${count === 1 ? "" : "s"} on ${tag} — programs, tooling, and delivery on Petralian.`;
}
