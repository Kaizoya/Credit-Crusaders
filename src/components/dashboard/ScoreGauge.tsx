import { getScoreCategory, getScoreColor } from "../../utils/scoreUtils";

interface ScoreGaugeProps {
  score: number;
  min?: number;
  max?: number;
}

const segments = [
  { from: 300, to: 579, color: "#ff4d4f" },
  { from: 580, to: 669, color: "#ff9f43" },
  { from: 670, to: 739, color: "#f5d442" },
  { from: 740, to: 799, color: "#7ed957" },
  { from: 800, to: 900, color: "#22c55e" },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function ScoreGauge({ score, min = 300, max = 900 }: ScoreGaugeProps) {
  const clamped = Math.max(min, Math.min(max, score));
  const ratio = (clamped - min) / (max - min);
  const angle = -90 + ratio * 180;
  const category = getScoreCategory(score);
  const scoreColor = getScoreColor(score);

  return (
    <div className="glass rounded-2xl p-5 shadow-glass">
      <h2 className="text-2xl font-bold text-white">Current Credit Score</h2>
      <p className="mb-4 text-sm text-slate-400">Range {min} - {max}</p>

      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <ul className="space-y-2 text-sm text-slate-300">
          {segments.map((segment) => (
            <li key={segment.from} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
              <span>
                {segment.from}-{segment.to}
              </span>
              <span className="ml-2 text-slate-500">{getScoreCategory(segment.to)}</span>
            </li>
          ))}
        </ul>

        <div className="relative mx-auto -mt-3 h-60 w-full max-w-xs">
          <svg viewBox="0 0 240 140" className="w-full">
            {segments.map((segment) => {
              const start = ((segment.from - min) / (max - min)) * 180 - 90;
              const end = ((segment.to - min) / (max - min)) * 180 - 90;
              return (
                <path
                  key={segment.from}
                  d={describeArc(120, 120, 85, start, end)}
                  stroke={segment.color}
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}

            <g style={{ transformOrigin: "120px 120px", transform: `rotate(${angle}deg)`, transition: "transform 600ms ease" }}>
              <line x1="120" y1="120" x2="120" y2="30" stroke="#9cb8ee" strokeWidth="6" strokeLinecap="round" />
            </g>
            <circle cx="120" cy="120" r="10" fill="#c5d8ff" />
          </svg>

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center">
            <p className="text-5xl font-extrabold leading-none text-white">{clamped}</p>
            <p className="text-xl font-semibold leading-tight" style={{ color: scoreColor }}>
              {category}
            </p>
            <p className="text-xs text-slate-400">out of 900</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreGauge;
