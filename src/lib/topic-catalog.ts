import { getAllPosts } from "@/lib/posts";
import { tagToSlug } from "@/lib/tag-slug";

/** slug → display tag name */
export function buildTagSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      if (!tag) continue;
      const slug = tagToSlug(tag);
      if (!map[slug]) map[slug] = tag;
    }
  }
  return map;
}

export function getTopicSlugsFromCatalog(): string[] {
  return Object.keys(buildTagSlugMap()).sort();
}
