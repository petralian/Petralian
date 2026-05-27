"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { useDiagramUi } from "@/components/diagram/DiagramUiContext";
import { computeContainFit, readLockDimensions } from "@/components/diagram/diagram-metrics";

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
  const [fit, setFit] = useState<FitState | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchActiveRef = useRef(false);
  const activePointersRef = useRef(new Set<number>());
  const lastToggleRef = useRef(0);
  const centeredRef = useRef(false);

  const measureAndFit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { w: contentW, h: contentH } = readLockDimensions(viewport);
    const containerW = viewport.clientWidth;
    const containerH = viewport.clientHeight;
    const next = computeContainFit(containerW, containerH, contentW, contentH);

    if (!next) return;

    setFit({
      scale: next.scale,
      x: next.x,
      y: next.y,
      contentW,
      contentH,
    });
  }, []);

  useLayoutEffect(() => {
    centeredRef.current = false;
    let attempts = 0;

    const tick = () => {
      attempts += 1;
      const viewport = viewportRef.current;
      if (!viewport) return;

      const { w, h } = readLockDimensions(viewport);
      if (
        viewport.clientWidth > 0 &&
        viewport.clientHeight > 0 &&
        w > 0 &&
        h > 0
      ) {
        measureAndFit();
        return;
      }

      if (attempts < 16) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [measureAndFit]);

  const applyCenteredFit = useCallback((ref: ReactZoomPanPinchRef, state: FitState) => {
    ref.setTransform(state.x, state.y, state.scale, 0);
    centeredRef.current = true;
  }, []);

  const onInit = useCallback(
    (ref: ReactZoomPanPinchRef) => {
      rzpRef.current = ref;
      if (fit && !centeredRef.current) {
        applyCenteredFit(ref, fit);
      }
    },
    [applyCenteredFit, fit],
  );

  useLayoutEffect(() => {
    if (fit && rzpRef.current && !centeredRef.current) {
      applyCenteredFit(rzpRef.current, fit);
    }
  }, [applyCenteredFit, fit]);

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
      aria-label="Diagram full screen — pinch or Command/Ctrl+scroll to zoom, drag to pan, tap to exit"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {fit ? (
        <TransformWrapper
          key={`${fit.contentW}x${fit.contentH}`}
          initialScale={fit.scale}
          initialPositionX={fit.x}
          initialPositionY={fit.y}
          minScale={fit.scale}
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
      ) : null}
    </div>
  );
}
