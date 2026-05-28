import PostCard from "@/components/PostCard";
import type { PostMeta } from "@/lib/posts";

/** Responsive post grid — CSS only (no client hydration). */
export default function PostGrid({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
