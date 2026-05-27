import { createHash } from "node:crypto";
import { wrapD2Source } from "@/lib/d2-theme";

const KROKI_D2 = "https://kroki.io/d2/svg";

const svgCache = new Map<string, string>();

function cacheKey(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

/** Single Kroki render — D2 default colors (bright theme). */
export async function renderD2Svg(chart: string): Promise<string> {
  const wrapped = wrapD2Source(chart);
  const key = cacheKey(wrapped);
  const hit = svgCache.get(key);
  if (hit) return hit;

  const res = await fetch(KROKI_D2, {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: wrapped,
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`D2 render failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const svg = await res.text();
  svgCache.set(key, svg);
  return svg;
}

/** Dark theme uses the same SVG; the site applies CSS invert when showing `--dark`. */
export async function renderD2SvgPair(chart: string): Promise<{
  light: string;
  dark: string;
}> {
  const svg = await renderD2Svg(chart);
  return { light: svg, dark: svg };
}
