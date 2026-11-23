import { scaleOrdinal } from "d3";

const PALETTE = [
  "#1d4ed8",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#6d28d9",
  "#4d7c0f",
  "#475569",
];

export function createColorScale(categories: string[]) {
  return scaleOrdinal<string, string>().domain(categories).range(PALETTE);
}
