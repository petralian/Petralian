import type { PostMeta } from "@/lib/posts";
import { getRelatedPosts } from "@/lib/related-posts";
import PostCard from "./PostCard";

interface RelatedPostsProps {
  currentSlug: string;
  currentTags: string[];
  currentCategory: string;
  currentSeries?: string;
  relatedPostSlugs?: string[];
  allPosts: PostMeta[];
}

export default function RelatedPosts({
  currentSlug,
  currentTags,
  currentCategory,
  currentSeries,
  relatedPostSlugs,
  allPosts,
}: RelatedPostsProps) {
  const related = getRelatedPosts({
    currentSlug,
    currentTags,
    currentCategory,
    currentSeries,
    relatedPostSlugs,
    allPosts,
  });

  if (related.length === 0) return null;

  return (
    <section className="related-posts">
      <div className="related-posts-inner">
        <p className="related-posts-heading">Related posts</p>
        <div className="related-grid">
          {related.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
