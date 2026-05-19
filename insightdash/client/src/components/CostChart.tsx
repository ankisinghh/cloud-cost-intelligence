import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: Array<{
    date: string;
    cost: number;
  }>;
}

export default function CostChart({ data }: Props) {
  return (
    <div className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-lg">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-bold">
          AWS Analytics
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-2">
          Cloud Spend Trend
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tickFormatter={(value) => value.slice(5)}
            interval="preserveStartEnd"
          />

          <YAxis domain={[0, "auto"]} />

          <Tooltip />

          <Line type="monotone" dataKey="cost" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
