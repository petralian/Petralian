import dynamic from "next/dynamic";
import { getAllPosts } from "@/lib/posts";
import { getSeriesHubs, getStartHerePosts } from "@/lib/series-hubs";
import { buildHomeMetadata, buildHomePageSchema } from "@/lib/home-seo";
import { getNewThisWeekSlugs } from "@/lib/post-freshness";
import homeContent from "../../content/pages/home.json";

const HomeBelowHero = dynamic(() => import("@/components/home/HomeBelowHero"));

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
        <style
          dangerouslySetInnerHTML={{
            __html:
              ".hero{padding:var(--space-12,3rem) 0 var(--space-10,2.5rem);margin-bottom:var(--space-5,1.25rem)}.hero-title{font-family:var(--font-heading),system-ui,sans-serif;font-size:clamp(2.125rem,5.5vw,3rem);font-weight:700;line-height:1.15;color:var(--color-ink-heading,#1b2430);margin-bottom:var(--space-5,1.25rem);max-width:min(48rem,100%);text-wrap:balance}.hero-tagline{font-size:1.125rem;color:var(--color-ink-secondary,#545468);max-width:min(40rem,100%);line-height:1.7}",
          }}
        />
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

        <HomeBelowHero
          homeContent={homeContent}
          startHere={startHere}
          seriesHubs={seriesHubs}
          recent={recent}
          newThisWeek={newThisWeek}
          totalPosts={posts.length}
        />
      </div>
    </>
  );
}
