import { ReactNode } from "react";

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface SalesItem {
  category: string;
  sales: number;
}

export interface TrafficItem {
  category: string;
  value: number;
}

export interface TreeNodeData {
  name: string;
  children?: TreeNodeData[];
}

export interface Campaign {
  id: string;
  adSpend: number;
  revenue: number;
  channel: string;
}

export interface Size {
  width: number;
  height: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TooltipRow {
  label: string;
  value: string;
}

export interface TooltipData {
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
}

export interface LegendItem {
  label: string;
  color: string;
}

export interface LineChartProps {
  data: RevenuePoint[];
}

export interface BarChartProps {
  data: SalesItem[];
}

export interface DonutChartProps {
  data: TrafficItem[];
}

export interface TidyTreeProps {
  data: TreeNodeData;
}

export interface ScatterPlotProps {
  data: Campaign[];
}

export interface ChartCardProps {
  title: string;
  className?: string;
  children: ReactNode;
}

export interface LegendProps {
  items: LegendItem[];
  className?: string;
}

export interface TooltipProps {
  data: TooltipData | null;
  containerWidth: number;
}