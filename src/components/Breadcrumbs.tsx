import Link from "next/link";
import { SITE_URL } from "@/lib/constants";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** `dark` for post hero; `light` for standard pages */
  variant?: "light" | "dark";
};

export default function Breadcrumbs({
  items,
  variant = "light",
}: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${SITE_URL}${item.href}` }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        className={`breadcrumbs breadcrumbs--${variant}`}
        aria-label="Breadcrumb"
      >
        <ol className="breadcrumbs__list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="breadcrumbs__item">
                {item.href && !isLast ? (
                  <Link href={item.href} className="breadcrumbs__link">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast ? "breadcrumbs__current" : "breadcrumbs__label"
                    }
                    {...(isLast && { "aria-current": "page" as const })}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span className="breadcrumbs__sep" aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
