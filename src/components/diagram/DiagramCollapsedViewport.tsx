"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import { useDiagramUi } from "@/components/diagram/DiagramUiContext";
import { clearLockDimensions, lockDiagramMetrics } from "@/components/diagram/diagram-metrics";

type DiagramCollapsedViewportProps = {
  children: ReactNode;
};

const TAP_MOVE_THRESHOLD_PX = 12;

function isZoomWheel(event: WheelEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

function getVisibleSvg(layer: HTMLElement): SVGSVGElement | null {
  for (const wrapper of layer.querySelectorAll<HTMLElement>(".diagram-figure__svg")) {
    if (wrapper.offsetWidth > 0 && wrapper.offsetHeight > 0) {
      const svg = wrapper.querySelector("svg");
      if (svg) return svg;
    }
  }
  return layer.querySelector("svg");
}

/** Collapsed: canvas height matches the diagram at column width. */
function fitViewportToDiagram(viewport: HTMLElement, layer: HTMLElement): void {
  const svgEl = getVisibleSvg(layer);
  if (!svgEl) return;

  const width = viewport.clientWidth;
  if (width <= 0) return;

  const viewBox = svgEl.viewBox?.baseVal;
  const intrinsicH = viewBox?.height > 0 ? viewBox.height : svgEl.height.baseVal.value;
  const intrinsicW = viewBox?.width > 0 ? viewBox.width : svgEl.width.baseVal.value;
  const renderedH =
    intrinsicW > 0 ? Math.ceil((width / intrinsicW) * intrinsicH) : Math.ceil(svgEl.getBoundingClientRect().height);

  clearLockDimensions(viewport);
  layer.style.width = "";
  layer.style.maxWidth = "";

  if (renderedH > 0) {
    viewport.style.height = `${renderedH}px`;
  }
}

/** Inline pan/zoom — @see https://github.com/timmywil/panzoom */
export default function DiagramCollapsedViewport({ children }: DiagramCollapsedViewportProps) {
  const { toggleExpanded } = useDiagramUi();
  const viewportRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number; scale: number } | null>(null);
  const activePointersRef = useRef(new Set<number>());
  const pinchActiveRef = useRef(false);
  const lastToggleRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const layer = layerRef.current;
    if (!viewport || !layer) return;

    let panzoom: PanzoomObject | null = null;
    let ro: ResizeObserver | null = null;

    const teardownPanzoom = () => {
      if (panzoom) {
        panzoom.destroy();
        panzoom = null;
      }
      layer.style.transform = "";
      layer.style.width = "";
      layer.style.maxWidth = "";
      activePointersRef.current.clear();
      pinchActiveRef.current = false;
      pointerStartRef.current = null;
    };

    panzoom = Panzoom(layer, {
      canvas: true,
      contain: "outside",
      panOnlyWhenZoomed: true,
      maxScale: 4,
      minScale: 1,
      startScale: 1,
      cursor: "grab",
      touchAction: "none",
    });

    const onWheel = (event: WheelEvent) => {
      if (!isZoomWheel(event)) return;
      event.preventDefault();
      panzoom?.zoomWithWheel(event);
    };

    const onPointerDown = (event: PointerEvent) => {
      activePointersRef.current.add(event.pointerId);

      if (activePointersRef.current.size >= 2) {
        pinchActiveRef.current = true;
        pointerStartRef.current = null;
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        scale: panzoom?.getScale() ?? 1,
      };
    };

    const onPointerUp = (event: PointerEvent) => {
      activePointersRef.current.delete(event.pointerId);

      if (activePointersRef.current.size > 0) return;

      if (pinchActiveRef.current) {
        pinchActiveRef.current = false;
        pointerStartRef.current = null;
        return;
      }

      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start || !panzoom) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (dx * dx + dy * dy > TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) return;

      const now = Date.now();
      if (now - lastToggleRef.current < 450) return;
      lastToggleRef.current = now;

      lockDiagramMetrics(viewport, layer, panzoom);
      toggleExpanded();
    };

    const onPanStart = () => viewport.classList.add("is-panning");
    const onPanEnd = () => viewport.classList.remove("is-panning");

    viewport.addEventListener("wheel", onWheel, { passive: false });
    layer.addEventListener("pointerdown", onPointerDown);
    layer.addEventListener("pointerup", onPointerUp);
    layer.addEventListener("pointercancel", onPointerUp);
    layer.addEventListener("panzoomstart", onPanStart);
    layer.addEventListener("panzoomend", onPanEnd);

    requestAnimationFrame(() => fitViewportToDiagram(viewport, layer));

    ro = new ResizeObserver(() => {
      panzoom?.reset({ animate: false });
      requestAnimationFrame(() => fitViewportToDiagram(viewport, layer));
    });
    ro.observe(viewport);

    return () => {
      ro.disconnect();
      viewport.removeEventListener("wheel", onWheel);
      layer.removeEventListener("pointerdown", onPointerDown);
      layer.removeEventListener("pointerup", onPointerUp);
      layer.removeEventListener("pointercancel", onPointerUp);
      layer.removeEventListener("panzoomstart", onPanStart);
      layer.removeEventListener("panzoomend", onPanEnd);
      teardownPanzoom();
    };
  }, [toggleExpanded]);

  return (
    <div
      ref={viewportRef}
      className="diagram-figure__viewport"
      aria-label="Diagram — tap for full screen, pinch or Command/Ctrl+scroll to zoom"
    >
      <div ref={layerRef} className="diagram-figure__zoom-layer">
        {children}
      </div>
    </div>
  );
}
