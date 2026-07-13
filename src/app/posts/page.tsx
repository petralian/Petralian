import { Suspense } from "react";
import type { Metadata } from "next";
import BlogFilters from "@/components/BlogFilters";
import TopicBrowser from "@/components/TopicBrowser";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";
import { getTagStats } from "@/lib/tag-stats";
import writingContent from "../../../content/pages/writing.json";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Insights on AI, digital transformation, and the work that moves organizations forward.",
  alternates: { canonical: `${SITE_URL}/posts` },
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const posts = getAllPosts();
  const tagStats = getTagStats(posts);

  return (
    <div className="page-container">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Writing" },
        ]}
      />
      {/* ── Blog header ───────────────────────────────────────── */}
      <header className="blog-header">
        <h1 className="blog-header-title">{writingContent.header_title}</h1>
        {writingContent.header_description.split("\n\n").map((block, i) => (
          <p key={i} className="blog-header-description">
            {block.split("\n").map((line, k, arr) => (
              <span key={k}>
                {line}
                {k < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}

        <Suspense fallback={null}>
          <TopicBrowser tagStats={tagStats} postCount={posts.length} initialTag={tag} />
        </Suspense>
      </header>

      {/* ── Filters + grid ────────────────────────────────────── */}
      <Suspense
        fallback={
          <p className="blog-results-count" style={{ marginBottom: "2rem" }}>
            Loading articles…
          </p>
        }
      >
        <BlogFilters posts={posts} initialTag={tag} />
      </Suspense>
    </div>
  );
}
