"use client";

import { useMemo, useState } from "react";
import PostGrid from "@/components/PostGrid";
import TopicPills from "@/components/TopicPills";
import FormatFilter, { type FormatFilterValue } from "@/components/FormatFilter";
import type { PostMeta } from "@/lib/posts";
import type { PostFormat } from "@/lib/post-format";
import type { TagStat } from "@/lib/tag-stats";

interface BlogFiltersProps {
  posts: PostMeta[];
  tagStats: TagStat[];
}

function countByFormat(posts: PostMeta[]): Record<PostFormat, number> {
  return posts.reduce(
    (acc, post) => {
      if (post.format) acc[post.format] += 1;
      return acc;
    },
    { strategic: 0, "hands-on": 0, hybrid: 0 } as Record<PostFormat, number>
  );
}

export default function BlogFilters({ posts, tagStats }: BlogFiltersProps) {
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilterValue>("all");
  const formatCounts = useMemo(() => countByFormat(posts), [posts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return posts.filter((p) => {
      if (formatFilter !== "all" && p.format !== formatFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.best_for.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, search, formatFilter]);

  const hasActiveFilters = search.length > 0 || formatFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setFormatFilter("all");
  };

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
              placeholder="Search posts by topic, use case, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="blog-search-input"
              aria-label="Search articles"
            />
          </div>
        </div>

        <FormatFilter
          value={formatFilter}
          counts={formatCounts}
          total={posts.length}
          onChange={setFormatFilter}
        />

        <TopicPills tagStats={tagStats} postCount={posts.length} />

        <div className="blog-results-row">
          <p className="blog-results-count" aria-live="polite">
            {filtered.length} article{filtered.length === 1 ? "" : "s"}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="blog-clear-filters"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="blog-empty">No posts match those filters.</p>
      ) : (
        <PostGrid posts={filtered} />
      )}
    </>
  );
}
