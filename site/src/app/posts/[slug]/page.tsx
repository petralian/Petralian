import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { format, parseISO } from "date-fns";
import { getAllSlugs, getPost } from "@/lib/posts";
import { SITE_NAME } from "@/lib/constants";

// Static params for SSG
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Per-page metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPost(slug);
    return {
      title: post.title,
      description: post.seo_description || post.excerpt,
      openGraph: {
        title: post.title,
        description: post.seo_description || post.excerpt,
        type: "article",
        publishedTime: post.date,
        siteName: SITE_NAME,
        ...(post.featured_image && { images: [post.featured_image] }),
      },
    };
  } catch {
    return {};
  }
}

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
};

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPost(slug);
  } catch {
    notFound();
  }

  if (post.status !== "published") notFound();

  return (
    <div className="prose-container">
      <Link href="/posts" className="post-back">
        ← All articles
      </Link>

      <header className="post-header">
        <div className="post-meta">
          {post.category && (
            <>
              <span className="post-meta-category">{post.category}</span>
              <span className="post-meta-dot" aria-hidden>·</span>
            </>
          )}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="post-meta-dot" aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="post-title">{post.title}</h1>

        {post.excerpt && (
          <p className="post-excerpt">{post.excerpt}</p>
        )}
      </header>

      {post.featured_image && (
        <Image
          src={post.featured_image}
          alt={post.title}
          width={1200}
          height={630}
          className="post-featured-image"
          priority
        />
      )}

      <article className="prose prose-lg max-w-none">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              format: "md",
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeRaw,
                [rehypePrettyCode, prettyCodeOptions],
              ],
            },
          }}
        />
      </article>

      {post.tags.length > 0 && (
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {post.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.8125rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                color: "var(--color-accent)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
