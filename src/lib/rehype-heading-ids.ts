import { slugifyHeading } from "@/lib/extract-headings";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function getTextContent(node: HastNode): string {
  let text = "";
  for (const child of node.children ?? []) {
    if (child.type === "text" && child.value) {
      text += child.value;
    } else if (child.type === "element") {
      text += getTextContent(child);
    }
  }
  return text;
}

function walk(node: HastNode, visit: (el: HastNode) => void): void {
  for (const child of node.children ?? []) {
    if (child.type === "element") {
      visit(child);
      walk(child, visit);
    }
  }
}

/** Add stable ids to h2/h3/h4 so outline and in-article anchor links match rendered headings. */
export function rehypeHeadingIds() {
  const used = new Map<string, number>();

  return (tree: HastNode) => {
    walk(tree, (node) => {
      if (
        node.tagName !== "h2" &&
        node.tagName !== "h3" &&
        node.tagName !== "h4"
      ) {
        return;
      }

      const text = getTextContent(node).trim();
      if (!text) return;

      const base = slugifyHeading(text);
      if (!base) return;

      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count}`;

      node.properties = { ...node.properties, id };
    });
  };
}
