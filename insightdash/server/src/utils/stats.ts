export interface ColumnStats {
  column: string;
  type: "numeric" | "categorical" | "mixed" | "empty";
  count: number;
  unique: number;
  avg?: number;
  min?: number;
  max?: number;
  sum?: number;
  topValues: { value: unknown; count: number }[];
}

export interface AnalysisResult {
  stats: ColumnStats[];
  outliers: Record<string, { top: unknown[]; bottom: unknown[] }>;
  topN: Record<string, Record<string, unknown>[]>;
}

function isNumeric(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

export function analyze(rows: Record<string, unknown>[], columns: string[], topN = 10): AnalysisResult {
  const stats: ColumnStats[] = [];
  const outliers: AnalysisResult["outliers"] = {};
  const topNRows: AnalysisResult["topN"] = {};

  for (const col of columns) {
    const values = rows.map((r) => r?.[col]).filter((v) => v !== null && v !== undefined && v !== "");
    const count = values.length;
    if (count === 0) {
      stats.push({ column: col, type: "empty", count: 0, unique: 0, topValues: [] });
      continue;
    }
    const nums = values.filter(isNumeric) as number[];
    const allNumeric = nums.length === count;
    const anyNumeric = nums.length > 0;
    const type: ColumnStats["type"] = allNumeric
      ? "numeric"
      : anyNumeric
        ? "mixed"
        : "categorical";

    const counts = new Map<string, number>();
    for (const v of values) {
      const k = typeof v === "object" ? JSON.stringify(v) : String(v);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const topValues = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, c]) => ({ value, count: c }));

    const s: ColumnStats = {
      column: col,
      type,
      count,
      unique: counts.size,
      topValues,
    };

    if (allNumeric || anyNumeric) {
      const sum = nums.reduce((a, b) => a + b, 0);
      s.sum = sum;
      s.avg = nums.length ? sum / nums.length : undefined;
      s.min = nums.length ? Math.min(...nums) : undefined;
      s.max = nums.length ? Math.max(...nums) : undefined;
    }

    stats.push(s);

    if (allNumeric) {
      const sorted = [...nums].sort((a, b) => a - b);
      outliers[col] = {
        bottom: sorted.slice(0, 3),
        top: sorted.slice(-3).reverse(),
      };
      const sortedRows = [...rows].sort((a, b) => Number(b?.[col] ?? 0) - Number(a?.[col] ?? 0));
      topNRows[col] = sortedRows.slice(0, topN);
    }
  }

  return { stats, outliers, topN: topNRows };
}