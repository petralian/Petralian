import PostCard from "@/components/PostCard";
import type { PostMeta } from "@/lib/posts";

/** Responsive post grid — CSS only (no client hydration). */
export default function PostGrid({
  posts,
  newSlugs,
}: {
  posts: PostMeta[];
  newSlugs?: Set<string>;
}) {
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          post={post}
          isNew={newSlugs?.has(post.slug)}
        />
      ))}
    </div>
  );
}
