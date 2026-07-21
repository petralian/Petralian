import type { Metadata } from "next";
import type { PostMeta } from "@/lib/posts";
import type { SeriesHub } from "@/lib/series-hubs";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { absoluteAssetUrl } from "@/lib/seo";

export interface HomeSeoContent {
  seo_title: string;
  seo_description: string;
  seo_keywords?: string[];
  og_image?: string;
  start_here_heading?: string;
  series_heading?: string;
}

export function buildHomeMetadata(content: HomeSeoContent): Metadata {
  const ogImage = absoluteAssetUrl(
    content.og_image ?? "/images/nathan-petralia.jpg"
  );

  return {
    title: content.seo_title,
    description: content.seo_description,
    keywords: content.seo_keywords,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: content.seo_title,
      description: content.seo_description,
      type: "website",
      url: SITE_URL,
      siteName: SITE_NAME,
      ...(ogImage && { images: [{ url: ogImage, alt: content.seo_title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo_title,
      description: content.seo_description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

function postBlurb(post: PostMeta): string {
  return post.best_for || post.seo_description || post.excerpt;
}

function postListItem(post: PostMeta, position: number) {
  return {
    "@type": "ListItem" as const,
    position,
    name: post.title,
    url: `${SITE_URL}/posts/${post.slug}`,
    description: postBlurb(post),
  };
}

/** WebPage + ItemLists for Start here and auto-discovered series hubs. */
export function buildHomePageSchema({
  content,
  startHere,
  seriesHubs,
}: {
  content: HomeSeoContent;
  startHere: PostMeta[];
  seriesHubs: SeriesHub[];
}) {
  const startItems = startHere.map((post, index) =>
    postListItem(post, index + 1)
  );
  const seriesItems = seriesHubs.map(({ series, hub }, index) => ({
    "@type": "ListItem" as const,
    position: index + 1,
    name: series,
    url: `${SITE_URL}/posts/${hub.slug}`,
    description: hub.best_for || hub.seo_description || hub.excerpt,
  }));

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: content.seo_title,
      description: content.seo_description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#person` },
      author: { "@id": `${SITE_URL}/#person` },
      inLanguage: "en",
      ...(startItems.length > 0 && {
        mainEntity: {
          "@type": "ItemList",
          name: content.start_here_heading ?? "Start here",
          itemListElement: startItems,
        },
      }),
    },
  ];

  if (seriesItems.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${SITE_URL}/#reading-paths`,
      name: content.series_heading ?? "Reading paths",
      description:
        "Multi-part guides on Cursor, external memory, and agent workflows.",
      itemListElement: seriesItems,
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
