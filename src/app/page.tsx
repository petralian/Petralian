import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";
import homeContent from "../../content/pages/home.json";

function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
  const cols: T[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, i) => cols[i % numCols].push(item));
  return cols;
}

export default function HomePage() {
  const posts = getAllPosts();
  const recent = posts.slice(0, 9);

  return (
    <div className="page-container">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">{homeContent.hero_title}</h1>
        <p className="hero-tagline">{homeContent.hero_tagline}</p>
      </section>

      {/* Intro strip */}
      <section className="home-intro">
        <div className="home-intro-inner">
          <div className="home-intro-text">
            <p className="home-intro-eyebrow">Nathan Petralia</p>
            {homeContent.intro_bio.split("\n\n").map((block, i) => (
              <p key={i} className="home-intro-bio">
                {block.split("\n").map((line, k, arr) => (
                  <span key={k}>
                    {line}
                    {k < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
            <Link href="/about" className="home-intro-link">
              About Nathan &rarr;
            </Link>
          </div>
          <div className="home-intro-photo-wrap">
            <Image
              src="https://petralian.com/wp-content/uploads/2025/01/IMG_9214-e1736070938203.jpg"
              alt="Nathan Petralia at HKU"
              fill
              priority
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
            {splitIntoColumns(recent, 3).map((col, ci) => (
              <div key={ci} className="masonry-col">
                {col.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
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

