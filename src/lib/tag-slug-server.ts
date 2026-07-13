import { buildTagSlugMap } from "@/lib/topic-catalog";

export function slugToTag(slug: string): string | undefined {
  return buildTagSlugMap()[slug];
}

export function getAllTopicSlugs(): string[] {
  return Object.keys(buildTagSlugMap()).sort();
}
