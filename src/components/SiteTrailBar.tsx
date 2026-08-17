import Breadcrumbs, { type BreadcrumbItem } from "@/components/Breadcrumbs";

type SiteTrailBarProps = {
  items: BreadcrumbItem[];
  /** Long post titles may wrap; short trails stay on one line */
  fullWidth?: boolean;
};

/** Shared breadcrumb strip — same markup/styles as post hero trail */
export default function SiteTrailBar({ items, fullWidth = false }: SiteTrailBarProps) {
  if (items.length === 0) return null;

  return (
    <div className="site-trail-bar">
      <div className="site-trail-bar-inner">
        <Breadcrumbs variant="dark" fullWidth={fullWidth} items={items} />
      </div>
    </div>
  );
}
