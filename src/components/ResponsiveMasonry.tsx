"use client";

import { useEffect, useMemo, useState } from "react";
import PostCard from "@/components/PostCard";
import type { PostMeta } from "@/lib/posts";

interface ResponsiveMasonryProps {
    posts: PostMeta[];
}

function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
    if (numCols <= 1) return [items];
    const cols: T[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, i) => cols[i % numCols].push(item));
    return cols;
}

export default function ResponsiveMasonry({ posts }: ResponsiveMasonryProps) {
    const [cols, setCols] = useState(3);

    useEffect(() => {
        const mqMobile = window.matchMedia("(max-width: 640px)");
        const mqTablet = window.matchMedia("(max-width: 1024px)");

        const update = () => {
            if (mqMobile.matches) setCols(1);
            else if (mqTablet.matches) setCols(2);
            else setCols(3);
        };

        update();
        mqMobile.addEventListener("change", update);
        mqTablet.addEventListener("change", update);
        return () => {
            mqMobile.removeEventListener("change", update);
            mqTablet.removeEventListener("change", update);
        };
    }, []);

    const columns = useMemo(() => splitIntoColumns(posts, cols), [posts, cols]);

    return (
        <div className="masonry-grid" data-cols={cols}>
            {columns.map((col, ci) => (
                <div key={ci} className="masonry-col">
                    {col.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            ))}
        </div>
    );
}
