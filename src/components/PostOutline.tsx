"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { HeadingEntry } from "@/lib/extract-headings";
import { OUTLINE_VISIBLE_MAX } from "@/lib/extract-headings";

interface PostOutlineProps {
  headings: HeadingEntry[];
}

/** Matches `--header-offset` / `.prose h2` scroll-margin-top. */
const SCROLL_SPY_ROOT_MARGIN = "-88px 0px -60% 0px";

function scrollToHeading(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

function scrollActiveLinkIntoNav(
  nav: HTMLElement | null,
  link: HTMLAnchorElement | null,
): void {
  if (!link || !nav) return;
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
    link.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

export default function PostOutline({ headings }: PostOutlineProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const drawerId = useId();
  const desktopNavRef = useRef<HTMLElement>(null);
  const drawerNavRef = useRef<HTMLElement>(null);
  const desktopActiveLinkRef = useRef<HTMLAnchorElement | null>(null);
  const drawerActiveLinkRef = useRef<HTMLAnchorElement | null>(null);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const headingIds = headings.map((h) => h.id);

  useEffect(() => {
    const elements = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const intersecting = new Map<string, IntersectionObserverEntry>();

    const pickActive = () => {
      if (intersecting.size > 0) {
        let bestId = elements[0].id;
        let bestTop = Infinity;
        for (const [id, entry] of intersecting) {
          const top = entry.boundingClientRect.top;
          if (top < bestTop) {
            bestTop = top;
            bestId = id;
          }
        }
        setActiveId(bestId);
        return;
      }

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      if (nearBottom) {
        setActiveId(headingIds[headingIds.length - 1]);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.set(entry.target.id, entry);
          } else {
            intersecting.delete(entry.target.id);
          }
        }
        pickActive();
      },
      { rootMargin: SCROLL_SPY_ROOT_MARGIN, threshold: [0, 0.25, 0.5, 1] },
    );

    for (const el of elements) observer.observe(el);

    const onScroll = () => pickActive();
    window.addEventListener("scroll", onScroll, { passive: true });

    pickActive();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [headingIds]);

  useEffect(() => {
    scrollActiveLinkIntoNav(desktopNavRef.current, desktopActiveLinkRef.current);
    scrollActiveLinkIntoNav(drawerNavRef.current, drawerActiveLinkRef.current);
  }, [activeId, drawerOpen, showAll]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  const handleNav = (id: string) => {
    scrollToHeading(id);
    closeDrawer();
  };

  const overflowCount = Math.max(0, headings.length - OUTLINE_VISIBLE_MAX);
  const visibleHeadings =
    showAll || overflowCount === 0
      ? headings
      : headings.slice(0, OUTLINE_VISIBLE_MAX);

  const renderNavList = (variant: "desktop" | "drawer") => (
    <ol className="post-outline-list">
      {visibleHeadings.map((heading) => {
        const isActive = activeId === heading.id;
        return (
          <li
            key={heading.id}
            className={`post-outline-item${isActive ? " post-outline-item--active" : ""}`}
          >
            <a
              href={`#${heading.id}`}
              className="post-outline-link"
              title={heading.text}
              ref={
                isActive
                  ? variant === "desktop"
                    ? desktopActiveLinkRef
                    : drawerActiveLinkRef
                  : undefined
              }
              onClick={(e) => {
                e.preventDefault();
                handleNav(heading.id);
              }}
              aria-current={isActive ? "location" : undefined}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
      {overflowCount > 0 && !showAll && (
        <li className="post-outline-item post-outline-item--more">
          <button
            type="button"
            className="post-outline-more-btn"
            onClick={() => setShowAll(true)}
          >
            +{overflowCount} more
          </button>
        </li>
      )}
    </ol>
  );

  return (
    <div className="post-outline-root">
      <aside className="post-outline post-outline--desktop" aria-label="On this page">
        <p className="post-outline-label">On this page</p>
        <nav ref={desktopNavRef}>{renderNavList("desktop")}</nav>
      </aside>

      <div className="post-outline-mobile-bar">
        <button
          type="button"
          className="post-outline-mobile-trigger"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls={drawerId}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h10M4 18h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          On this page
          <span className="post-outline-mobile-count">{headings.length}</span>
        </button>
      </div>

      <div
        className={`post-outline-drawer${drawerOpen ? " post-outline-drawer--open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          className="post-outline-drawer-backdrop"
          onClick={closeDrawer}
          aria-label="Close section navigation"
          tabIndex={drawerOpen ? 0 : -1}
        />
        <div
          id={drawerId}
          className="post-outline-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Article sections"
        >
          <div className="post-outline-drawer-header">
            <p className="post-outline-label">On this page</p>
            <button
              type="button"
              className="post-outline-drawer-close"
              onClick={closeDrawer}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <nav className="post-outline-drawer-nav" ref={drawerNavRef}>
            {renderNavList("drawer")}
          </nav>
        </div>
      </div>
    </div>
  );
}
