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
