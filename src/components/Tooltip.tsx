import type { TooltipProps } from "../models/charts";

const HALF_WIDTH = 80;
const GAP = 10;

export default function Tooltip({ data, containerWidth }: TooltipProps) {
  if (!data) return null;

  const left = Math.max(
    HALF_WIDTH,
    Math.min(data.x, containerWidth - HALF_WIDTH),
  );
  const showBelow = data.y < 70;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg ${
        showBelow ? "" : "-translate-y-full"
      }`}
      style={{
        left,
        top: showBelow ? data.y + GAP + 8 : data.y - GAP,
      }}
    >
      <p className="font-semibold">{data.title}</p>
      {data.rows.map((row) => (
        <p key={row.label}>
          <span className="text-slate-300">{row.label}: </span>
          {row.value}
        </p>
      ))}
    </div>
  );
}
