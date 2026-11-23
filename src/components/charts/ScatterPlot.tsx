import { useEffect, useMemo, useRef, useState } from "react";
import { axisBottom, axisLeft, max, scaleLinear, select } from "d3";
import Legend from "../Legend";
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
import { createColorScale } from "../../utils/colors";
import { FOCUS_CLASS } from "../../utils/styles";
import type {
  Campaign,
  LegendItem,
  Margin,
  ScatterPlotProps,
  TooltipData,
} from "../../models/charts";

const MARGIN: Margin = { top: 20, right: 24, bottom: 52, left: 56 };
const POINT_CLASS = `stroke-white stroke-1 cursor-pointer ${FOCUS_CLASS}`;
const POINT_ACTIVE_CLASS = `stroke-slate-900 stroke-2 cursor-pointer ${FOCUS_CLASS}`;

export default function ScatterPlot({ data }: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const channels = useMemo(
    () => Array.from(new Set(data.map((d) => d.channel))),
    [data],
  );
  const colorScale = useMemo(() => createColorScale(channels), [channels]);
  const legendItems = useMemo<LegendItem[]>(
    () =>
      channels.map((channel) => ({
        label: channel,
        color: colorScale(channel),
      })),
    [channels, colorScale],
  );

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || width === 0 || height === 0) return;

    const { innerWidth, innerHeight } = getInnerSize(width, height, MARGIN);
    if (innerWidth <= 0 || innerHeight <= 0) return;

    const xScale = scaleLinear()
      .domain([0, max(data, (d) => d.adSpend) ?? 0])
      .nice()
      .range([0, innerWidth]);
    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.revenue) ?? 0])
      .nice()
      .range([innerHeight, 0]);
    const svg = select(svgElement);
    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    drawGrid(g, yScale, innerWidth);

    g.append("g")
      .attr("class", AXIS_CLASS)
      .attr("transform", `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).ticks(6));

    g.append("g").attr("class", AXIS_CLASS).call(axisLeft(yScale).ticks(5));

    drawXLabel(
      g,
      "Advertising spend (USD thousands)",
      innerWidth,
      innerHeight + 42,
    );
    drawYLabel(g, "Revenue (USD thousands)", innerHeight, MARGIN);

    const points = g
      .append("g")
      .selectAll<SVGCircleElement, Campaign>("circle")
      .data(data, (d) => d.id)
      .join("circle")
      .attr("cx", (d) => xScale(d.adSpend))
      .attr("cy", (d) => yScale(d.revenue))
      .attr("r", 5)
      .attr("fill", (d) => colorScale(d.channel))
      .attr("class", POINT_CLASS)
      .attr("tabindex", 0)
      .attr("role", "img")
      .attr(
        "aria-label",
        (d) =>
          `Campaign ${d.id}, ${d.channel}: ad spend ${d.adSpend} thousand dollars, revenue ${d.revenue} thousand dollars`,
      );

    const setActive = (active: Campaign | null) => {
      points
        .attr("r", (d) => (d === active ? 7 : 5))
        .attr("class", (d) =>
          d === active ? POINT_ACTIVE_CLASS : POINT_CLASS,
        );
    };

    addTooltipInteractions(points, setActive, setTooltip, (d) => ({
      x: MARGIN.left + xScale(d.adSpend),
      y: MARGIN.top + yScale(d.revenue) - 4,
      title: `Campaign ${d.id}`,
      rows: [
        { label: "Ad spend", value: `$${d.adSpend}k` },
        { label: "Revenue", value: `$${d.revenue}k` },
        { label: "Channel", value: d.channel },
      ],
    }));

    return () => {
      clearChart(svgElement);
      setTooltip(null);
    };
  }, [data, colorScale, width, height]);

  return (
    <div>
      <div ref={containerRef} className="relative h-72 w-full sm:h-80">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="group"
          aria-label="Scatter plot of advertising spend against revenue, one point per campaign"
          className="block"
        />
        <Tooltip data={tooltip} containerWidth={width} />
      </div>
      <Legend items={legendItems} className="mt-4 justify-center" />
    </div>
  );
}
