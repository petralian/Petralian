"use client";

import { useEffect, useMemo, useTransition } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FormatFilter from "@/components/FormatFilter";
import PostGrid from "@/components/PostGrid";
import TopicPills from "@/components/TopicPills";
import { usePostFilters } from "@/hooks/usePostFilters";
import type { PostMeta } from "@/lib/posts";
import { POST_FORMATS } from "@/lib/post-format";
import { getRelatedTags, topicIntro } from "@/lib/tag-stats";
import { getTopicUrl } from "@/lib/tag-slug";

interface WritingHeaderContent {
  header_title: string;
  header_description: string;
}

interface WritingBrowseProps {
  allPosts: PostMeta[];
  tagSlugMap: Record<string, string>;
  writingHeader: WritingHeaderContent;
}

function parseTopicSlug(pathname: string | null): string | null {
  if (!pathname?.startsWith("/topics/")) return null;
  const slug = pathname.slice("/topics/".length).split("/")[0];
  return slug || null;
}

export default function WritingBrowse({
  allPosts,
  tagSlugMap,
  writingHeader,
}: WritingBrowseProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeSlug = useMemo(() => parseTopicSlug(pathname), [pathname]);
  const activeTag = activeSlug ? tagSlugMap[activeSlug] : null;

  const scopedPosts = useMemo(() => {
    if (!activeTag) return allPosts;
    return allPosts.filter((p) => p.tags.includes(activeTag));
  }, [allPosts, activeTag]);

  const related = useMemo(
    () => (activeTag ? getRelatedTags(allPosts, activeTag) : []),
    [allPosts, activeTag]
  );

  const {
    search,
    setSearch,
    formatFilter,
    setFormatFilter,
    formatCounts,
    tagStats,
    catalogCount,
    filtered,
  } = usePostFilters({ posts: scopedPosts, catalogPosts: allPosts });

  const formatLabel =
    formatFilter === "all" ? null : POST_FORMATS[formatFilter].label.toLowerCase();

  const navigateTopic = (href: string) => {
    if (href === pathname) return;
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  useEffect(() => {
    router.prefetch("/posts");
    for (const slug of Object.keys(tagSlugMap)) {
      router.prefetch(`/topics/${slug}`);
    }
  }, [router, tagSlugMap]);

  const breadcrumbItems = activeTag
    ? [
      { label: "Home", href: "/" },
      { label: "Writing", href: "/posts" },
      { label: activeTag },
    ]
    : [{ label: "Home", href: "/" }, { label: "Writing" }];

  const resultsLabel = activeTag
    ? `Showing ${filtered.length} article${filtered.length === 1 ? "" : "s"} on ${activeTag}`
    : `Showing ${filtered.length} article${filtered.length === 1 ? "" : "s"}`;

  if (activeSlug && !activeTag) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <header className="blog-header blog-header--browse">
        <h1 className="blog-header-title">
          {activeTag ?? writingHeader.header_title}
        </h1>
        {activeTag ? (
          <p className="blog-header-description">
            {topicIntro(activeTag, scopedPosts.length)}
          </p>
        ) : (
          writingHeader.header_description.split("\n\n").map((block, i) => (
            <p key={i} className="blog-header-description">
              {block.split("\n").map((line, k, arr) => (
                <span key={k}>
                  {line}
                  {k < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          ))
        )}
        {related.length > 0 && (
          <div className="topic-related">
            <span className="topic-related-label">Related topics</span>
            <div className="topic-related-pills">
              {related.map(({ tag: relatedTag }) => (
                <button
                  key={relatedTag}
                  type="button"
                  className="topic-related-pill"
                  onClick={() => navigateTopic(getTopicUrl(relatedTag))}
                >
                  {relatedTag}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

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
              placeholder={
                activeTag
                  ? `Search within ${activeTag}…`
                  : "Search posts by topic, use case, or keyword…"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="blog-search-input"
              aria-label={
                activeTag ? `Search articles tagged ${activeTag}` : "Search articles"
              }
            />
          </div>
        </div>

        <FormatFilter
          value={formatFilter}
          counts={formatCounts}
          total={scopedPosts.length}
          onChange={setFormatFilter}
        />

        <TopicPills
          tagStats={tagStats}
          postCount={catalogCount}
          activeSlug={activeSlug}
          onNavigate={navigateTopic}
          emptyMessage={
            formatLabel
              ? `No topics with ${formatLabel} articles in this view.`
              : undefined
          }
        />

        <div className="blog-results-row">
          <p className="blog-results-count" aria-live="polite">
            {resultsLabel}
            {isPending && (
              <span className="blog-results-pending" aria-hidden="true">
                {" "}
                · updating…
              </span>
            )}
          </p>
        </div>
      </div>

      <div
        className={`post-grid-wrap${isPending ? " post-grid-wrap--pending" : ""}`}
        aria-busy={isPending}
      >
        {filtered.length === 0 ? (
          <p className="blog-empty">No posts match those filters.</p>
        ) : (
          <PostGrid posts={filtered} />
        )}
      </div>
    </>
  );
}
