"use client";

import { useMemo, useState } from "react";
import PostGrid from "@/components/PostGrid";
import TopicPills from "@/components/TopicPills";
import type { PostMeta } from "@/lib/posts";
import type { TagStat } from "@/lib/tag-stats";

interface TopicArchiveProps {
  posts: PostMeta[];
  tagStats: TagStat[];
  totalPostCount: number;
  activeSlug: string;
  tagName: string;
}

export default function TopicArchive({
  posts,
  tagStats,
  totalPostCount,
  activeSlug,
  tagName,
}: TopicArchiveProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, search]);

  return (
    <>
      <div className="blog-filters">
        <div className="blog-filters-top">
          <div className="blog-search-wrap">
            <span className="blog-search-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="search"
              placeholder={`Search within ${tagName}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="blog-search-input"
              aria-label={`Search articles tagged ${tagName}`}
            />
          </div>
        </div>

        <TopicPills
          tagStats={tagStats}
          postCount={totalPostCount}
          activeSlug={activeSlug}
        />

        <p className="blog-results-count" aria-live="polite">
          {filtered.length} article{filtered.length === 1 ? "" : "s"} on{" "}
          {tagName}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="blog-empty">No posts match that search.</p>
      ) : (
        <PostGrid posts={filtered} />
      )}
    </>
  );
}
