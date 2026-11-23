import { useEffect, useRef, useState } from "react";
import {
  axisBottom,
  axisLeft,
  max,
  scaleBand,
  scaleLinear,
  select,
} from "d3";
import Tooltip from "../Tooltip";
import { useContainerSize } from "../../hooks/useContainerSize";
import { addTooltipInteractions, clearChart } from "../../utils/chart";
import {
  AXIS_CLASS,
  drawGrid,
  drawXLabel,
  drawYLabel,
  getInnerSize,
} from "../../utils/axis";
import { FOCUS_CLASS } from "../../utils/styles";
import type {
  BarChartProps,
  Margin,
  SalesItem,
  TooltipData,
} from "../../models/charts";

const BASE_MARGIN = { top: 28, right: 16, left: 56 };
const MIN_STEP_FOR_FLAT_LABELS = 64;
const BAR_CLASS = `fill-blue-600 cursor-pointer ${FOCUS_CLASS}`;
const BAR_ACTIVE_CLASS = `fill-blue-900 stroke-slate-900 stroke-2 cursor-pointer ${FOCUS_CLASS}`;
const ANIMATION_MS = 600;

export default function BarChart({ data }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || width === 0 || height === 0 || data.length === 0) return;

    const step = (width - BASE_MARGIN.left - BASE_MARGIN.right) / data.length;
    const rotateLabels = step < MIN_STEP_FOR_FLAT_LABELS;
    const margin: Margin = { ...BASE_MARGIN, bottom: rotateLabels ? 92 : 52 };
    const { innerWidth, innerHeight } = getInnerSize(width, height, margin);
    if (innerWidth <= 0 || innerHeight <= 0) return;

    const xScale = scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.sales) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    const barX = (d: SalesItem) => xScale(d.category) ?? 0;
    const barY = (d: SalesItem) => yScale(d.sales);
    const barHeight = (d: SalesItem) => innerHeight - yScale(d.sales);
    const labelY = (d: SalesItem) => yScale(d.sales) - 6;
    const svg = select(svgElement);
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    drawGrid(g, yScale, innerWidth);

    const xAxisGroup = g
      .append("g")
      .attr("class", AXIS_CLASS)
      .attr("transform", `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).tickSizeOuter(0));

    if (rotateLabels) {
      xAxisGroup
        .selectAll<SVGTextElement, string>("text")
        .attr("transform", "rotate(-40)")
        .attr("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.25em");
    }

    g.append("g").attr("class", AXIS_CLASS).call(axisLeft(yScale).ticks(5));

    drawXLabel(
      g,
      "Product category",
      innerWidth,
      innerHeight + (rotateLabels ? 80 : 42),
    );
    drawYLabel(g, "Units sold", innerHeight, margin);

    const bars = g
      .append("g")
      .selectAll<SVGRectElement, SalesItem>("rect")
      .data(data, (d) => d.category)
      .join("rect")
      .attr("x", barX)
      .attr("width", xScale.bandwidth())
      .attr("class", BAR_CLASS)
      .attr("tabindex", 0)
      .attr("role", "img")
      .attr("aria-label", (d) => `${d.category}: ${d.sales} units sold`);

    const labels = g
      .append("g")
      .selectAll<SVGTextElement, SalesItem>("text")
      .data(data, (d) => d.category)
      .join("text")
      .attr("x", (d) => barX(d) + xScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr(
        "class",
        "pointer-events-none fill-slate-700 text-[10px] font-medium sm:text-xs",
      )
      .text((d) => d.sales);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!hasAnimated.current && !reduceMotion) {
      bars.attr("y", innerHeight).attr("height", 0);
      bars
        .transition()
        .duration(ANIMATION_MS)
        .attr("y", barY)
        .attr("height", barHeight);
    } else {
      bars.attr("y", barY).attr("height", barHeight);
    }
    labels.attr("y", labelY);
    hasAnimated.current = true;

    const setActive = (active: SalesItem | null) => {
      bars.attr("class", (d) => (d === active ? BAR_ACTIVE_CLASS : BAR_CLASS));
    };

    addTooltipInteractions(bars, setActive, setTooltip, (d) => ({
      x: margin.left + barX(d) + xScale.bandwidth() / 2,
      y: margin.top + labelY(d) - 12,
      title: d.category,
      rows: [{ label: "Units sold", value: String(d.sales) }],
    }));

    return () => {
      clearChart(svgElement);
      setTooltip(null);
    };
  }, [data, width, height]);

  return (
    <div ref={containerRef} className="relative h-80 w-full sm:h-96">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="group"
        aria-label="Bar chart of units sold by product category"
        className="block"
      />
      <Tooltip data={tooltip} containerWidth={width} />
    </div>
  );
}
