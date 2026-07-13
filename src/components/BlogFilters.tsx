"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PostGrid from "@/components/PostGrid";
import type { PostMeta } from "@/lib/posts";
import type { TagStat } from "@/lib/tag-stats";

const HOVER_HIDE_MS = 220;

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
  const [hoverTag, setHoverTag] = useState<string | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    setActiveTag(tagFromUrl ?? "All");
  }, [searchParams]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const showHover = useCallback(
    (tag: string) => {
      if (!finePointer || activeTag !== "All") return;
      cancelHide();
      setHoverTag(tag);
    },
    [activeTag, cancelHide, finePointer]
  );

  const scheduleHideHover = useCallback(() => {
    if (!finePointer || activeTag !== "All") return;
    cancelHide();
    hideTimer.current = setTimeout(() => setHoverTag(null), HOVER_HIDE_MS);
  }, [activeTag, cancelHide, finePointer]);

  const teaserTag = activeTag !== "All" ? activeTag : hoverTag;
  const teaser = useMemo(
    () => (teaserTag ? tagStats.find((t) => t.tag === teaserTag) ?? null : null),
    [tagStats, teaserTag]
  );
  const teaserPinned = activeTag !== "All";

  function setTag(tag: string) {
    setActiveTag(tag);
    setHoverTag(null);
    cancelHide();
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
                Click to filter · hover to sample articles
              </span>
              <span className="blog-topics-hint-mobile">Tap a topic to filter</span>
            </p>
          </div>

          <div
            className="blog-topics-hover-zone"
            onMouseLeave={teaserPinned ? undefined : scheduleHideHover}
          >
            <div
              className="blog-topics-cloud"
              role="group"
              aria-label="Filter posts by topic"
            >
              <button
                type="button"
                className={`blog-topic-pill blog-topic-pill--all${activeTag === "All" ? " blog-topic-pill--active" : ""}`}
                onClick={() => setTag("All")}
                aria-pressed={activeTag === "All"}
              >
                All topics
                <span className="blog-topic-pill-count">{posts.length}</span>
              </button>

              {tagStats.map(({ tag, count }) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`blog-topic-pill${isActive ? " blog-topic-pill--active" : ""}`}
                    onClick={() => setTag(tag)}
                    onMouseEnter={() => showHover(tag)}
                    onFocus={() => showHover(tag)}
                    onBlur={scheduleHideHover}
                    aria-pressed={isActive}
                  >
                    {tag}
                    <span className="blog-topic-pill-count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div
              className={`blog-topics-teaser${teaser ? " blog-topics-teaser--open" : ""}${teaserPinned ? " blog-topics-teaser--pinned" : ""}`}
              onMouseEnter={() => teaserTag && showHover(teaserTag)}
              aria-hidden={!teaser}
            >
              {teaser && (
                <div className="blog-topics-teaser-inner">
                  <p className="blog-topics-teaser-label">
                    {teaserPinned ? (
                      <>
                        Sample articles in <strong>{teaser.tag}</strong> — full list
                        below
                      </>
                    ) : (
                      <>
                        {teaser.count} article{teaser.count === 1 ? "" : "s"} on{" "}
                        <strong>{teaser.tag}</strong> — click the tag to filter
                      </>
                    )}
                  </p>
                  <ul className="blog-topics-teaser-list">
                    {teaser.posts.slice(0, 3).map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="blog-topics-teaser-link"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
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
