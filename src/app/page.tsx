import Link from "next/link";
import Image from "next/image";
import PostGrid from "@/components/PostGrid";
import { getAllPosts } from "@/lib/posts";
import homeContent from "../../content/pages/home.json";

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
          {/* Photo first in DOM so mobile discovers LCP image before bio copy */}
          <div className="home-intro-photo-wrap">
            <Image
              src="/images/nathan-petralia.jpg"
              alt="Nathan Petralia at HKU"
              fill
              priority
              fetchPriority="high"
              quality={65}
              className="home-intro-photo"
              sizes="(max-width: 860px) 100vw, 420px"
            />
          </div>
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
              About me &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      {recent.length > 0 && (
        <section className="home-recent-posts">
          <p className="section-heading">Recent Posts</p>
          <PostGrid posts={recent} />
        </section>
      )}

      {posts.length > 9 && (
        <div style={{ textAlign: "center", paddingTop: "2.5rem" }}>
          <Link href="/posts" className="post-card-read-more">
            Browse all posts →
          </Link>
        </div>
      )}
    </div>
  );
}

