import Link from "next/link";
import Image from "next/image";
import PostGrid from "@/components/PostGrid";
import HomeStartHere from "@/components/HomeStartHere";
import HomeSeriesHubs from "@/components/HomeSeriesHubs";
import HomeNewsletter from "@/components/home/HomeNewsletter";
import type { PostMeta } from "@/lib/posts";
import type { SeriesHub } from "@/lib/series-hubs";
import type homeContent from "../../../content/pages/home.json";

type HomeContent = typeof homeContent;

export default function HomeBelowHero({
  homeContent,
  startHere,
  seriesHubs,
  recent,
  newThisWeek,
  totalPosts,
}: {
  homeContent: HomeContent;
  startHere: PostMeta[];
  seriesHubs: SeriesHub[];
  recent: PostMeta[];
  newThisWeek: Set<string>;
  totalPosts: number;
}) {
  return (
    <>
      <section className="home-intro">
        <div className="home-intro-inner">
          <div className="home-intro-photo-wrap">
            <Image
              src="/images/nathan-petralia.jpg"
              alt="Nathan Petralia at HKU"
              fill
              loading="lazy"
              quality={60}
              className="home-intro-photo"
              sizes="(max-width: 860px) 100vw, 380px"
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

      <HomeNewsletter />

      {recent.length > 0 && (
        <section className="home-recent-posts">
          <p className="section-heading">{homeContent.latest_heading}</p>
          <PostGrid posts={recent} newSlugs={newThisWeek} />
        </section>
      )}

      {totalPosts > 6 && (
        <div className="home-view-all">
          <Link href="/posts" className="post-card-read-more">
            Browse all writing →
          </Link>
        </div>
      )}
    </>
  );
}
