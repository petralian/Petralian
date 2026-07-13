import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import TagPillLink from "@/components/TagPillLink";
import FormatBadge from "@/components/FormatBadge";
import type { PostMeta } from "@/lib/posts";

interface PostCardProps {
  post: PostMeta;
  featured?: boolean;
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const hasImage = Boolean(post.featured_image);
  return (
    <Link href={`/posts/${post.slug}`} className="post-card">
      <article>
        {hasImage ? (
          <div className="post-card-image-wrap">
            <Image
              src={post.featured_image!}
              alt={post.title}
              fill
              loading="lazy"
              fetchPriority="low"
              quality={65}
              className="post-card-image"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder" />
        )}

        <div className="post-card-body">
          <div className="post-card-meta">
            <div className="post-card-meta-left">
              {post.format ? (
                <FormatBadge format={post.format} className="post-card-format" />
              ) : post.tags[0] ? (
                <TagPillLink tag={post.tags[0]} className="post-card-topic" />
              ) : (
                <span />
              )}
            </div>
            <time dateTime={post.date} className="post-card-date">
              {formatDate(post.date)}
            </time>
          </div>

          <h2 className={featured ? "post-card-title--featured" : "post-card-title"}>
            {post.title}
          </h2>

          {post.best_for && (
            <p className="post-card-best-for">
              <span className="post-card-best-for-label">Best for</span>
              {post.best_for}
            </p>
          )}

          {post.excerpt && (
            <p className="post-card-excerpt">{post.excerpt}</p>
          )}

          {post.tags.length > 0 && (
            <div className="post-card-tags">
              {post.tags.slice(0, 3).map((tag) => (
                <TagPillLink key={tag} tag={tag} className="post-card-tag" />
              ))}
            </div>
          )}

          <span className="post-card-read-more">Continue reading →</span>
        </div>
      </article>
    </Link>
  );
}
