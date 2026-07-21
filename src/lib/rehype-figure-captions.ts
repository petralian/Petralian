type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const CAPTION_RE = /^(Screenshot|Photo|Diagram|Source):/i;

/** Known plain-text sources → URL (when vault caption has no markdown link). */
const SOURCE_LINKS: Array<{ pattern: RegExp; href: string; label: string }> = [
  { pattern: /\bCursorBench\b/i, href: "https://cursor.com/cursorbench", label: "CursorBench" },
  { pattern: /\bCursor models and pricing\b/i, href: "https://cursor.com/docs/models-and-pricing", label: "Cursor models and pricing" },
  { pattern: /\bCursor evals\b/i, href: "https://cursor.com/evals", label: "Cursor evals" },
  { pattern: /\bCursor\b/i, href: "https://cursor.com/", label: "Cursor" },
  { pattern: /\bObsidian\b/i, href: "https://obsidian.md/", label: "Obsidian" },
  { pattern: /\bPetralian\b/i, href: "https://petralian.com/", label: "Petralian" },
  { pattern: /\bGoogle Search Central\b/i, href: "https://developers.google.com/search", label: "Google Search Central" },
  { pattern: /\bAhrefs\b/i, href: "https://ahrefs.com/", label: "Ahrefs" },
  { pattern: /\bn8n-io\/n8n\b/i, href: "https://github.com/n8n-io/n8n", label: "n8n-io/n8n" },
  { pattern: /\bMem0 pricing\b/i, href: "https://mem0.ai/pricing", label: "Mem0 pricing" },
  { pattern: /\bHermes Agent\b/i, href: "https://hermes-agent.nousresearch.com/", label: "Hermes Agent" },
  { pattern: /\bxAI Grok 4\.5\b/i, href: "https://x.ai/news/grok-4-5", label: "xAI Grok 4.5" },
  { pattern: /\bOpenClaw deploy guide\b/i, href: "https://open-claw.org/posts/openclaw-deploy", label: "OpenClaw deploy guide" },
  {
    pattern: /How OpenClaw memory works/i,
    href: "https://medium.com/@databytoufik/how-openclaw-memory-works-802bd8465b1a",
    label: "How OpenClaw memory works",
  },
  { pattern: /\bPexels\b/i, href: "https://www.pexels.com/", label: "Pexels" },
  { pattern: /\bGitHub\b/i, href: "https://github.com/", label: "GitHub" },
];

function getTextContent(node: HastNode): string {
  let text = "";
  for (const child of node.children ?? []) {
    if (child.type === "text" && child.value) text += child.value;
    else if (child.type === "element") text += getTextContent(child);
  }
  return text;
}

function hasLink(node: HastNode): boolean {
  for (const child of node.children ?? []) {
    if (child.type === "element" && child.tagName === "a") return true;
    if (child.type === "element" && hasLink(child)) return true;
  }
  return false;
}

function addClass(node: HastNode, className: string): void {
  const existing = node.properties?.className;
  const list = Array.isArray(existing)
    ? [...existing]
    : typeof existing === "string"
      ? [existing]
      : [];
  if (!list.includes(className)) list.push(className);
  node.properties = { ...node.properties, className: list };
}

function isCaptionParagraph(node: HastNode): boolean {
  if (node.tagName !== "p") return false;
  const text = getTextContent(node).trim();
  return CAPTION_RE.test(text);
}

function isMediaParagraph(node: HastNode): boolean {
  if (node.tagName !== "p") return false;
  return (node.children ?? []).some((c) => c.tagName === "img");
}

function injectSourceLinks(node: HastNode): HastNode {
  if (hasLink(node)) return node;

  const em = (node.children ?? []).find((c) => c.tagName === "em");
  if (!em?.children?.length) return node;

  const fullText = getTextContent(em);
  const matches: Array<{ start: number; end: number; href: string; label: string }> = [];

  for (const { pattern, href, label } of SOURCE_LINKS) {
    const match = fullText.match(pattern);
    if (!match || match.index === undefined) continue;
    const start = match.index;
    const end = start + match[0].length;
    if (matches.some((m) => start < m.end && end > m.start)) continue;
    matches.push({ start, end, href, label });
  }

  if (matches.length === 0) return node;

  matches.sort((a, b) => a.start - b.start);
  const newChildren: HastNode[] = [];
  let pos = 0;

  for (const match of matches) {
    if (pos < match.start) {
      newChildren.push({ type: "text", value: fullText.slice(pos, match.start) });
    }
    newChildren.push({
      type: "element",
      tagName: "a",
      properties: { href: match.href, target: "_blank", rel: "noopener noreferrer" },
      children: [{ type: "text", value: match.label }],
    });
    pos = match.end;
  }

  if (pos < fullText.length) {
    newChildren.push({ type: "text", value: fullText.slice(pos) });
  }

  em.children = newChildren;
  return node;
}

function processChildren(children: HastNode[]): HastNode[] {
  const out: HastNode[] = [];
  let i = 0;

  while (i < children.length) {
    const node = children[i];
    const next = children[i + 1];

    if (
      node.type === "element" &&
      isMediaParagraph(node) &&
      next?.type === "element" &&
      isCaptionParagraph(next)
    ) {
      addClass(node, "figure-media");
      const caption = injectSourceLinks({ ...next });
      addClass(caption, "figure-caption");

      out.push({
        type: "element",
        tagName: "figure",
        properties: { className: ["content-figure"] },
        children: [node, caption],
      });
      i += 2;
      continue;
    }

    if (node.type === "element" && node.children) {
      node.children = processChildren(node.children);
    }
    out.push(node);
    i += 1;
  }

  return out;
}

/** Wrap image + attribution lines in <figure> and style captions. */
export function rehypeFigureCaptions() {
  return (tree: HastNode) => {
    if (tree.children) {
      tree.children = processChildren(tree.children);
    }
  };
}
