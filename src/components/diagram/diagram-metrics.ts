import type { PanzoomObject } from "@panzoom/panzoom";

export const DIAGRAM_FIT_PAD_PX = 20;

export function parseCssPx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function lockHost(viewport: HTMLElement): HTMLElement {
  return viewport.closest<HTMLElement>(".diagram-figure__canvas-wrap") ?? viewport;
}

export function lockDiagramMetrics(
  viewport: HTMLElement,
  layer: HTMLElement,
  panzoom: PanzoomObject | null,
): void {
  panzoom?.reset({ animate: false });
  layer.style.transform = "";

  const w = layer.offsetWidth;
  const h = layer.offsetHeight;
  const host = lockHost(viewport);
  if (w > 0 && h > 0) {
    host.style.setProperty("--diagram-lock-w", `${Math.round(w)}px`);
    host.style.setProperty("--diagram-lock-h", `${Math.round(h)}px`);
  }
  viewport.style.height = "";
}

export function readLockDimensions(viewport: HTMLElement): { w: number; h: number } {
  const host = lockHost(viewport);
  const w = parseCssPx(host.style.getPropertyValue("--diagram-lock-w"));
  const h = parseCssPx(host.style.getPropertyValue("--diagram-lock-h"));
  return { w, h };
}

export function clearLockDimensions(viewport: HTMLElement): void {
  const host = lockHost(viewport);
  host.style.removeProperty("--diagram-lock-w");
  host.style.removeProperty("--diagram-lock-h");
}

/** Contain-fit scale and top-left position to center content in a container. */
export function computeContainFit(
  containerW: number,
  containerH: number,
  contentW: number,
  contentH: number,
  pad = DIAGRAM_FIT_PAD_PX,
): { scale: number; x: number; y: number } | null {
  if (containerW <= 0 || containerH <= 0 || contentW <= 0 || contentH <= 0) {
    return null;
  }

  const scale = Math.min(
    (containerW - pad * 2) / contentW,
    (containerH - pad * 2) / contentH,
  );

  if (!Number.isFinite(scale) || scale <= 0) return null;

  return {
    scale,
    x: (containerW - contentW * scale) / 2,
    y: (containerH - contentH * scale) / 2,
  };
}
