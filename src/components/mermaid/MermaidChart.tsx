"use client";

import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

const MERMAID_INIT = {
  startOnLoad: false,
  securityLevel: "strict" as const,
  theme: "base" as const,
  themeVariables: {
    fontFamily: "var(--font-body), Red Hat Text, system-ui, sans-serif",
    fontSize: "14px",
    background: "#ffffff",
    mainBkg: "#ffffff",
    primaryColor: "#fff5f2",
    primaryTextColor: "#272730",
    primaryBorderColor: "#ff6a3d",
    secondaryColor: "#f5f7fa",
    secondaryTextColor: "#545468",
    secondaryBorderColor: "#e1e1e9",
    tertiaryColor: "#e8ecf4",
    tertiaryTextColor: "#696d84",
    tertiaryBorderColor: "#e1e1e9",
    lineColor: "#545468",
    textColor: "#272730",
    nodeBorder: "#ff6a3d",
    clusterBkg: "#f5f7fa",
    clusterBorder: "#e1e1e9",
    titleColor: "#1b2430",
    edgeLabelBackground: "#ffffff",
    nodeTextColor: "#272730",
  },
};

let mermaidReady = false;

function ensureMermaidInit() {
  if (!mermaidReady) {
    mermaid.initialize(MERMAID_INIT);
    mermaidReady = true;
  }
}

type MermaidChartProps = {
  chart: string;
};

export default function MermaidChart({ chart }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const diagramId = `petralian-mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

    async function render() {
      ensureMermaidInit();
      try {
        const { svg, bindFunctions } = await mermaid.render(diagramId, chart.trim());
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        bindFunctions?.(containerRef.current);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (status === "error") {
    return (
      <figure className="mermaid-diagram mermaid-diagram--error">
        <figcaption>Diagram could not be rendered</figcaption>
        <pre className="mermaid-diagram__fallback">
          <code>{chart}</code>
        </pre>
      </figure>
    );
  }

  return (
    <figure className="mermaid-diagram" aria-busy={status === "loading"}>
      <div
        ref={containerRef}
        className={`mermaid-diagram__canvas${status === "loading" ? " mermaid-diagram__canvas--loading" : ""}`}
      />
    </figure>
  );
}
