import Breadcrumbs, { type BreadcrumbItem } from "@/components/Breadcrumbs";

type SiteTrailBarProps = {
  items: BreadcrumbItem[];
  /** Long post titles may wrap; short trails stay on one line */
  fullWidth?: boolean;
};

/** Shared breadcrumb row — no band/bg; inherits page surface */
export default function SiteTrailBar({ items, fullWidth = false }: SiteTrailBarProps) {
  if (items.length === 0) return null;

  return (
    <div className="site-trail-bar">
      <div className="site-trail-bar-inner">
        <Breadcrumbs fullWidth={fullWidth} items={items} />
      </div>
    </div>
  );
}
