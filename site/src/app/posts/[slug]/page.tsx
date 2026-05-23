import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { format, parseISO } from "date-fns";
import { getAllPosts, getPost } from "@/lib/posts";
import { SITE_NAME } from "@/lib/constants";
import SubscribeBox from "@/components/SubscribeBox";
import RelatedPosts from "@/components/RelatedPosts";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

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

  const allPosts = getAllPosts();

  return (
    <>
      <section className="post-hero">
        <div className="post-hero-inner">
          <div className="post-hero-left">
            <Link href="/posts" className="post-hero-back">
              &larr; All articles
            </Link>
            {post.category && (
              <p className="post-hero-eyebrow">{post.category}</p>
            )}
            <h1 className="post-hero-title">{post.title}</h1>
            {post.excerpt && (
              <p className="post-hero-excerpt">{post.excerpt}</p>
            )}
            <div className="post-hero-meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="post-hero-meta-sep">&middot;</span>
              <span>{post.readingTime}</span>
            </div>
            {post.tags.length > 0 && (
              <div className="post-hero-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-hero-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
          {post.featured_image && (
            <div className="post-hero-right">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                priority
                className="post-card-image"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </section>

      <div className="article-body-wrap">
        <article className="prose prose-lg max-w-none">
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                format: "md",
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeRaw],
              },
            }}
          />
        </article>
        <SubscribeBox />
      </div>

      <RelatedPosts
        currentSlug={post.slug}
        currentTags={post.tags}
        currentCategory={post.category}
        allPosts={allPosts}
      />
    </>
  );
}