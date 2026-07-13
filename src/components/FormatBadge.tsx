import type { PostFormat } from "@/lib/post-format";
import { getFormatMeta } from "@/lib/post-format";

interface FormatBadgeProps {
  format: PostFormat;
  /** Show full label ("Strategic") vs short ("Strategy") */
  variant?: "full" | "short";
  className?: string;
}

function FormatIcon({ format }: { format: PostFormat }) {
  if (format === "strategic") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 3v3M12 18v3M3 12h3M18 12h3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M12 8l3 6H9l3-6z" fill="currentColor" />
      </svg>
    );
  }
  if (format === "hands-on") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="14" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="7" y="4" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function FormatBadge({
  format,
  variant = "short",
  className = "",
}: FormatBadgeProps) {
  const meta = getFormatMeta(format);
  if (!meta) return null;

  return (
    <span
      className={`format-badge format-badge--${format} ${className}`.trim()}
      title={meta.description}
    >
      <FormatIcon format={format} />
      <span>{variant === "full" ? meta.label : meta.shortLabel}</span>
    </span>
  );
}
