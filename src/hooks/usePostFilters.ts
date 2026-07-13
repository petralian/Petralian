"use client";

import { useMemo, useState } from "react";
import type { PostMeta } from "@/lib/posts";
import type { PostFormat } from "@/lib/post-format";
import type { FormatFilterValue } from "@/components/FormatFilter";
import { getTagStats } from "@/lib/tag-stats";

function countByFormat(posts: PostMeta[]): Record<PostFormat, number> {
  return posts.reduce(
    (acc, post) => {
      if (post.format) acc[post.format] += 1;
      return acc;
    },
    { strategic: 0, "hands-on": 0, hybrid: 0 } as Record<PostFormat, number>
  );
}

function matchesFormat(post: PostMeta, formatFilter: FormatFilterValue): boolean {
  return formatFilter === "all" || post.format === formatFilter;
}

interface UsePostFiltersOptions {
  /** Posts shown in the grid (may be scoped to one topic). */
  posts: PostMeta[];
  /** Full catalog for topic pill counts; defaults to `posts`. */
  catalogPosts?: PostMeta[];
}

export function usePostFilters({ posts, catalogPosts }: UsePostFiltersOptions) {
  const catalog = catalogPosts ?? posts;
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilterValue>("all");

  const formatCounts = useMemo(() => countByFormat(posts), [posts]);

  const formatFilteredCatalog = useMemo(
    () => catalog.filter((p) => matchesFormat(p, formatFilter)),
    [catalog, formatFilter]
  );

  const tagStats = useMemo(
    () => getTagStats(formatFilteredCatalog),
    [formatFilteredCatalog]
  );

  const catalogCount = formatFilteredCatalog.length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return posts.filter((p) => {
      if (!matchesFormat(p, formatFilter)) return false;
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

  return {
    search,
    setSearch,
    formatFilter,
    setFormatFilter,
    formatCounts,
    tagStats,
    catalogCount,
    filtered,
    hasActiveFilters,
    clearFilters,
  };
}
