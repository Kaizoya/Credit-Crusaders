import { StatusLevel } from "../../types/credit.types";
import { getStatusStyle } from "../../utils/scoreUtils";
import { useCountUp } from "../../hooks/useCountUp";

interface MetricCardProps {
  label: string;
  value: string;
  status: StatusLevel;
}

const valuePattern = /^([^0-9-]*)(-?\d[\d,]*(?:\.\d+)?)([^0-9]*)$/;

function parseAnimatedValue(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(valuePattern);

  if (!match) {
    return { canAnimate: false, display: value, prefix: "", suffix: "", target: 0, decimals: 0 };
  }

  const prefix = match[1] ?? "";
  const numeric = (match[2] ?? "").replace(/,/g, "");
  const suffix = match[3] ?? "";
  const target = Number(numeric);

  if (!Number.isFinite(target)) {
    return { canAnimate: false, display: value, prefix: "", suffix: "", target: 0, decimals: 0 };
  }

  const decimalPart = numeric.split(".")[1] ?? "";
  return { canAnimate: true, display: value, prefix, suffix, target, decimals: decimalPart.length };
}

function MetricCard({ label, value, status }: MetricCardProps) {
  const parsed = parseAnimatedValue(value);
  const animated = useCountUp(parsed.target, { durationMs: 1800, start: 0 });

  const displayValue = parsed.canAnimate
    ? `${parsed.prefix}${animated.toLocaleString("en-IN", {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
      })}${parsed.suffix}`
    : parsed.display;

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
      <p className="truncate text-3xl font-bold leading-none text-white">{displayValue}</p>
    </article>
  );
}

export default MetricCard;
