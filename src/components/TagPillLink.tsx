"use client";

import { useRouter } from "next/navigation";
import { getTopicUrl } from "@/lib/tag-slug";

interface TagPillLinkProps {
  tag: string;
  className: string;
}

export default function TagPillLink({ tag, className }: TagPillLinkProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(getTopicUrl(tag));
      }}
    >
      {tag}
    </button>
  );
}
