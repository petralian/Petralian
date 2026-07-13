"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getTagTier, type TagStat } from "@/lib/tag-stats";

interface TopicBrowserProps {
  tagStats: TagStat[];
  postCount: number;
  initialTag?: string;
}

export default function TopicBrowser({
  tagStats,
  postCount,
  initialTag,
}: TopicBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previewTag, setPreviewTag] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState(initialTag ?? "All");

  useEffect(() => {
    setActiveTag(searchParams.get("tag") ?? "All");
  }, [searchParams]);

  const preview = useMemo(
    () => tagStats.find((t) => t.tag === previewTag) ?? null,
    [tagStats, previewTag]
  );

  const navigateTag = useCallback(
    (tag: string) => {
      setActiveTag(tag);
      if (tag === "All") {
        router.push("/posts", { scroll: false });
      } else {
        router.push(`/posts?tag=${encodeURIComponent(tag)}`, { scroll: false });
      }
    },
    [router]
  );

  return (
    <section className="topic-browser" aria-label="Browse by topic">
      <div className="topic-browser-header">
        <p className="topic-browser-eyebrow">Explore topics</p>
        <p className="topic-browser-hint">
          <span className="topic-browser-hint-desktop">
            Hover to preview articles. Click to filter the archive.
          </span>
          <span className="topic-browser-hint-mobile">Tap a topic to filter posts.</span>
        </p>
      </div>

      <div className="topic-browser-toolbar">
        <button
          type="button"
          className={`topic-pill topic-pill--sm${activeTag === "All" ? " topic-pill--active" : ""}`}
          onClick={() => navigateTag("All")}
        >
          All topics
          <span className="topic-pill-count">{postCount}</span>
        </button>
      </div>

      <div className="topic-browser-cloud">
        {tagStats.map(({ tag, count, posts: tagPosts }) => {
          const tier = getTagTier(count);
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              type="button"
              className={`topic-pill topic-pill--${tier}${isActive ? " topic-pill--active" : ""}`}
              onClick={() => navigateTag(tag)}
              onMouseEnter={() => setPreviewTag(tag)}
              onMouseLeave={() => setPreviewTag(null)}
              onFocus={() => setPreviewTag(tag)}
              onBlur={() => setPreviewTag(null)}
              aria-pressed={isActive}
            >
              {tag}
              <span className="topic-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {preview && (
        <div className="topic-preview" role="tooltip" aria-live="polite">
          <p className="topic-preview-label">
            {preview.count} article{preview.count === 1 ? "" : "s"} on{" "}
            <strong>{preview.tag}</strong>
          </p>
          <ul className="topic-preview-list">
            {preview.posts.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <Link href={`/posts/${post.slug}`} className="topic-preview-link">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
          {preview.count > 3 && (
            <button
              type="button"
              className="topic-preview-more"
              onClick={() => navigateTag(preview.tag)}
            >
              View all {preview.count} →
            </button>
          )}
        </div>
      )}

      {/* Accessible flat list for screen readers / small screens */}
      <ul className="topic-browser-list" aria-label="All topics">
        {tagStats.map(({ tag, count }) => (
          <li key={tag}>
            <Link href={`/posts?tag=${encodeURIComponent(tag)}`}>
              {tag} ({count})
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
