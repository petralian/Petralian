import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import HomePathCard from "@/components/HomePathCard";
import HomePathRail from "@/components/HomePathRail";

export default function HomeStartHere({
  heading,
  intro,
  posts,
}: {
  heading: string;
  intro: string;
  posts: PostMeta[];
}) {
  if (posts.length === 0) return null;

  return (
    <section className="home-start-here" aria-labelledby="home-start-here-heading">
      <h2 id="home-start-here-heading" className="section-heading">
        {heading}
      </h2>
      <p className="home-section-intro">{intro}</p>
      <HomePathRail label={heading} layout="cols-3">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <HomePathCard
              href={`/posts/${post.slug}`}
              image={post.featured_image || undefined}
              imageAlt={post.featured_image_alt || post.title}
              eyebrow={post.series ? "Series hub" : "Guide"}
              title={post.title}
              blurb={post.best_for || undefined}
              footer="Start here →"
              index={index}
              variant="start"
            />
          </li>
        ))}
      </HomePathRail>
      <p className="home-path-more">
        <Link href="/posts">Browse all writing →</Link>
      </p>
    </section>
  );
}
