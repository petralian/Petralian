import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import MermaidChart from "@/components/mermaid/MermaidChart";

function getMermaidSource(children: ReactNode): string | null {
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    return null;
  }
  const className = child.props.className ?? "";
  if (!className.split(/\s+/).includes("language-mermaid")) {
    return null;
  }
  const text = child.props.children;
  if (typeof text === "string") return text.replace(/\n$/, "");
  if (Array.isArray(text)) {
    return text
      .map((part) => (typeof part === "string" ? part : ""))
      .join("")
      .replace(/\n$/, "");
  }
  return null;
}

export const postMdxComponents = {
  pre(props: ComponentProps<"pre">) {
    const chart = getMermaidSource(props.children);
    if (chart !== null) {
      return <MermaidChart chart={chart} />;
    }
    return <pre {...props} />;
  },
};
