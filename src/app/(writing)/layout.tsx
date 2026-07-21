import WritingBrowse from "@/components/WritingBrowse";
import { getAllPosts } from "@/lib/posts";
import { buildTagSlugMap } from "@/lib/topic-catalog";
import writingContent from "../../../content/pages/writing.json";

export const revalidate = 3600;

export default function WritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allPosts = getAllPosts();
  const tagSlugMap = buildTagSlugMap();

  return (
    <>
      <div className="page-container page-container--writing">
        <WritingBrowse
          allPosts={allPosts}
          tagSlugMap={tagSlugMap}
          writingHeader={writingContent}
        />
      </div>
      {children}
    </>
  );
}
