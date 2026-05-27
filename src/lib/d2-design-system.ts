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

/**
 * Prepare chart for Kroki — no theme-overrides, no ink/fill globs.
 * Bright site theme = this default D2 output.
 */
export function wrapD2Chart(chart: string, _mode?: D2ThemeMode): string {
  let body = chart.trim();
  body = body.replace(/^vars:\s*\{[\s\S]*?\}\s*/m, "");
  body = body.replace(/^direction:\s*(down|right|left|up)\s*\n?/m, "");

  if (!/direction:\s/i.test(body)) {
    body = `direction: down\n\n${body}`;
  }

  return `vars: {
  d2-config: {
    sketch: false
  }
}

${body}`;
}
