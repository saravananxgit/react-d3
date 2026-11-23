import { useId } from "react";
import { ChartCardProps } from "../models/charts";

export default function ChartCard({
  title,
  className = "",
  children,
}: ChartCardProps) {
  const id = useId();

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={`min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      <h2 id={`${id}-title`} className="text-lg font-semibold text-slate-900">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
