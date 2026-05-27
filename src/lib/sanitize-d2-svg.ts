/** Light fills remapped so `invert(1)` yields diagram dark canvas `#101011`. */
const DARK_CANVAS_SOURCE = "#efefee";

const LIGHT_CANVAS_FILLS = [
  "#ffffff",
  "#fff",
  "#f5f7fa",
  "#edf0fd",
  "#fefefe",
  "#fafafa",
  "#F5F7FA",
  "#FFFFFF",
  "#EDF0FD",
];

function expandHex(color: string): string | null {
  const hex = color.replace(/^#/, "");
  if (hex.length === 3) {
    return hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length === 6) return hex;
  return null;
}

function hexLuminance(color: string): number | null {
  const full = expandHex(color);
  if (!full) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Pre-invert stroke so CSS `invert(1)` restores the authored light border. */
function invertHex(color: string): string | null {
  const full = expandHex(color);
  if (!full) return null;
  const r = 255 - parseInt(full.slice(0, 2), 16);
  const g = 255 - parseInt(full.slice(2, 4), 16);
  const b = 255 - parseInt(full.slice(4, 6), 16);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function isLightFill(color: string): boolean {
  const luminance = hexLuminance(color);
  return luminance !== null && luminance > 0.88;
}

function isLightStroke(color: string): boolean {
  const luminance = hexLuminance(color);
  return luminance !== null && luminance > 0.72;
}

function remapLightCanvasFills(html: string): string {
  let out = html;
  for (const fill of LIGHT_CANVAS_FILLS) {
    out = out.replace(new RegExp(`fill="${fill}"`, "gi"), `fill="${DARK_CANVAS_SOURCE}"`);
    out = out.replace(new RegExp(`fill:${fill}\\b`, "gi"), `fill:${DARK_CANVAS_SOURCE}`);
  }
  out = out.replace(/fill="(#[0-9a-fA-F]{3,8})"/g, (match, color: string) =>
    isLightFill(color) ? `fill="${DARK_CANVAS_SOURCE}"` : match,
  );
  out = out.replace(/fill:(#[0-9a-fA-F]{3,8})/g, (match, color: string) =>
    isLightFill(color) ? `fill:${DARK_CANVAS_SOURCE}` : match,
  );
  return out;
}

const LIGHT_STROKE_COLORS = [
  "#d8dce6",
  "#e1e1e9",
  "#dee1eb",
  "#cfd2dd",
  "#eef1f8",
];

function remapLightStrokes(html: string): string {
  let out = html;
  for (const stroke of LIGHT_STROKE_COLORS) {
    const inverted = invertHex(stroke);
    if (!inverted) continue;
    out = out.replace(new RegExp(`stroke="${stroke}"`, "gi"), `stroke="${inverted}"`);
    out = out.replace(new RegExp(`stroke:${stroke}\\b`, "gi"), `stroke:${inverted}`);
  }
  out = out.replace(/stroke="(#[0-9a-fA-F]{3,8})"/g, (match, color: string) => {
    if (!isLightStroke(color)) return match;
    const inverted = invertHex(color);
    return inverted ? `stroke="${inverted}"` : match;
  });
  out = out.replace(/stroke:(#[0-9a-fA-F]{3,8})/g, (match, color: string) => {
    if (!isLightStroke(color)) return match;
    const inverted = invertHex(color);
    return inverted ? `stroke:${inverted}` : match;
  });
  return out;
}

/** Prepare Kroki SVG for embedding in a div via dangerouslySetInnerHTML (server-only). */
export function sanitizeD2SvgForHtml(svg: string): string {
  let html = svg.trim();
  if (!html) return "";
  html = html.replace(/<\?xml[\s\S]*?\?>\s*/gi, "");
  html = html.replace(/<!DOCTYPE[\s\S]*?>\s*/gi, "");
  return html;
}

/** Clip sub-pixel halation after Kroki export (nested svg viewBox padding). */
function clipSvgEdgeBleed(html: string): string {
  return html.replace(/<svg(\s[^>]*)>/i, (_match, attrs: string) => {
    const clip = "display:block;overflow:hidden";
    if (/style\s*=/i.test(attrs)) {
      return `<svg${attrs.replace(/style\s*=\s*"([^"]*)"/i, (_m, style: string) => {
        const merged = style.includes("overflow:hidden") ? style : `${style};${clip}`;
        return `style="${merged}"`;
      })}>`;
    }
    return `<svg${attrs} style="${clip}">`;
  });
}

/** Dark theme copy: tune light canvas fills so `invert(1)` yields `#101011`. */
export function prepareDarkSvgForInvert(svg: string): string {
  const html = sanitizeD2SvgForHtml(svg);
  return clipSvgEdgeBleed(remapLightStrokes(remapLightCanvasFills(html)));
}
