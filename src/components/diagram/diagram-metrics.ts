import type { PanzoomObject } from "@panzoom/panzoom";

export const DIAGRAM_FIT_PAD_PX = 20;

/** Max inline (collapsed) diagram viewport height before contain-fit scales down. */
export const DIAGRAM_COLLAPSED_MAX_H = 400;

export function parseCssPx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function lockHost(viewport: HTMLElement): HTMLElement {
  return viewport.closest<HTMLElement>(".diagram-figure__canvas-wrap") ?? viewport;
}

/** Padding around trimmed SVG content bounds. */
export const SVG_TRIM_PAD_PX = 12;

export function trimSvgToContentBounds(
  svg: SVGSVGElement,
  pad = SVG_TRIM_PAD_PX,
): boolean {
  try {
    stripSvgCanvasBackground(svg);

    const bbox = svg.getBBox();
    if (!Number.isFinite(bbox.width) || !Number.isFinite(bbox.height)) return false;
    if (bbox.width <= 0 || bbox.height <= 0) return false;

    const x = bbox.x - pad;
    const y = bbox.y - pad;
    const w = bbox.width + pad * 2;
    const h = bbox.height + pad * 2;

    svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";
    return true;
  } catch {
    return false;
  }
}

/** Remove Kroki full-canvas background rects (cause white slab / invert halo). */
export function stripSvgCanvasBackground(svg: SVGSVGElement): void {
  const vb = svg.viewBox?.baseVal;
  const vw =
    vb && vb.width > 0
      ? vb.width
      : parseFloat(svg.getAttribute("width") || "0");
  const vh =
    vb && vb.height > 0
      ? vb.height
      : parseFloat(svg.getAttribute("height") || "0");
  if (!vw || !vh) return;

  for (const rect of svg.querySelectorAll("rect")) {
    const w = parseFloat(rect.getAttribute("width") || "0");
    const h = parseFloat(rect.getAttribute("height") || "0");
    const fill = rect.getAttribute("fill") || "";
    const isFullCanvas = w >= vw * 0.85 && h >= vh * 0.85;
    const isCanvas = isFullCanvas && (isCanvasFill(fill) || w >= vw * 0.98);
    if (isCanvas) rect.remove();
  }
}

function isCanvasFill(fill: string): boolean {
  const f = fill.toLowerCase().trim();
  if (!f || f === "none") return true;
  return (
    f === "white" ||
    f === "#ffffff" ||
    f === "#fff" ||
    f === "#f5f7fa" ||
    f === "#fefefe" ||
    f === "#fafafa" ||
    f === "#efefee"
  );
}

function getVisibleSvg(layer: HTMLElement): SVGSVGElement | null {
  for (const wrapper of layer.querySelectorAll<HTMLElement>(".diagram-figure__svg")) {
    if (wrapper.offsetWidth <= 0 && wrapper.offsetHeight <= 0) continue;
    const svg =
      wrapper.querySelector<SVGSVGElement>(".diagram-figure__svg-invert svg") ??
      wrapper.querySelector<SVGSVGElement>("svg");
    if (svg) return svg;
  }
  return layer.querySelector("svg");
}

/** Strip full-canvas rects only — never mutate viewBox (breaks colors/layout after hydration). */
export function stripDiagramCanvasRects(layer: HTMLElement): void {
  const svg = getVisibleSvg(layer);
  if (svg) stripSvgCanvasBackground(svg);
}

/** @deprecated Client rect strip breaks invert pipeline; server-only prepareDarkSvgForInvert handles canvas. */
export function trimDiagramSvgs(layer: HTMLElement): void {
  stripDiagramCanvasRects(layer);
}

/** Measured paint size of the visible diagram (after layout). */
export function measureDiagramPaintSize(
  viewport: HTMLElement,
  layer: HTMLElement,
): { width: number; height: number } {
  const columnW = viewport.clientWidth;
  const svgEl = getVisibleSvg(layer);
  if (!svgEl || columnW <= 0) {
    return { width: layer.offsetWidth, height: layer.offsetHeight };
  }

  const rect = svgEl.getBoundingClientRect();
  if (rect.height > 0) {
    return { width: columnW, height: Math.ceil(rect.height) };
  }

  return readDiagramRenderedSize(viewport, layer);
}

/** Intrinsic rendered size at column width (ignores panzoom / CSS scale). */
export function readDiagramRenderedSize(
  viewport: HTMLElement,
  layer: HTMLElement,
): { width: number; height: number } {
  const columnW = viewport.clientWidth;
  const svgEl = getVisibleSvg(layer);
  if (!svgEl || columnW <= 0) {
    return { width: layer.offsetWidth, height: layer.offsetHeight };
  }

  const viewBox = svgEl.viewBox?.baseVal;
  const intrinsicH = viewBox?.height > 0 ? viewBox.height : svgEl.height.baseVal.value;
  const intrinsicW = viewBox?.width > 0 ? viewBox.width : svgEl.width.baseVal.value;
  const renderedH =
    intrinsicW > 0
      ? Math.ceil((columnW / intrinsicW) * intrinsicH)
      : Math.ceil(svgEl.getBoundingClientRect().height);

  return { width: columnW, height: renderedH };
}

export function lockDiagramMetrics(
  viewport: HTMLElement,
  layer: HTMLElement,
  panzoom: PanzoomObject | null,
): void {
  panzoom?.reset({ animate: false });
  layer.style.transform = "";

  const { width: w, height: h } = readDiagramRenderedSize(viewport, layer);
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
