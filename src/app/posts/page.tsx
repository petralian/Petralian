import type { Metadata } from "next";
import BlogFilters from "@/components/BlogFilters";
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/posts";
import writingContent from "../../../content/pages/writing.json";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Insights on AI, digital transformation, and the work that moves organizations forward.",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="page-container">
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

        <div className="blog-topic-row">
          {writingContent.topic_cards.map((card) => (
            <div key={card.title} className={`blog-topic-card blog-topic-card--${card.style}`}>
              <p className="blog-topic-title">{card.title}</p>
              <p className="blog-topic-desc">
                {card.description.split("\n").map((line, k, arr) => (
                  <span key={k}>
                    {line}
                    {k < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </header>

      {/* ── Filters + grid ────────────────────────────────────── */}
      <BlogFilters posts={posts} categories={categories} tags={tags} initialTag={tag} />
    </div>
  );
}
