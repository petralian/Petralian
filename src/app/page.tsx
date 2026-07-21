import Link from "next/link";
import Image from "next/image";
import PostGrid from "@/components/PostGrid";
import HomeStartHere from "@/components/HomeStartHere";
import HomeSeriesHubs from "@/components/HomeSeriesHubs";
import SubscribeBox from "@/components/SubscribeBox";
import { getAllPosts } from "@/lib/posts";
import { getSeriesHubs, getStartHerePosts } from "@/lib/series-hubs";
import { buildHomeMetadata, buildHomePageSchema } from "@/lib/home-seo";
import { getNewThisWeekSlugs } from "@/lib/post-freshness";
import homeContent from "../../content/pages/home.json";

export const revalidate = 3600;

export const metadata = buildHomeMetadata(homeContent);

export default function HomePage() {
  const posts = getAllPosts();
  const seriesHubs = getSeriesHubs(posts).slice(
    0,
    homeContent.featured_series_max ?? 4
  );
  const startHere = getStartHerePosts(
    posts,
    homeContent.start_here_slugs ?? [],
    homeContent.start_here_max ?? 3
  );
  const recent = posts.slice(0, 6);
  const newThisWeek = getNewThisWeekSlugs(posts);
  const homeSchema = buildHomePageSchema({
    content: homeContent,
    startHere,
    seriesHubs,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <div className="page-container">
        <section className="hero">
          <h1 className="hero-title">{homeContent.hero_title}</h1>
          {homeContent.hero_byline ? (
            <p className="hero-byline">{homeContent.hero_byline}</p>
          ) : null}
          <p className="hero-tagline">{homeContent.hero_tagline}</p>
          {homeContent.return_hook ? (
            <p className="hero-return-hook">{homeContent.return_hook}</p>
          ) : null}
        </section>

        <section className="home-intro">
          <div className="home-intro-inner">
            <div className="home-intro-photo-wrap">
              <Image
                src="/images/nathan-petralia.jpg"
                alt="Nathan Petralia at HKU"
                fill
                priority
                fetchPriority="high"
                quality={60}
                className="home-intro-photo"
                sizes="(max-width: 860px) 100vw, 420px"
              />
            </div>
            <div className="home-intro-text">
              <h2 className="home-intro-eyebrow">Nathan Petralia</h2>
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

        <HomeStartHere
          heading={homeContent.start_here_heading}
          intro={homeContent.start_here_intro}
          posts={startHere}
        />

        <HomeSeriesHubs
          heading={homeContent.series_heading}
          intro={homeContent.series_intro}
          hubs={seriesHubs}
        />

        <section className="home-newsletter" aria-label="Newsletter signup">
          <SubscribeBox />
        </section>

        {recent.length > 0 && (
          <section className="home-recent-posts">
            <p className="section-heading">{homeContent.latest_heading}</p>
            <PostGrid posts={recent} newSlugs={newThisWeek} />
          </section>
        )}

        {posts.length > 6 && (
          <div className="home-view-all">
            <Link href="/posts" className="post-card-read-more">
              Browse all writing →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
