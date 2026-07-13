/**
 * Petralian D2 — minimal wrapping for Kroki.
 * Light theme = D2 defaults (author colors in source stand as-is).
 * Dark theme = same SVG with CSS invert on `.diagram-figure__svg--dark` (see globals.css).
 */

export type D2ThemeMode = "light" | "dark";

/** Author-facing presets (optional in Obsidian drafts — not injected into Kroki). */
export const D2_LAYER_STYLE = `  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8`;

export const D2_LAYER_STYLE_NEUTRAL = `  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8`;

export const D2_FEEDBACK_EDGE = `  style.stroke: "#696d84"
  style.stroke-dash: 8`;

function countD2Shapes(body: string): number {
  return (body.match(/^[a-zA-Z][\w-]*\s*[:{]/gm) ?? []).length;
}

function countD2Edges(body: string): number {
  return (body.match(/->/g) ?? []).length;
}

function inferD2Pad(nodeCount: number): number {
  if (nodeCount <= 4) return 16;
  if (nodeCount <= 8) return 24;
  return 32;
}

/**
 * Prepare chart for Kroki — no theme-overrides, no ink/fill globs.
 * Bright site theme = this default D2 output.
 */
export function wrapD2Chart(chart: string, _mode?: D2ThemeMode): string {
  let body = chart.trim();
  body = body.replace(/^vars:\s*\{[\s\S]*?\}\s*/m, "");
  body = body.replace(/^direction:\s*(down|right|left|up)\s*\n?/m, "");

  const nodeCount = Math.max(countD2Shapes(body), countD2Edges(body) + 1);
  const pad = inferD2Pad(nodeCount);

  if (!/direction:\s/i.test(body)) {
    body = nodeCount <= 6 ? `direction: right\n\n${body}` : `direction: down\n\n${body}`;
  }

  return `vars: {
  d2-config: {
    sketch: false
    pad: ${pad}
  }
}

${body}`;
}
