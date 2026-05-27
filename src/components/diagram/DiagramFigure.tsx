import DiagramFigureChrome from "@/components/diagram/DiagramFigureChrome";
import DiagramViewport from "@/components/diagram/DiagramViewport";
import { prepareDarkSvgForInvert, sanitizeD2SvgForHtml } from "@/lib/sanitize-d2-svg";

type DiagramFigureProps = {
  svgLight: string;
  svgDark: string;
};

/** Server-rendered diagram SVG + client pan/zoom chrome. */
export default function DiagramFigure({ svgLight, svgDark }: DiagramFigureProps) {
  const light = sanitizeD2SvgForHtml(svgLight);
  const dark = prepareDarkSvgForInvert(svgDark);

  if (!light.includes("<svg") || !dark.includes("<svg")) {
    return (
      <figure className="diagram-figure diagram-figure--error">
        <figcaption>Diagram SVG was empty after rendering</figcaption>
      </figure>
    );
  }

  return (
    <DiagramFigureChrome>
      <DiagramViewport>
        <div
          className="diagram-figure__svg diagram-figure__svg--light"
          dangerouslySetInnerHTML={{ __html: light }}
        />
        <div className="diagram-figure__svg diagram-figure__svg--dark">
          <div
            className="diagram-figure__svg-invert"
            dangerouslySetInnerHTML={{ __html: dark }}
          />
        </div>
      </DiagramViewport>
    </DiagramFigureChrome>
  );
}
