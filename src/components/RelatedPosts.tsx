import type { PostMeta } from "@/lib/posts";
import PostCard from "./PostCard";

interface RelatedPostsProps {
  currentSlug: string;
  currentTags: string[];
  currentCategory: string;
  allPosts: PostMeta[];
}

function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  currentCategory: string,
  allPosts: PostMeta[],
  count = 3
): PostMeta[] {
  return allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((post) => {
      let score = 0;
      // +2 per matching tag
      const sharedTags = post.tags.filter((t) => currentTags.includes(t));
      score += sharedTags.length * 2;
      // +1 for same category
      if (currentCategory && post.category === currentCategory) score += 1;
      return { post, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    )
    .slice(0, count)
    .map(({ post }) => post);
}

export default function RelatedPosts({
  currentSlug,
  currentTags,
  currentCategory,
  allPosts,
}: RelatedPostsProps) {
  const related = getRelatedPosts(currentSlug, currentTags, currentCategory, allPosts);

  if (related.length === 0) return null;

  return (
    <section className="related-posts">
      <div className="related-posts-inner">
        <p className="related-posts-heading">Keep Reading</p>
        <div className="related-grid">
          {related.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
