"use client";

import { useState, useMemo, useEffect } from "react";
import PostCard from "@/components/PostCard";
import type { PostMeta } from "@/lib/posts";

interface BlogFiltersProps {
    posts: PostMeta[];
    categories: string[];
    tags: string[];
    initialTag?: string;
}

/** Split items into N columns for left-to-right masonry reading order */
function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
    if (numCols <= 1) return [items];
    const cols: T[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, i) => cols[i % numCols].push(item));
    return cols;
}

export default function BlogFilters({
    posts,
    categories,
    tags,
    initialTag,
}: BlogFiltersProps) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeTag, setActiveTag] = useState(initialTag ?? "All");
    const [cols, setCols] = useState(3);

    useEffect(() => {
        const mq1 = window.matchMedia("(max-width: 640px)");
        const mq2 = window.matchMedia("(max-width: 1024px)");
        const update = () => {
            if (mq1.matches) setCols(1);
            else if (mq2.matches) setCols(2);
            else setCols(3);
        };
        update();
        mq1.addEventListener("change", update);
        mq2.addEventListener("change", update);
        return () => {
            mq1.removeEventListener("change", update);
            mq2.removeEventListener("change", update);
        };
    }, []);

    const availableTags = useMemo(() => {
        if (activeCategory === "All") return tags;
        const tagSet = new Set<string>();
        posts
            .filter((p) => p.category === activeCategory)
            .forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
        return tags.filter((t) => tagSet.has(t));
    }, [activeCategory, posts, tags]);

    function handleCategoryChange(cat: string) {
        setActiveCategory(cat);
        if (cat !== "All" && activeTag !== "All") {
            const tagSet = new Set<string>();
            posts.filter((p) => p.category === cat).forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
            if (!tagSet.has(activeTag)) setActiveTag("All");
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
            const matchCategory =
                activeCategory === "All" || p.category === activeCategory;
            const matchTag = activeTag === "All" || p.tags.includes(activeTag);
            return matchSearch && matchCategory && matchTag;
        });
    }, [posts, search, activeCategory, activeTag]);

    const columns = useMemo(
        () => splitIntoColumns(filtered, cols),
        [filtered, cols]
    );

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
                            placeholder="Search articles, ideas, and insights&hellip;"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="blog-search-input"
                            aria-label="Search articles"
                        />
                    </div>
                    <select
                        value={activeTag}
                        onChange={(e) => setActiveTag(e.target.value)}
                        className="blog-tag-select"
                        aria-label="Filter by tag"
                    >
                        <option value="All">All tags</option>
                        {availableTags.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="blog-category-pills">
                    {["All", ...categories].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`blog-category-pill${activeCategory === cat ? " blog-category-pill--active" : ""}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <p className="blog-empty">No articles match your search.</p>
            ) : (
                <div className="masonry-grid">
                    {columns.map((col, ci) => (
                        <div key={ci} className="masonry-col">
                            {col.map((post) => (
                                <PostCard key={post.slug} post={post} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
