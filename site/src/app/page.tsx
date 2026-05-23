import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";
import { SITE_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  const posts = getAllPosts();
  const recent = posts.slice(0, 9);

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

      {/* Posts grid */}
      {recent.length > 0 && (
        <section>
          <p className="section-heading">Latest Writing</p>
          <div className="masonry-grid">
            {recent.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 9 && (
        <div style={{ textAlign: "center", paddingTop: "2.5rem" }}>
          <Link href="/posts" className="post-card-read-more">
            View all {posts.length} articles →
          </Link>
        </div>
      )}
    </div>
  );
}

