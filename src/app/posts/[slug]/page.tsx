import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { format, parseISO } from "date-fns";
import { getAllPosts, getPost } from "@/lib/posts";
import { getTopicUrl } from "@/lib/tag-slug";
import { SITE_NAME, SITE_URL, AUTHOR_NAME } from "@/lib/constants";
import SubscribeBox from "@/components/SubscribeBox";
import RelatedPosts from "@/components/RelatedPosts";
import Breadcrumbs from "@/components/Breadcrumbs";
import { postDiagramComponents } from "@/components/diagram/post-diagram-components";

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
    const postUrl = `${SITE_URL}/posts/${slug}`;
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
        modifiedTime: post.date,
        authors: [`${SITE_URL}/about`],
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
  const postUrl = `${SITE_URL}/posts/${post.slug}`;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": postUrl,
    headline: post.title,
    description: post.seo_description || post.excerpt,
    url: postUrl,
    datePublished: post.date,
    dateModified: post.date,
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
    ...(post.featured_image && { image: post.featured_image }),
    ...(post.tags.length > 0 && { keywords: post.tags.join(", ") }),
    ...(post.category && { articleSection: post.category }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
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

      <div className="article-body-wrap">
        <article className="prose prose-lg max-w-none">
          <MDXRemote
            source={post.content}
            components={postDiagramComponents}
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
        currentSeries={post.series}
        relatedPostSlugs={post.related_posts}
        allPosts={allPosts}
      />
    </>
  );
}