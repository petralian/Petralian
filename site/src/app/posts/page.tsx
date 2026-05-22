import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "All articles on digital transformation, AI, and leadership.",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div className="page-container">
      <header className="posts-index-header">
        <h1 className="posts-page-title">Writing</h1>
        <p className="posts-page-subtitle">
          {posts.length} articles on digital transformation, AI, and what
          leadership looks like when everything is changing.
        </p>
      </header>

      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
