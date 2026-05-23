import type { Metadata } from "next";
import BlogFilters from "@/components/BlogFilters";
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Insights on AI, digital transformation, and the work that actually moves organisations forward.",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="page-container">
      {/* ── Blog header ───────────────────────────────────────── */}
      <header className="blog-header">
        <p className="blog-header-eyebrow">Insights into Digital Transformation</p>
        <h1 className="blog-header-title">Perspectives on Technology and Change</h1>
        <p className="blog-header-description">
          Thinking at the intersection of enterprise AI, digital transformation,
          and what it actually takes to make change stick inside large organisations.
        </p>

        <div className="blog-topic-row">
          <div className="blog-topic-card blog-topic-card--dark">
            <p className="blog-topic-title">AI &amp; Technology</p>
            <p className="blog-topic-desc">
              How AI is reshaping enterprise strategy, operations, and the
              humans navigating the shift.
            </p>
          </div>
          <div className="blog-topic-card blog-topic-card--light">
            <p className="blog-topic-title">Digital Transformation</p>
            <p className="blog-topic-desc">
              The work behind the roadmaps &mdash; governance, change management,
              and delivery at scale in APAC.
            </p>
          </div>
        </div>
      </header>

      {/* ── Filters + grid ────────────────────────────────────── */}
      <BlogFilters posts={posts} categories={categories} tags={tags} />
    </div>
  );
}
