"use client";

import type { PostFormat } from "@/lib/post-format";
import { FORMAT_ORDER, POST_FORMATS } from "@/lib/post-format";

export type FormatFilterValue = PostFormat | "all";

interface FormatFilterProps {
  value: FormatFilterValue;
  counts: Record<PostFormat, number>;
  total: number;
  onChange: (value: FormatFilterValue) => void;
}

function FilterIcon({ format }: { format: PostFormat }) {
  if (format === "strategic") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8l3 6H9l3-6z" fill="currentColor" />
      </svg>
    );
  }
  if (format === "hands-on") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14.7 6.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.1 1.1M4 20l4-1 9.5-9.5a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0L5 16.5 4 20z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="14" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="7" y="4" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function FormatFilter({
  value,
  counts,
  total,
  onChange,
}: FormatFilterProps) {
  return (
    <div className="format-filter" role="group" aria-label="Filter by article format">
      <div className="blog-filter-section-header">
        <p className="blog-filter-section-label">Browse by format</p>
      </div>
      <div className="format-filter-pills">
        <button
          type="button"
          className={`format-filter-pill format-filter-pill--all${value === "all" ? " format-filter-pill--active" : ""}`}
          onClick={() => onChange("all")}
          aria-pressed={value === "all"}
        >
          All
          <span className="format-filter-pill-count">{total}</span>
        </button>
        {FORMAT_ORDER.map((format) => {
          const meta = POST_FORMATS[format];
          return (
            <button
              key={format}
              type="button"
              className={`format-filter-pill format-filter-pill--${format}${value === format ? " format-filter-pill--active" : ""}`}
              onClick={() => onChange(format)}
              aria-pressed={value === format}
              title={meta.description}
            >
              <FilterIcon format={format} />
              {meta.label}
              <span className="format-filter-pill-count">{counts[format]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
