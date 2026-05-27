"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import Image from "next/image";
import { DiagramUiContext } from "@/components/diagram/DiagramUiContext";

type DiagramFigureChromeProps = {
  children: ReactNode;
};

function DiagramFooterChrome({
  hintId,
  hintText,
  expanded,
}: {
  hintId: string;
  hintText: string;
  expanded: boolean;
}) {
  return (
    <div
      className={`diagram-figure__footer-chrome${expanded ? " diagram-figure__floating-chrome--visible" : ""}`}
    >
      <p id={hintId} className="diagram-figure__hint diagram-figure__hint--chrome">
        {hintText}
      </p>
      <div className="diagram-figure__watermark" aria-hidden>
        <Image
          src="/images/petralian_blue.png"
          alt=""
          width={88}
          height={24}
          style={{ width: "auto", height: "auto" }}
          className="diagram-figure__watermark-img diagram-figure__watermark-img--light"
        />
        <Image
          src="/images/petralian_white.png"
          alt=""
          width={88}
          height={24}
          style={{ width: "auto", height: "auto" }}
          className="diagram-figure__watermark-img diagram-figure__watermark-img--dark"
        />
      </div>
    </div>
  );
}

/** Client chrome: full-screen toggle, watermark, hint. SVG stays in server-rendered children. */
export default function DiagramFigureChrome({ children }: DiagramFigureChromeProps) {
  const [expanded, setExpanded] = useState(false);
  const hintId = useId();

  const toggleExpanded = useCallback(() => {
    setExpanded((on) => !on);
  }, []);

  useEffect(() => {
    if (!expanded) return;

    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;

    /* Lock scroll without position:fixed — avoids jump when exiting fullscreen */
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const hintText = expanded
    ? "Pinch or ⌘/Ctrl+scroll to zoom · drag to pan · tap to exit · Esc"
    : "Pinch or ⌘/Ctrl+scroll to zoom · drag when zoomed · tap image for full screen";

  return (
    <DiagramUiContext.Provider value={{ expanded, toggleExpanded }}>
      <figure
        className={`diagram-figure${expanded ? " diagram-figure--expanded" : ""}`}
        aria-describedby={hintId}
      >
        <div className="diagram-figure__canvas-wrap">
          {children}
          <DiagramFooterChrome hintId={hintId} hintText={hintText} expanded={expanded} />
        </div>
      </figure>
    </DiagramUiContext.Provider>
  );
}
