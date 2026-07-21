import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";
import { topicIntro } from "@/lib/tag-stats";
import { getTopicSlugsFromCatalog } from "@/lib/topic-catalog";
import { slugToTag } from "@/lib/tag-slug-server";

export const revalidate = 3600;

export function generateStaticParams() {
  return getTopicSlugsFromCatalog().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = slugToTag(slug);
  if (!tag) return {};

  const count = getAllPosts().filter((p) => p.tags.includes(tag)).length;
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

  const posts = getAllPosts().filter((p) => p.tags.includes(tag));
  if (posts.length === 0) notFound();

  const intro = topicIntro(tag, posts.length);
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
    />
  );
}
