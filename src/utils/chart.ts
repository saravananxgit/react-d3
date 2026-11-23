import type { Selection } from "d3";
import { select } from "d3";
import type { Dispatch, SetStateAction } from "react";
import type { TooltipData } from "../models/charts";

type ChartMarkSelection<Mark extends SVGElement, Datum> = Selection<
  Mark,
  Datum,
  SVGGElement,
  unknown
>;

export function addTooltipInteractions<Mark extends SVGElement, Datum>(
  marks: ChartMarkSelection<Mark, Datum>,
  setActive: (datum: Datum | null) => void,
  setTooltip: Dispatch<SetStateAction<TooltipData | null>>,
  createTooltip: (datum: Datum) => TooltipData,
): void {
  const show = (datum: Datum) => {
    setActive(datum);
    setTooltip(createTooltip(datum));
  };
  const hide = () => {
    setActive(null);
    setTooltip(null);
  };

  marks
    .on("mouseenter", (_event, datum) => show(datum))
    .on("focus", (_event, datum) => show(datum))
    .on("mouseleave", hide)
    .on("blur", hide);
}

export function clearChart(svgElement: SVGSVGElement): void {
  const svg = select(svgElement);
  svg.selectAll("*").interrupt();
  svg.selectAll("*").remove();
}
