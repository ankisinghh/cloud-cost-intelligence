import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export interface ColumnStats {
  column: string;
  type: string;
  count: number;
  unique: number;
  avg?: number;
  min?: number;
  max?: number;
  sum?: number;
  topValues: { value: unknown; count: number }[];
}

export function InsightCharts({
  stats,
  rows,
}: {
  stats: ColumnStats[];
  rows: Record<string, unknown>[];
}) {
  const numericCols = stats.filter((s) => s.type === "numeric");
  const categoricalCols = stats.filter((s) => s.type === "categorical" || s.type === "mixed");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {numericCols.slice(0, 2).map((s) => {
        const data = rows.slice(0, 50).map((r, i) => ({ i, v: Number(r[s.column] ?? 0) }));
        return (
          <div key={s.column} className="bg-white rounded-lg p-4 border shadow-sm">
            <h3 className="font-medium mb-2">{s.column} — trend (first 50 rows)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="i" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#0ea5e9" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}

      {categoricalCols.slice(0, 2).map((s) => {
        const data = s.topValues.map((v) => ({ name: String(v.value), value: v.count }));
        return (
          <div key={s.column} className="bg-white rounded-lg p-4 border shadow-sm">
            <h3 className="font-medium mb-2">{s.column} — top values</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}

      {categoricalCols[0] && (
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="font-medium mb-2">{categoricalCols[0].column} — distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoricalCols[0].topValues.map((v) => ({
                  name: String(v.value),
                  value: v.count,
                }))}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {categoricalCols[0].topValues.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}