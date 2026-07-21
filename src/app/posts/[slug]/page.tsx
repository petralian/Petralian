import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { format, parseISO } from "date-fns";
import { getAllSlugs, getAllPosts, getPost, getPostLastModified } from "@/lib/posts";
import { getTopicUrl } from "@/lib/tag-slug";
import FormatBadge from "@/components/FormatBadge";
import { SITE_NAME, SITE_URL, AUTHOR_NAME } from "@/lib/constants";
import { absoluteAssetUrl, extractFaqPairs } from "@/lib/seo";
import SubscribeBox from "@/components/SubscribeBox";
import RelatedPosts from "@/components/RelatedPosts";
import Breadcrumbs from "@/components/Breadcrumbs";
import PostOutline from "@/components/PostOutline";
import TaskListEnhancer from "@/components/TaskListEnhancer";
import { postDiagramComponents } from "@/components/diagram/post-diagram-components";
import { extractHeadings, buildOutlineNav, shouldShowOutline } from "@/lib/extract-headings";
import { rehypeHeadingIds } from "@/lib/rehype-heading-ids";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPost(slug);
    const postUrl = `${SITE_URL}/posts/${slug}`;
    const modified = getPostLastModified(slug, post.date).toISOString();
    const ogImage = absoluteAssetUrl(post.featured_image);
    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/about` }],
      keywords: post.tags.length > 0 ? post.tags : undefined,
      alternates: { canonical: postUrl },
      openGraph: {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        type: "article",
        url: postUrl,
        publishedTime: post.date,
        modifiedTime: modified,
        authors: [`${SITE_URL}/about`],
        siteName: SITE_NAME,
        ...(ogImage && { images: [ogImage] }),
      },
      twitter: {
        card: "summary_large_image",
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        ...(ogImage && { images: [ogImage] }),
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

  const allPosts = getAllPosts();
  const postUrl = `${SITE_URL}/posts/${post.slug}`;
  const modifiedIso = getPostLastModified(post.slug, post.date).toISOString();
  const heroUrl = absoluteAssetUrl(post.featured_image);
  const headings = extractHeadings(post.content);
  const navHeadings = buildOutlineNav(headings);
  const showOutline = shouldShowOutline(navHeadings);
  const faqPairs = extractFaqPairs(post.content);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": postUrl,
    headline: post.title,
    description: post.seo_description || post.excerpt,
    url: postUrl,
    datePublished: post.date,
    dateModified: modifiedIso,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(heroUrl && { image: heroUrl }),
    ...(post.tags.length > 0 && { keywords: post.tags.join(", ") }),
  };

  const faqSchema =
    faqPairs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqPairs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <section className="post-hero">
        <div className="post-hero-inner">
          <div className="post-hero-left">
            <Breadcrumbs
              variant="dark"
              items={[
                { label: "Home", href: "/" },
                { label: "Writing", href: "/posts" },
                ...(post.tags[0]
                  ? [
                    {
                      label: post.tags[0],
                      href: getTopicUrl(post.tags[0]),
                    },
                  ]
                  : []),
                { label: post.title },
              ]}
            />
            <h1 className="post-hero-title">{post.title}</h1>
            {post.format && (
              <div className="post-hero-format">
                <FormatBadge format={post.format} />
              </div>
            )}
            {post.best_for && (
              <p className="post-hero-best-for">
                <span className="post-hero-best-for-label">Best for</span>
                {post.best_for}
              </p>
            )}
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
                  <Link
                    key={tag}
                    href={getTopicUrl(tag)}
                    className="post-hero-tag"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {post.featured_image && (
            <div className="post-hero-right">
              <Image
                src={post.featured_image}
                alt={post.featured_image_alt || post.title}
                fill
                priority
                className="post-card-image"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </section>

      <div
        className={`article-body-wrap${showOutline ? " article-body-wrap--has-outline" : ""}`}
      >
        {showOutline && <PostOutline headings={navHeadings} />}
        <div className="article-body-main">
          <article className="prose prose-lg max-w-none">
            <MDXRemote
              source={post.content}
              components={postDiagramComponents}
              options={{
                mdxOptions: {
                  format: "md",
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeRaw, rehypeHeadingIds],
                },
              }}
            />
          </article>
          <TaskListEnhancer slug={slug} />
          <SubscribeBox />
        </div>
      </div>

      <RelatedPosts
        currentSlug={post.slug}
        currentTags={post.tags}
        currentCategory={post.category}
        currentSeries={post.series}
        relatedPostSlugs={post.related_posts}
        allPosts={allPosts}
      />
    </>
  );
}