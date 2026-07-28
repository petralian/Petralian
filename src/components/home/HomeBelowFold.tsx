import Link from "next/link";
import PostGrid from "@/components/PostGrid";
import HomeStartHere from "@/components/HomeStartHere";
import HomeSeriesHubs from "@/components/HomeSeriesHubs";
import HomeNewsletter from "@/components/home/HomeNewsletter";
import type { PostMeta } from "@/lib/posts";
import type { SeriesHub } from "@/lib/series-hubs";
import type homeContent from "../../../content/pages/home.json";

type HomeContent = typeof homeContent;

export default function HomeBelowFold({
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
