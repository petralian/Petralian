import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";
import { SITE_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const recent = posts.slice(1, 6);

  return (
    <div className="page-container">
      {/* Hero */}
      <section className="hero">
        <p className="hero-eyebrow">Petralian.com</p>
        <h1 className="hero-title">
          Digital transformation,<br />
          from the inside out.
        </h1>
        <p className="hero-tagline">{SITE_TAGLINE}</p>
      </section>

      {/* Featured post */}
      {featured && (
        <section style={{ marginBottom: "3.5rem" }}>
          <p className="section-heading">Latest</p>
          <div className="posts-grid">
            <PostCard post={featured} featured />
          </div>
        </section>
      )}

      {/* Recent posts */}
      {recent.length > 0 && (
        <section style={{ marginBottom: "3rem" }}>
          <p className="section-heading">Recent Writing</p>
          <div className="posts-grid">
            {recent.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 6 && (
        <div style={{ textAlign: "center", paddingTop: "1rem" }}>
          <Link href="/posts" className="post-card-read-more">
            View all {posts.length} articles →
          </Link>
        </div>
      )}
    </div>
  );
}

