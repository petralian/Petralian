import { getAllPosts } from "@/lib/posts";
import { tagToSlug } from "@/lib/tag-slug";

function buildTagSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      if (!tag) continue;
      const slug = tagToSlug(tag);
      if (!map.has(slug)) map.set(slug, tag);
    }
  }
  return map;
}

export function slugToTag(slug: string): string | undefined {
  return buildTagSlugMap().get(slug);
}

export function getAllTopicSlugs(): string[] {
  return [...buildTagSlugMap().keys()].sort();
}
