import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import D2Diagram from "@/components/d2/D2Diagram";

function getD2Source(children: ReactNode): string | null {
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    return null;
  }
  const className = child.props.className ?? "";
  if (!className.split(/\s+/).includes("language-d2")) {
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

export const postDiagramComponents = {
  pre(props: ComponentProps<"pre">) {
    const chart = getD2Source(props.children);
    if (chart !== null) {
      return <D2Diagram chart={chart} />;
    }
    return <pre {...props} />;
  },
};
