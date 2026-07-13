import type { MetadataRoute } from "next";
import { getAllPosts, getPostLastModified } from "@/lib/posts";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: getPostLastModified(post.slug, post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/lost-in-space`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...postEntries,
  ];
}
