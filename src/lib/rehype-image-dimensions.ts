import fs from "node:fs";
import path from "node:path";
import sizeOf from "image-size";

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function setDimensions(node: HastNode): void {
  if (node.tagName !== "img") return;

  const src = node.properties?.src;
  if (typeof src !== "string" || !src.startsWith("/")) return;
  if (node.properties?.width && node.properties?.height) return;

  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) return;

  try {
    const result = sizeOf(fs.readFileSync(filePath));
    if (result.width && result.height) {
      node.properties = {
        ...node.properties,
        width: result.width,
        height: result.height,
      };
    }
  } catch {
    // skip unreadable images
  }
}

function walk(node: HastNode): void {
  if (node.type === "element") {
    setDimensions(node);
    for (const child of node.children ?? []) walk(child);
  }
}

/** Sync width/height for raw HTML <img> (tables, etc.) not routed through ProseImage. */
export function rehypeImageDimensions() {
  return (tree: HastNode) => {
    walk(tree);
  };
}
