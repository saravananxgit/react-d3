import { axisLeft } from "d3";
import type { ScaleLinear, Selection } from "d3";
import type { Margin } from "../models/charts";

export type GroupSelection = Selection<SVGGElement, unknown, null, undefined>;
export const AXIS_CLASS =
  "text-xs [&_text]:fill-slate-600 [&_line]:stroke-slate-300 [&_path]:stroke-slate-300";
const GRID_CLASS = "[&_line]:stroke-slate-200 [&_path]:stroke-none"
const LABEL_CLASS = "fill-slate-700 text-xs font-medium";

export function getInnerSize(
  width: number,
  height: number,
  margin: Margin
): { innerWidth: number; innerHeight: number } {
  return {
    innerWidth: width - margin.left - margin.right,
    innerHeight: height - margin.top - margin.bottom,
  };
}

export function drawGrid(
  g: GroupSelection,
  yScale: ScaleLinear<number, number>,
  innerWidth: number
): void {
  g.append("g")
    .attr("class", GRID_CLASS)
    .call(
      axisLeft(yScale)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat(() => "")
    );
}

export function drawXLabel(
  g: GroupSelection,
  text: string,
  innerWidth: number,
  y: number
): void {
  g.append("text")
    .attr("class", LABEL_CLASS)
    .attr("x", innerWidth / 2)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .text(text);
}

export function drawYLabel(
  g: GroupSelection,
  text: string,
  innerHeight: number,
  margin: Margin
): void {
  g.append("text")
    .attr("class", LABEL_CLASS)
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 14)
    .attr("text-anchor", "middle")
    .text(text);
}
