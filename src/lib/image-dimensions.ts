import fs from "node:fs";
import path from "node:path";
import sizeOf from "image-size";

const cache = new Map<string, { width: number; height: number }>();

/** Sync lookup of local /images/* dimensions (build + RSC safe). */
export function getImageDimensions(
  src: string
): { width: number; height: number } | null {
  if (!src.startsWith("/")) return null;

  const cached = cache.get(src);
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) return null;

  try {
    const buffer = fs.readFileSync(filePath);
    const result = sizeOf(buffer);
    if (!result.width || !result.height) return null;
    const dims = { width: result.width, height: result.height };
    cache.set(src, dims);
    return dims;
  } catch {
    return null;
  }
}
