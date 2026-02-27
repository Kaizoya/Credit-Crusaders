import { StatusLevel } from "../../types/credit.types";
import { getStatusStyle } from "../../utils/scoreUtils";

interface MetricCardProps {
  label: string;
  value: string;
  status: StatusLevel;
}

function MetricCard({ label, value, status }: MetricCardProps) {
  return (
    <article className="metric-chip flex min-h-28 flex-col justify-between gap-3 rounded-xl p-4 shadow-glass">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[0.8rem] leading-4 text-slate-400">{label}</p>
        <span
          className={[
            "inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 text-[11px] font-semibold",
            getStatusStyle(status),
          ].join(" ")}
        >
          {status}
        </span>
      </div>
      <p className="truncate text-3xl font-bold leading-none text-white">{value}</p>
    </article>
  );
}

export default MetricCard;
