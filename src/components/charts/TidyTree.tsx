import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hierarchy, linkHorizontal, select, tree } from "d3";
import type { HierarchyPointLink, HierarchyPointNode } from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import { clearChart } from "../../utils/chart";
import type { Margin, TidyTreeProps, TreeNodeData } from "../../models/charts";

type PointNode = HierarchyPointNode<TreeNodeData>;
type PointLink = HierarchyPointLink<TreeNodeData>;
const MARGIN: Margin = { top: 28, right: 100, bottom: 16, left: 48 };
const MIN_SVG_WIDTH = 480;
const NODE_FOCUS_CLASS =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900";
const LABEL_CLASS =
  "pointer-events-none fill-slate-800 text-xs font-medium stroke-white [stroke-width:3px] [paint-order:stroke]";

function buildIdMap(root: TreeNodeData): Map<TreeNodeData, string> {
  const ids = new Map<TreeNodeData, string>();
  const walk = (node: TreeNodeData, path: string) => {
    ids.set(node, path);
    node.children?.forEach((child) => walk(child, `${path}/${child.name}`));
  };

  walk(root, root.name);
  return ids;
}

function isBranch(node: PointNode): boolean {
  return (node.data.children?.length ?? 0) > 0;
}

export default function TidyTree({ data }: TidyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const focusId = useRef<string | null>(null);
  const idMap = useMemo(() => buildIdMap(data), [data]);
  const svgWidth = Math.max(width, MIN_SVG_WIDTH);
  const toggle = useCallback((id: string) => {
    focusId.current = id;
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || width === 0 || height === 0) return;

    const innerWidth = svgWidth - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;
    if (innerWidth <= 0 || innerHeight <= 0) return;

    const getId = (node: TreeNodeData) => idMap.get(node) ?? node.name;
    const isCollapsed = (node: PointNode) => collapsed.has(getId(node.data));
    const root = hierarchy<TreeNodeData>(data, (node) =>
      collapsed.has(getId(node)) ? undefined : node.children,
    );
    const layout = tree<TreeNodeData>().size([innerHeight, innerWidth]);
    const pointRoot = layout(root);
    const linkPath = linkHorizontal<PointLink, PointNode>()
      .x((d) => d.y)
      .y((d) => d.x);
    const svg = select(svgElement);
    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    g.append("g")
      .attr("class", "fill-none stroke-slate-300 stroke-2")
      .selectAll<SVGPathElement, PointLink>("path")
      .data(pointRoot.links(), (d) => getId(d.target.data))
      .join("path")
      .attr("d", (d) => linkPath(d));

    const nodes = g
      .append("g")
      .selectAll<SVGGElement, PointNode>("g")
      .data(pointRoot.descendants(), (d) => getId(d.data))
      .join("g")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .attr("data-id", (d) => getId(d.data));

    nodes
      .append("circle")
      .attr("r", (d) => (isBranch(d) ? 8 : 5))
      .attr("class", (d) => {
        if (!isBranch(d)) return "fill-slate-500 stroke-white stroke-2";
        return isCollapsed(d)
          ? "fill-blue-700 stroke-blue-700 stroke-2"
          : "fill-white stroke-blue-700 stroke-2";
      });

    nodes
      .append("text")
      .attr("class", LABEL_CLASS)
      .attr("x", (d) => (isBranch(d) ? 0 : 12))
      .attr("y", (d) => (isBranch(d) ? -14 : 0))
      .attr("dy", (d) => (isBranch(d) ? null : "0.32em"))
      .attr("text-anchor", (d) => (isBranch(d) ? "middle" : "start"))
      .text((d) => d.data.name);

    nodes
      .filter(isBranch)
      .attr("class", `cursor-pointer ${NODE_FOCUS_CLASS}`)
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("aria-expanded", (d) => String(!isCollapsed(d)))
      .attr("aria-label", (d) => d.data.name)
      .on("click", (_event, d) => toggle(getId(d.data)))
      .on("keydown", (event: KeyboardEvent, d) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle(getId(d.data));
        }
      });

    if (focusId.current) {
      const target = Array.from(
        svgElement.querySelectorAll<SVGGElement>("g[data-id]"),
      ).find((node) => node.dataset.id === focusId.current);
      target?.focus();
      focusId.current = null;
    }

    return () => {
      clearChart(svgElement);
    };
  }, [data, idMap, collapsed, toggle, svgWidth, width, height]);

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-x-auto overflow-y-hidden"
    >
      <svg
        ref={svgRef}
        width={svgWidth}
        height={height}
        role="group"
        aria-label="Company structure tree. Press a department to collapse or expand it."
        className="block"
      />
    </div>
  );
}
