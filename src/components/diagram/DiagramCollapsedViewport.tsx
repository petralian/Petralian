"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDiagramUi } from "@/components/diagram/DiagramUiContext";
import {
  clearLockDimensions,
  computeContainFit,
  DIAGRAM_COLLAPSED_MAX_H,
  lockDiagramMetrics,
  readDiagramRenderedSize,
} from "@/components/diagram/diagram-metrics";

type DiagramCollapsedViewportProps = {
  children: ReactNode;
};

const TAP_MOVE_THRESHOLD_PX = 12;

/**
 * Collapsed inline diagram: natural Kroki SVG at column width.
 * No panzoom here — SSR paint matches client (avoids flash-then-break).
 * Tap opens fullscreen for pinch/zoom.
 */
function fitViewportToDiagram(viewport: HTMLElement, layer: HTMLElement): void {
  const containerW = viewport.clientWidth;
  if (containerW <= 0) return;

  const { width: contentW, height: contentH } = readDiagramRenderedSize(viewport, layer);

  clearLockDimensions(viewport);
  layer.style.width = "";
  layer.style.maxWidth = "";
  layer.style.height = "";
  layer.style.transform = "";

  if (contentH <= 0 || contentW <= 0) return;

  const needsCap = contentH > DIAGRAM_COLLAPSED_MAX_H;
  viewport.classList.toggle("diagram-figure__viewport--capped", needsCap);

  if (needsCap) {
    viewport.style.height = `${DIAGRAM_COLLAPSED_MAX_H}px`;
    const fit = computeContainFit(containerW, DIAGRAM_COLLAPSED_MAX_H, contentW, contentH);
    if (fit && fit.scale < 1) {
      layer.style.transform = `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`;
      layer.style.transformOrigin = "0 0";
    }
    return;
  }

  viewport.style.height = `${contentH}px`;
}

export default function DiagramCollapsedViewport({ children }: DiagramCollapsedViewportProps) {
  const { toggleExpanded } = useDiagramUi();
  const viewportRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastToggleRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const layer = layerRef.current;
    if (!viewport || !layer) return;

    let ro: ResizeObserver | null = null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (dx * dx + dy * dy > TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) return;

      const now = Date.now();
      if (now - lastToggleRef.current < 450) return;
      lastToggleRef.current = now;

      lockDiagramMetrics(viewport, layer, null);
      toggleExpanded();
    };

    layer.addEventListener("pointerdown", onPointerDown);
    layer.addEventListener("pointerup", onPointerUp);
    layer.addEventListener("pointercancel", onPointerUp);

    requestAnimationFrame(() => fitViewportToDiagram(viewport, layer));

    ro = new ResizeObserver(() => {
      requestAnimationFrame(() => fitViewportToDiagram(viewport, layer));
    });
    ro.observe(viewport);

    const themeObserver = new MutationObserver(() => {
      requestAnimationFrame(() => fitViewportToDiagram(viewport, layer));
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      ro.disconnect();
      themeObserver.disconnect();
      layer.removeEventListener("pointerdown", onPointerDown);
      layer.removeEventListener("pointerup", onPointerUp);
      layer.removeEventListener("pointercancel", onPointerUp);
      layer.style.transform = "";
      viewport.classList.remove("diagram-figure__viewport--capped");
      viewport.style.height = "";
    };
  }, [toggleExpanded]);

  return (
    <div
      ref={viewportRef}
      className="diagram-figure__viewport"
      role="button"
      tabIndex={0}
      aria-label="Diagram — tap for full screen"
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        const viewport = viewportRef.current;
        const layer = layerRef.current;
        if (viewport && layer) lockDiagramMetrics(viewport, layer, null);
        toggleExpanded();
      }}
    >
      <div ref={layerRef} className="diagram-figure__zoom-layer">
        {children}
      </div>
    </div>
  );
}
