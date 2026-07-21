import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";

const PATH_ACCENTS = [
  "#ff6a3d",
  "#3d9bff",
  "#8b5cf6",
  "#22c997",
] as const;

export default function HomePathCard({
  href,
  image,
  imageAlt,
  eyebrow,
  title,
  blurb,
  footer,
  index = 0,
  variant = "start",
}: {
  href: string;
  image?: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  blurb?: string;
  footer: string;
  index?: number;
  variant?: "start" | "series";
}) {
  const accent = PATH_ACCENTS[index % PATH_ACCENTS.length];

  return (
    <Link
      href={href}
      className={`home-path-card home-path-card--${variant}`}
      style={{ "--path-accent": accent } as CSSProperties}
    >
      <article className="home-path-card-inner">
        <div className="home-path-card-image-wrap">
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              fill
              loading="lazy"
              fetchPriority="low"
              quality={65}
              className="home-path-card-image"
              sizes="(max-width: 640px) 78vw, 320px"
            />
          ) : (
            <div className="home-path-card-image-placeholder" aria-hidden />
          )}
          <span className="home-path-card-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="home-path-card-body">
          <p className="home-path-card-eyebrow">{eyebrow}</p>
          <h3 className="home-path-card-title">{title}</h3>
          {blurb ? <p className="home-path-card-blurb">{blurb}</p> : null}
          <p className="home-path-card-footer">{footer}</p>
        </div>
      </article>
    </Link>
  );
}
