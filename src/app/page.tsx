import Link from "next/link";
import Image from "next/image";
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
        <h1 className="hero-title">
          Technology, Transformation, and the People Navigating Both
        </h1>
        <p className="hero-tagline">{SITE_TAGLINE}</p>
      </section>

      {/* Intro strip */}
      <section className="home-intro">
        <div className="home-intro-inner">
          <div className="home-intro-text">
            <p className="home-intro-eyebrow">Nathan Petralia</p>
            <p className="home-intro-bio">
              Twenty years inside APAC&apos;s most demanding digital programs &mdash;
              Est&eacute;e Lauder, Shiseido, Microsoft, Merkle. Managing Director,
              Hong Kong. In 2024 I started building AI products from scratch.
              The gap between what I expected and what I found is what I write about.
            </p>
            <Link href="/about" className="home-intro-link">
              About Nathan &rarr;
            </Link>
          </div>
          <div className="home-intro-photo-wrap">
            <Image
              src="https://petralian.com/wp-content/uploads/2025/01/IMG_9214-e1736070938203.jpg"
              alt="Nathan Petralia at HKU"
              fill
              className="home-intro-photo"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        </div>
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

