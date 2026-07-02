import type { PostMeta } from "@/lib/posts";

export const RELATED_POST_COUNT = 3;
export const RELATED_MIN_SCORE = 5;
export const RELATED_SERIES_BOOST = 4;
export const RELATED_CATEGORY_BOOST = 1;

export interface RelatedPostsInput {
  currentSlug: string;
  currentTags: string[];
  currentCategory: string;
  currentSeries?: string;
  relatedPostSlugs?: string[];
  allPosts: PostMeta[];
  count?: number;
}

function buildTagFrequency(posts: PostMeta[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      freq.set(tag, (freq.get(tag) ?? 0) + 1);
    }
  }
  return freq;
}

/** Rare tags score higher; common tags (e.g. Agentic AI) score lower. */
export function tagMatchPoints(
  tag: string,
  tagFreq: Map<string, number>,
  postCount: number
): number {
  const count = tagFreq.get(tag) ?? 1;
  const share = count / Math.max(postCount, 1);
  if (share > 0.25) return 1;
  if (share > 0.12) return 2;
  return 3;
}

export function scoreRelatedPost(
  post: PostMeta,
  currentTags: string[],
  currentCategory: string,
  currentSeries: string | undefined,
  tagFreq: Map<string, number>,
  postCount: number
): number {
  let score = 0;

  const sharedTags = post.tags.filter((t) => currentTags.includes(t));
  for (const tag of sharedTags) {
    score += tagMatchPoints(tag, tagFreq, postCount);
  }

  if (currentCategory && post.category === currentCategory) {
    score += RELATED_CATEGORY_BOOST;
  }

  if (currentSeries && post.series && post.series === currentSeries) {
    score += RELATED_SERIES_BOOST;
  }

  return score;
}

export function getRelatedPosts({
  currentSlug,
  currentTags,
  currentCategory,
  currentSeries,
  relatedPostSlugs = [],
  allPosts,
  count = RELATED_POST_COUNT,
}: RelatedPostsInput): PostMeta[] {
  const bySlug = new Map(allPosts.map((p) => [p.slug, p]));
  const picked: PostMeta[] = [];
  const seen = new Set<string>([currentSlug]);

  for (const slug of relatedPostSlugs) {
    if (picked.length >= count) break;
    const post = bySlug.get(slug);
    if (!post || seen.has(slug)) continue;
    picked.push(post);
    seen.add(slug);
  }

  if (picked.length < count) {
    const tagFreq = buildTagFrequency(allPosts);
    const scored = allPosts
      .filter((p) => !seen.has(p.slug))
      .map((post) => ({
        post,
        score: scoreRelatedPost(
          post,
          currentTags,
          currentCategory,
          currentSeries,
          tagFreq,
          allPosts.length
        ),
      }))
      .filter(({ score }) => score >= RELATED_MIN_SCORE)
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
      );

    for (const { post } of scored) {
      if (picked.length >= count) break;
      picked.push(post);
      seen.add(post.slug);
    }
  }

  return picked;
}
