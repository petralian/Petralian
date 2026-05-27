import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import D2Diagram from "@/components/d2/D2Diagram";

export const metadata = {
  title: "D2 diagram preview",
  robots: { index: false, follow: false },
};

const CHART = readFileSync(
  join(process.cwd(), "content/diagrams/snippets/four-tier-memory.d2"),
  "utf8",
);

export default function DiagramComparePage() {
  return (
    <>
      <section className="post-hero">
        <div className="post-hero-inner">
          <div className="post-hero-left">
            <Link href="/posts" className="post-hero-back">
              &larr; Back to posts
            </Link>
            <p className="post-hero-eyebrow">Internal preview</p>
            <h1 className="post-hero-title">D2 diagram renderer</h1>
            <p className="post-hero-excerpt">
              Same 720px article column, pinch/zoom, light/dark SVG pair, and Petralian
              watermark as live posts.
            </p>
          </div>
        </div>
      </section>

      <div className="article-body-wrap">
        <article className="prose prose-lg max-w-none">
          <D2Diagram chart={CHART} />
        </article>
      </div>
    </>
  );
}
