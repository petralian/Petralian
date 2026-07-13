"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PostGrid from "@/components/PostGrid";
import type { PostMeta } from "@/lib/posts";
import { getTagTier, type TagStat } from "@/lib/tag-stats";

interface BlogFiltersProps {
  posts: PostMeta[];
  tagStats: TagStat[];
  initialTag?: string;
}

export default function BlogFilters({
  posts,
  tagStats,
  initialTag,
}: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(initialTag ?? "All");
  const [previewTag, setPreviewTag] = useState<string | null>(null);

  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    setActiveTag(tagFromUrl ?? "All");
  }, [searchParams]);

  const preview = useMemo(
    () => tagStats.find((t) => t.tag === previewTag) ?? null,
    [tagStats, previewTag]
  );

  function setTag(tag: string) {
    setActiveTag(tag);
    setPreviewTag(null);
    if (tag === "All") {
      router.push("/posts", { scroll: false });
    } else {
      router.push(`/posts?tag=${encodeURIComponent(tag)}`, { scroll: false });
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchTag = activeTag === "All" || p.tags.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [posts, search, activeTag]);

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

        <div className="blog-topics-panel">
          <div className="blog-topics-header">
            <p className="blog-topics-label">Browse by topic</p>
            <p className="blog-topics-hint">
              <span className="blog-topics-hint-desktop">
                Hover for a preview · click to filter
              </span>
              <span className="blog-topics-hint-mobile">Tap a topic to filter</span>
            </p>
          </div>

          <div
            className="blog-topics-cloud"
            role="group"
            aria-label="Filter posts by topic"
          >
            <button
              type="button"
              className={`blog-topic-pill blog-topic-pill--sm${activeTag === "All" ? " blog-topic-pill--active" : ""}`}
              onClick={() => setTag("All")}
              aria-pressed={activeTag === "All"}
            >
              All topics
              <span className="blog-topic-pill-count">{posts.length}</span>
            </button>

            {tagStats.map(({ tag, count }) => {
              const tier = getTagTier(count);
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  className={`blog-topic-pill blog-topic-pill--${tier}${isActive ? " blog-topic-pill--active" : ""}`}
                  onClick={() => setTag(tag)}
                  onMouseEnter={() => setPreviewTag(tag)}
                  onMouseLeave={() => setPreviewTag(null)}
                  onFocus={() => setPreviewTag(tag)}
                  onBlur={() => setPreviewTag(null)}
                  aria-pressed={isActive}
                >
                  {tag}
                  <span className="blog-topic-pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          {preview && (
            <div className="blog-topics-preview" role="status" aria-live="polite">
              <p className="blog-topics-preview-label">
                {preview.count} article{preview.count === 1 ? "" : "s"} on{" "}
                <strong>{preview.tag}</strong>
              </p>
              <ul className="blog-topics-preview-list">
                {preview.posts.slice(0, 3).map((post) => (
                  <li key={post.slug}>
                    <Link href={`/posts/${post.slug}`} className="blog-topics-preview-link">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {preview.count > 3 && (
                <button
                  type="button"
                  className="blog-topics-preview-more"
                  onClick={() => setTag(preview.tag)}
                >
                  View all {preview.count} →
                </button>
              )}
            </div>
          )}
        </div>

        {activeTag !== "All" && (
          <div className="blog-active-filters">
            <span className="blog-active-filters-label">Showing</span>
            <button
              type="button"
              className="blog-active-filter-chip"
              onClick={() => setTag("All")}
              aria-label={`Remove filter: ${activeTag}`}
            >
              {activeTag}
              <span aria-hidden="true">×</span>
            </button>
            <button
              type="button"
              className="blog-clear-filters"
              onClick={() => setTag("All")}
            >
              Clear
            </button>
          </div>
        )}

        <p className="blog-results-count" aria-live="polite">
          {filtered.length} article{filtered.length === 1 ? "" : "s"}
          {activeTag !== "All" ? ` tagged “${activeTag}”` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="blog-empty">No posts match that filter.</p>
      ) : (
        <PostGrid posts={filtered} />
      )}
    </>
  );
}
