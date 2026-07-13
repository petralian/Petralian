import Link from "next/link";
import type { TagStat } from "@/lib/tag-stats";
import { getTopicUrl, tagToSlug } from "@/lib/tag-slug";

interface TopicPillsProps {
  tagStats: TagStat[];
  postCount: number;
  activeSlug?: string | null;
}

export default function TopicPills({
  tagStats,
  postCount,
  activeSlug = null,
}: TopicPillsProps) {
  const allActive = activeSlug === null;

  return (
    <div className="blog-topics-panel">
      <div className="blog-topics-header">
        <p className="blog-topics-label">Browse by topic</p>
        <p className="blog-topics-hint">
          <span className="blog-topics-hint-desktop">Click a topic to open its archive</span>
          <span className="blog-topics-hint-mobile">Tap a topic to browse</span>
        </p>
      </div>

      <div className="blog-topics-cloud" role="navigation" aria-label="Browse by topic">
        <Link
          href="/posts"
          className={`blog-topic-pill blog-topic-pill--all${allActive ? " blog-topic-pill--active" : ""}`}
          aria-current={allActive ? "page" : undefined}
        >
          All topics
          <span className="blog-topic-pill-count">{postCount}</span>
        </Link>

        {tagStats.map(({ tag, count }) => {
          const slug = tagToSlug(tag);
          const isActive = activeSlug === slug;
          return (
            <Link
              key={tag}
              href={getTopicUrl(tag)}
              className={`blog-topic-pill${isActive ? " blog-topic-pill--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {tag}
              <span className="blog-topic-pill-count">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
