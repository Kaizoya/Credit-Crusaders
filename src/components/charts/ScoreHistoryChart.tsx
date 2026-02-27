import { Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ComposedChart } from "recharts";
import { HistoryPoint } from "../../types/credit.types";

interface ScoreHistoryChartProps {
  data: HistoryPoint[];
}

function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  return (
    <div className="glass rounded-2xl p-5 shadow-glass">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Score History</h3>
          <p className="text-sm text-slate-400">Simulated progression over the last 6 months</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid stroke="rgba(120,150,210,0.15)" vertical={false} />
            <XAxis dataKey="month" stroke="#8ea5d2" tickLine={false} axisLine={false} />
            <YAxis domain={[300, 900]} stroke="#8ea5d2" tickLine={false} axisLine={false} width={48} />
            <Tooltip
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                background: "rgba(11,18,34,0.95)",
                border: "1px solid rgba(109,145,208,0.35)",
                borderRadius: "10px",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3fbf9a"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3fbf9a" }}
              activeDot={{ r: 6, fill: "#57d6b2" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScoreHistoryChart;
