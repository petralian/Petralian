import type { SeriesHub } from "@/lib/series-hubs";
import HomePathCard from "@/components/HomePathCard";
import HomePathRail from "@/components/HomePathRail";

function partLabel(count: number): string {
  const satellites = count - 1;
  if (satellites <= 0) return "1 part";
  return `Hub + ${satellites} parts`;
}

export default function HomeSeriesHubs({
  heading,
  intro,
  hubs,
}: {
  heading: string;
  intro: string;
  hubs: SeriesHub[];
}) {
  if (hubs.length === 0) return null;

  return (
    <section className="home-series" aria-labelledby="home-series-heading">
      <h2 id="home-series-heading" className="section-heading">
        {heading}
      </h2>
      <p className="home-section-intro">{intro}</p>
      <HomePathRail label={heading} layout="scroll">
        {hubs.map(({ series, hub, partCount }, index) => (
          <li key={series}>
            <HomePathCard
              href={`/posts/${hub.slug}`}
              image={hub.featured_image || undefined}
              imageAlt={hub.featured_image_alt || series}
              eyebrow="Reading path"
              title={series}
              blurb={hub.best_for || undefined}
              footer={`${partLabel(partCount)} · Start →`}
              index={index}
              variant="series"
            />
          </li>
        ))}
      </HomePathRail>
    </section>
  );
}
