import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { SITE_URL } from "@/lib/constants";
import { getTopicUrl } from "@/lib/tag-slug";

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

  if (tag) {
    permanentRedirect(getTopicUrl(tag));
  }

  return null;
}
