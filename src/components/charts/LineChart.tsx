import { useEffect, useMemo, useRef, useState } from "react";
import {
  axisBottom,
  axisLeft,
  curveMonotoneX,
  extent,
  line,
  max,
  scaleLinear,
  scaleTime,
  select,
  timeFormat,
  timeMonth,
  timeParse,
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
import type { LineChartProps, Margin, TooltipData } from "../../models/charts";

interface Point {
  date: Date;
  revenue: number;
}

const MARGIN: Margin = { top: 20, right: 24, bottom: 48, left: 56 };

const parseDate = timeParse("%Y-%m-%d");
const formatMonth = timeFormat("%b");
const formatYear = timeFormat("%Y");
const formatFullDate = timeFormat("%B %Y");
const POINT_CLASS = `fill-white stroke-blue-700 stroke-2 cursor-pointer ${FOCUS_CLASS}`;
const POINT_ACTIVE_CLASS = `fill-blue-700 stroke-blue-900 stroke-2 cursor-pointer ${FOCUS_CLASS}`;

export default function LineChart({ data }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const points = useMemo(
    () =>
      data.flatMap((item): Point[] => {
        const date = parseDate(item.date);
        return date ? [{ date, revenue: item.revenue }] : [];
      }),
    [data]
  );

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || width === 0 || height === 0) return;

    const { innerWidth, innerHeight } = getInnerSize(width, height, MARGIN);
    const [firstDate, lastDate] = extent(points, (d) => d.date);
    if (innerWidth <= 0 || innerHeight <= 0 || !firstDate || !lastDate) return;

    const xScale = scaleTime()
      .domain([firstDate, lastDate])
      .range([0, innerWidth]);
    const yScale = scaleLinear()
      .domain([0, max(points, (d) => d.revenue) ?? 0])
      .nice()
      .range([innerHeight, 0]);
    const svg = select(svgElement);
    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    drawGrid(g, yScale, innerWidth);

    const monthStep = innerWidth < 480 ? 2 : 1;
    g.append("g")
      .attr("class", AXIS_CLASS)
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale)
          .ticks(timeMonth.every(monthStep) ?? timeMonth)
          .tickFormat((value) => formatMonth(new Date(+value)))
      );

    g.append("g").attr("class", AXIS_CLASS).call(axisLeft(yScale).ticks(5));

    const firstYear = formatYear(firstDate);
    const lastYear = formatYear(lastDate);
    drawXLabel(
      g,
      firstYear === lastYear ? `Month (${firstYear})` : `Month (${firstYear}–${lastYear})`,
      innerWidth,
      innerHeight + 40
    );
    drawYLabel(g, "Revenue (USD thousands)", innerHeight, MARGIN);

    const lineGenerator = line<Point>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.revenue))
      .curve(curveMonotoneX);

    g.append("path")
      .datum(points)
      .attr("class", "fill-none stroke-blue-700 stroke-2")
      .attr("d", (d) => lineGenerator(d));

    const circles = g
      .append("g")
      .selectAll<SVGCircleElement, Point>("circle")
      .data(points, (d) => d.date.toISOString())
      .join("circle")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.revenue))
      .attr("r", 4.5)
      .attr("class", POINT_CLASS)
      .attr("tabindex", 0)
      .attr("role", "img")
      .attr(
        "aria-label",
        (d) => `${formatFullDate(d.date)}: revenue ${d.revenue} thousand dollars`
      );

    const setActive = (active: Point | null) => {
      circles
        .attr("r", (d) => (d === active ? 7 : 4.5))
        .attr("class", (d) => (d === active ? POINT_ACTIVE_CLASS : POINT_CLASS));
    };

    addTooltipInteractions(circles, setActive, setTooltip, (d) => ({
      x: MARGIN.left + xScale(d.date),
      y: MARGIN.top + yScale(d.revenue),
      title: formatFullDate(d.date),
      rows: [{ label: "Revenue", value: `$${d.revenue}k` }],
    }));

    return () => {
      clearChart(svgElement);
      setTooltip(null);
    };
  }, [points, width, height]);

  return (
    <div ref={containerRef} className="relative h-72 w-full sm:h-80">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="group"
        aria-label="Line chart of monthly revenue"
        className="block"
      />
      <Tooltip data={tooltip} containerWidth={width} />
    </div>
  );
}
