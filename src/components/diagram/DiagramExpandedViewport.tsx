"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { useDiagramUi } from "@/components/diagram/DiagramUiContext";
import { computeContainFit, readDiagramRenderedSize, readLockDimensions } from "@/components/diagram/diagram-metrics";
import { DIAGRAM_VV_RESIZE_EVENT } from "@/components/diagram/diagram-visual-viewport";

type DiagramExpandedViewportProps = {
  children: ReactNode;
};

const TAP_MOVE_THRESHOLD_PX = 12;

type FitState = {
  scale: number;
  x: number;
  y: number;
  contentW: number;
  contentH: number;
};

/** Fullscreen pan/zoom — react-zoom-pan-pinch with computed contain + center on open. */
export default function DiagramExpandedViewport({ children }: DiagramExpandedViewportProps) {
  const { toggleExpanded } = useDiagramUi();
  const viewportRef = useRef<HTMLDivElement>(null);
  const rzpRef = useRef<ReactZoomPanPinchRef | null>(null);
  const fitRef = useRef<FitState | null>(null);
  const userAdjustedRef = useRef(false);
  const [fit, setFit] = useState<FitState | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchActiveRef = useRef(false);
  const activePointersRef = useRef(new Set<number>());
  const lastToggleRef = useRef(0);

  const applyFitToRzp = useCallback((ref: ReactZoomPanPinchRef, state: FitState) => {
    ref.setTransform(state.x, state.y, state.scale, 0);
  }, []);

  const runFit = useCallback(
    (force = false) => {
      if (!force && userAdjustedRef.current) return;

      const viewport = viewportRef.current;
      if (!viewport) return;

      const layer = viewport.querySelector<HTMLElement>(".diagram-figure__zoom-layer");
      let contentW = 0;
      let contentH = 0;

      const locked = readLockDimensions(viewport);
      if (locked.w > 0 && locked.h > 0) {
        contentW = locked.w;
        contentH = locked.h;
      } else if (layer) {
        const measured = readDiagramRenderedSize(viewport, layer);
        contentW = measured.width;
        contentH = measured.height;
      }

      const containerW = viewport.clientWidth;
      const containerH = viewport.clientHeight;
      const next = computeContainFit(containerW, containerH, contentW, contentH);

      if (!next) return;

      const state: FitState = {
        scale: next.scale,
        x: next.x,
        y: next.y,
        contentW,
        contentH,
      };

      fitRef.current = state;
      setFit(state);

      if (rzpRef.current) {
        applyFitToRzp(rzpRef.current, state);
      }
    },
    [applyFitToRzp],
  );

  useLayoutEffect(() => {
    userAdjustedRef.current = false;
    fitRef.current = null;
    let attempts = 0;

    const tick = () => {
      attempts += 1;
      const viewport = viewportRef.current;
      if (!viewport) return;

      const { w, h } = readLockDimensions(viewport);
      const layer = viewport.querySelector<HTMLElement>(".diagram-figure__zoom-layer");
      const measured =
        w > 0 && h > 0
          ? { width: w, height: h }
          : layer
            ? readDiagramRenderedSize(viewport, layer)
            : { width: 0, height: 0 };

      if (
        viewport.clientWidth > 0 &&
        viewport.clientHeight > 0 &&
        measured.width > 0 &&
        measured.height > 0
      ) {
        runFit(true);
        return;
      }

      if (attempts < 16) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [runFit]);

  useEffect(() => {
    const onVvResize = () => runFit(false);
    window.addEventListener(DIAGRAM_VV_RESIZE_EVENT, onVvResize);
    return () => window.removeEventListener(DIAGRAM_VV_RESIZE_EVENT, onVvResize);
  }, [runFit]);

  const onInit = useCallback(
    (ref: ReactZoomPanPinchRef) => {
      rzpRef.current = ref;
      if (fitRef.current) {
        applyFitToRzp(ref, fitRef.current);
      }
    },
    [applyFitToRzp],
  );

  const onZoom = useCallback((ref: ReactZoomPanPinchRef) => {
    const base = fitRef.current?.scale;
    if (base === undefined) return;
    if (Math.abs(ref.state.scale - base) > 0.04) {
      userAdjustedRef.current = true;
    }
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    activePointersRef.current.add(event.pointerId);

    if (activePointersRef.current.size >= 2) {
      pinchActiveRef.current = true;
      pointerStartRef.current = null;
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    activePointersRef.current.delete(event.pointerId);

    if (activePointersRef.current.size > 0) return;

    if (pinchActiveRef.current) {
      pinchActiveRef.current = false;
      pointerStartRef.current = null;
      return;
    }

    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (dx * dx + dy * dy > TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) return;

    const now = Date.now();
    if (now - lastToggleRef.current < 450) return;
    lastToggleRef.current = now;
    toggleExpanded();
  };

  const lockStyle =
    fit && fit.contentW > 0 && fit.contentH > 0
      ? { width: `${fit.contentW}px`, height: `${fit.contentH}px` }
      : undefined;

  return (
    <div
      ref={viewportRef}
      className="diagram-figure__viewport diagram-figure__viewport--expanded"
      role="button"
      tabIndex={0}
      aria-label="Diagram full screen — pinch or Command/Ctrl+scroll to zoom, drag to pan, tap to exit"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {fit ? (
        <TransformWrapper
          initialScale={fit.scale}
          initialPositionX={fit.x}
          initialPositionY={fit.y}
          minScale={Math.min(fit.scale, 0.25)}
          maxScale={4}
          limitToBounds
          centerOnInit={false}
          doubleClick={{ disabled: true }}
          wheel={{
            step: 0.12,
            activationKeys: (pressed) =>
              pressed.includes("Control") || pressed.includes("Meta"),
          }}
          pinch={{ step: 5 }}
          panning={{ velocityDisabled: true }}
          onInit={onInit}
          onZoom={onZoom}
        >
          <TransformComponent
            wrapperClass="diagram-figure__rzp-wrapper"
            contentClass="diagram-figure__rzp-content"
          >
            <div className="diagram-figure__zoom-layer" style={lockStyle}>
              {children}
            </div>
          </TransformComponent>
        </TransformWrapper>
      ) : (
        <div className="diagram-figure__zoom-layer diagram-figure__zoom-layer--loading">
          {children}
        </div>
      )}
    </div>
  );
}
