import { renderD2SvgPair } from "@/lib/render-d2";
import DiagramFigure from "@/components/diagram/DiagramFigure";

type D2DiagramProps = {
  chart: string;
};

/** Server component — renders D2 via Kroki at build/request time (light + dark SVG). */
export default async function D2Diagram({ chart }: D2DiagramProps) {
  try {
    const { light, dark } = await renderD2SvgPair(chart);
    return <DiagramFigure svgLight={light} svgDark={dark} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown render error";
    console.error("[D2Diagram]", message);
    return (
      <figure className="diagram-figure diagram-figure--error">
        <figcaption>Diagram could not be rendered</figcaption>
        <p className="diagram-figure__error-detail">{message}</p>
        <pre className="diagram-figure__fallback">
          <code>{chart}</code>
        </pre>
      </figure>
    );
  }
}
