import type { ReactNode } from "react";

export default function HomePathRail({
  children,
  label,
  layout = "scroll",
}: {
  children: ReactNode;
  label: string;
  layout?: "scroll" | "cols-3";
}) {
  return (
    <div className="home-path-rail-wrap">
      <ul
        className={`home-path-rail home-path-rail--${layout}`}
        aria-label={label}
      >
        {children}
      </ul>
      {layout === "scroll" ? (
        <p className="home-path-rail-hint" aria-hidden="true">
          Scroll for more →
        </p>
      ) : null}
    </div>
  );
}
