"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostGrid from "@/components/PostGrid";
import type { PostMeta } from "@/lib/posts";

interface BlogFiltersProps {
  posts: PostMeta[];
  initialTag?: string;
}

export default function BlogFilters({ posts, initialTag }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(initialTag ?? "All");

  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    setActiveTag(tagFromUrl ?? "All");
  }, [searchParams]);

  function setTag(tag: string) {
    setActiveTag(tag);
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
              placeholder="Search posts by topic, use case, or keyword&hellip;"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="blog-search-input"
              aria-label="Search articles"
            />
          </div>
        </div>

        {activeTag !== "All" && (
          <div className="blog-active-filters">
            <span className="blog-active-filters-label">Filtered by</span>
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
