"use client";

import Link from "next/link";
import type { TagStat } from "@/lib/tag-stats";
import { getTopicUrl, tagToSlug } from "@/lib/tag-slug";

interface TopicPillsProps {
  tagStats: TagStat[];
  postCount: number;
  activeSlug?: string | null;
  emptyMessage?: string;
  onNavigate?: (href: string) => void;
}

function topicClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  isActive: boolean,
  onNavigate?: (href: string) => void
) {
  if (isActive) {
    e.preventDefault();
    return;
  }
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  if (onNavigate) {
    e.preventDefault();
    onNavigate(href);
  }
}

export default function TopicPills({
  tagStats,
  postCount,
  activeSlug = null,
  emptyMessage,
  onNavigate,
}: TopicPillsProps) {
  const allActive = activeSlug === null;
  const activeTag = activeSlug
    ? tagStats.find(({ tag }) => tagToSlug(tag) === activeSlug)?.tag
    : null;

  return (
    <div className="blog-topics-panel">
      <details className="blog-topics-details">
        <summary className="blog-topics-summary">
          <span className="blog-filter-section-label">Browse by topic</span>
          {activeTag ? (
            <span className="blog-topics-active-tag">{activeTag}</span>
          ) : null}
          <span className="blog-topics-chevron" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="m9 6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <div className="blog-topics-cloud" role="navigation" aria-label="Browse by topic">
          <Link
            href="/posts"
            scroll={false}
            prefetch
            className={`blog-topic-pill blog-topic-pill--all${allActive ? " blog-topic-pill--active" : ""}`}
            aria-current={allActive ? "page" : undefined}
            onClick={(e) => topicClick(e, "/posts", allActive, onNavigate)}
          >
            All
            <span className="blog-topic-pill-count">{postCount}</span>
          </Link>

          {tagStats.length === 0 && emptyMessage ? (
            <p className="blog-topics-empty">{emptyMessage}</p>
          ) : (
            tagStats.map(({ tag, count }) => {
              const slug = tagToSlug(tag);
              const href = getTopicUrl(tag);
              const isActive = activeSlug === slug;
              return (
                <Link
                  key={tag}
                  href={href}
                  scroll={false}
                  prefetch
                  className={`blog-topic-pill${isActive ? " blog-topic-pill--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(e) => topicClick(e, href, isActive, onNavigate)}
                >
                  {tag}
                  <span className="blog-topic-pill-count">{count}</span>
                </Link>
              );
            })
          )}
        </div>
      </details>
    </div>
  );
}
