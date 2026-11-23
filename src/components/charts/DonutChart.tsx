import { useEffect, useMemo, useRef, useState } from "react";
import { arc, format, pie, select, sum } from "d3";
import type { PieArcDatum } from "d3";
import Legend from "../Legend";
import Tooltip from "../Tooltip";
import { useContainerSize } from "../../hooks/useContainerSize";
import { addTooltipInteractions, clearChart } from "../../utils/chart";
import { createColorScale } from "../../utils/colors";
import { FOCUS_CLASS } from "../../utils/styles";
import type {
  DonutChartProps,
  LegendItem,
  TooltipData,
  TrafficItem,
} from "../../models/charts";

type Slice = PieArcDatum<TrafficItem>;
const SLICE_CLASS = `stroke-white stroke-2 cursor-pointer ${FOCUS_CLASS}`;
const formatLabel = format(".0%");
const formatTooltip = format(".1%");
const MIN_ANGLE_FOR_LABEL = 0.2;

export default function DonutChart({ data }: DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const total = useMemo(() => sum(data, (d) => d.value), [data]);
  const colorScale = useMemo(
    () => createColorScale(data.map((d) => d.category)),
    [data]
  );
  const legendItems = useMemo<LegendItem[]>(
    () =>
      data.map((d) => ({
        label: `${d.category} (${d.value}%)`,
        color: colorScale(d.category),
      })),
    [data, colorScale]
  );

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || width === 0 || height === 0 || total === 0) return;

    const radius = Math.min(width, height) / 2 - 4;
    if (radius <= 0) return;

    const baseArc = arc<Slice>()
      .innerRadius(radius * 0.58)
      .outerRadius(radius - 8)
      .padAngle(0.01);
    const slices = pie<TrafficItem>()
      .sort(null)
      .value((d) => d.value)(data);
    const centerX = width / 2;
    const centerY = height / 2;
    const svg = select(svgElement);
    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    const paths = g
      .append("g")
      .selectAll<SVGPathElement, Slice>("path")
      .data(slices, (d) => d.data.category)
      .join("path")
      .attr("d", (d) => baseArc(d))
      .attr("fill", (d) => colorScale(d.data.category))
      .attr("class", SLICE_CLASS)
      .attr("tabindex", 0)
      .attr("role", "img")
      .attr(
        "aria-label",
        (d) =>
          `${d.data.category}: ${d.data.value}, ${formatTooltip(d.data.value / total)} of total`
      );

    g.append("g")
      .selectAll<SVGTextElement, Slice>("text")
      .data(
        slices.filter((d) => d.endAngle - d.startAngle > MIN_ANGLE_FOR_LABEL),
        (d) => d.data.category
      )
      .join("text")
      .attr("transform", (d) => `translate(${baseArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("class", "pointer-events-none fill-white text-xs font-semibold")
      .text((d) => formatLabel(d.data.value / total));

    const setActive = (active: Slice | null) => {
      paths.attr("class", (d) =>
        d === active
          ? `stroke-slate-900 stroke-4 ${FOCUS_CLASS}`
          : SLICE_CLASS
      );
    };

    addTooltipInteractions(paths, setActive, setTooltip, (d) => {
      const [cx, cy] = baseArc.centroid(d);
      return {
        x: centerX + cx,
        y: centerY + cy,
        title: d.data.category,
        rows: [
          { label: "Value", value: String(d.data.value) },
          { label: "Share", value: formatTooltip(d.data.value / total) },
        ],
      };
    });

    return () => {
      clearChart(svgElement);
      setTooltip(null);
    };
  }, [data, total, colorScale, width, height]);

  return (
    <div>
      <div ref={containerRef} className="relative h-64 w-full sm:h-72">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="group"
          aria-label="Donut chart of website traffic sources"
          className="block"
        />
        <Tooltip data={tooltip} containerWidth={width} />
      </div>
      <Legend items={legendItems} className="mt-4 justify-center" />
    </div>
  );
}
