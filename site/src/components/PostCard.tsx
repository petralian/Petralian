import Link from "next/link";
import { format, parseISO } from "date-fns";
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
  return (
    <Link href={`/posts/${post.slug}`} className={`post-card ${featured ? "post-card--featured" : ""}`}>
      <article>
        <div className="post-card-meta">
          {post.category && (
            <span className="post-card-category">{post.category}</span>
          )}
          <span className="post-card-dot" aria-hidden>·</span>
          <time dateTime={post.date} className="post-card-date">
            {formatDate(post.date)}
          </time>
          <span className="post-card-dot" aria-hidden>·</span>
          <span className="post-card-reading-time">{post.readingTime}</span>
        </div>

        <h2 className={featured ? "post-card-title--featured" : "post-card-title"}>
          {post.title}
        </h2>
      </article>
    </Link>
  );
}
