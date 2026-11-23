import type { LegendProps } from "../models/charts";

export default function Legend({ items, className = "" }: LegendProps) {
  return (
    <ul
      className={`flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-700 ${className}`}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <svg
            viewBox="-8 -8 16 16"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <rect
              x="-7"
              y="-7"
              width="14"
              height="14"
              rx="2"
              fill={item.color}
            />
          </svg>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
