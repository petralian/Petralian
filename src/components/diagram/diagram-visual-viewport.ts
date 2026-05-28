/** Sync CSS vars for fullscreen overlay to match mobile browser visual viewport. */
export const DIAGRAM_VV_RESIZE_EVENT = "diagram-vv-resize";

export function syncDiagramVisualViewportVars(
  root: HTMLElement = document.documentElement,
): void {
  const vv = window.visualViewport;
  const height = vv?.height ?? window.innerHeight;
  const top = vv?.offsetTop ?? 0;
  root.style.setProperty("--diagram-vv-height", `${height}px`);
  root.style.setProperty("--diagram-vv-top", `${top}px`);
}

export function clearDiagramVisualViewportVars(
  root: HTMLElement = document.documentElement,
): void {
  root.style.removeProperty("--diagram-vv-height");
  root.style.removeProperty("--diagram-vv-top");
}

/** Subscribe while fullscreen; clears vars on cleanup. */
export function subscribeDiagramVisualViewport(
  onResize?: () => void,
): () => void {
  const sync = () => {
    syncDiagramVisualViewportVars();
    onResize?.();
    window.dispatchEvent(new CustomEvent(DIAGRAM_VV_RESIZE_EVENT));
  };

  sync();

  const vv = window.visualViewport;
  vv?.addEventListener("resize", sync);
  vv?.addEventListener("scroll", sync);
  window.addEventListener("resize", sync);

  return () => {
    vv?.removeEventListener("resize", sync);
    vv?.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
    clearDiagramVisualViewportVars();
  };
}
