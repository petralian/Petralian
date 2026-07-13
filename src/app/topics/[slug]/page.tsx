import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import TopicArchive from "@/components/TopicArchive";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";
import { getRelatedTags, getTagStats, topicIntro } from "@/lib/tag-stats";
import { getAllTopicSlugs, slugToTag } from "@/lib/tag-slug-server";
import { getTopicUrl } from "@/lib/tag-slug";

export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = slugToTag(slug);
  if (!tag) return {};

  const posts = getAllPosts().filter((p) => p.tags.includes(tag));
  const count = posts.length;
  const title = `${tag} articles`;
  const description = `${count} article${count === 1 ? "" : "s"} on ${tag} — enterprise programs, agent workflows, and delivery.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/topics/${slug}` },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/topics/${slug}`,
      siteName: SITE_NAME,
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = slugToTag(slug);
  if (!tag) notFound();

  const allPosts = getAllPosts();
  const tagStats = getTagStats(allPosts);
  const stat = tagStats.find((t) => t.tag === tag);
  if (!stat) notFound();

  const posts = stat.posts;
  const related = getRelatedTags(allPosts, tag);
  const intro = topicIntro(tag, stat.count);
  const topicUrl = `${SITE_URL}/topics/${slug}`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": topicUrl,
    name: `${tag} articles`,
    description: intro,
    url: topicUrl,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/posts/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="page-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Writing", href: "/posts" },
            { label: tag },
          ]}
        />
        <header className="blog-header">
          <h1 className="blog-header-title">{tag}</h1>
          <p className="blog-header-description">{intro}</p>
          {related.length > 0 && (
            <div className="topic-related">
              <span className="topic-related-label">Related topics</span>
              <div className="topic-related-pills">
                {related.map(({ tag: relatedTag }) => (
                  <Link
                    key={relatedTag}
                    href={getTopicUrl(relatedTag)}
                    className="topic-related-pill"
                  >
                    {relatedTag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        <Suspense
          fallback={
            <p className="blog-results-count" style={{ marginBottom: "2rem" }}>
              Loading articles…
            </p>
          }
        >
          <TopicArchive
            posts={posts}
            tagStats={tagStats}
            totalPostCount={allPosts.length}
            activeSlug={slug}
            tagName={tag}
          />
        </Suspense>
      </div>
    </>
  );
}
