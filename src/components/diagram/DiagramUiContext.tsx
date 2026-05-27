"use client";

import { createContext, useContext } from "react";

type DiagramUiContextValue = {
  expanded: boolean;
  toggleExpanded: () => void;
};

export const DiagramUiContext = createContext<DiagramUiContextValue>({
  expanded: false,
  toggleExpanded: () => { },
});

export function useDiagramUi(): DiagramUiContextValue {
  return useContext(DiagramUiContext);
}
