"use client";

import type { ReactNode } from "react";
import DiagramCollapsedViewport from "@/components/diagram/DiagramCollapsedViewport";
import DiagramExpandedViewport from "@/components/diagram/DiagramExpandedViewport";
import { useDiagramUi } from "@/components/diagram/DiagramUiContext";

type DiagramViewportProps = {
  children: ReactNode;
};

/** Routes inline (panzoom) vs fullscreen (react-zoom-pan-pinch). */
export default function DiagramViewport({ children }: DiagramViewportProps) {
  const { expanded } = useDiagramUi();

  if (expanded) {
    return <DiagramExpandedViewport>{children}</DiagramExpandedViewport>;
  }

  return <DiagramCollapsedViewport>{children}</DiagramCollapsedViewport>;
}
