import { useMemo } from "react";
import { ColumnStats } from "./InsightCharts";
import { Filter, X } from "lucide-react";

export interface FilterState {
  column: string | null;
  min?: number;
  max?: number;
  category?: string;
}

export function Filters({
  stats,
  value,
  onChange,
}: {
  stats: ColumnStats[];
  value: FilterState;
  onChange: (v: FilterState) => void;
}) {
  const selected = useMemo(
    () => stats.find((s) => s.column === value.column),
    [stats, value.column],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Column</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            value={value.column ?? ""}
            onChange={(e) => onChange({ column: e.target.value || null })}
          >
            <option value="">— Select a column —</option>
            {stats.map((s) => (
              <option key={s.column} value={s.column}>
                {s.column} ({s.type})
              </option>
            ))}
          </select>
        </div>

        {selected?.type === "numeric" && (
          <>
            <div className="min-w-32">
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Value</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={value.min ?? ""}
                placeholder="Min"
                onChange={(e) =>
                  onChange({
                    ...value,
                    min: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="min-w-32">
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Value</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={value.max ?? ""}
                placeholder="Max"
                onChange={(e) =>
                  onChange({
                    ...value,
                    max: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
          </>
        )}

        {selected && selected.type !== "numeric" && (
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              value={value.category ?? ""}
              onChange={(e) => onChange({ ...value, category: e.target.value || undefined })}
            >
              <option value="">All categories</option>
              {selected.topValues.map((v) => (
                <option key={String(v.value)} value={String(v.value)}>
                  {String(v.value)} ({v.count})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {(value.column || value.min !== undefined || value.max !== undefined || value.category) && (
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="h-4 w-4" />
            <span>Active filters applied</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
            onClick={() => onChange({ column: null })}
          >
            <X className="h-3 w-3" />
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

export function applyFilter(rows: Record<string, unknown>[], f: FilterState) {
  if (!f.column) return rows;
  return rows.filter((r) => {
    const v = r[f.column!];
    if (f.min !== undefined && (typeof v !== "number" || v < f.min)) return false;
    if (f.max !== undefined && (typeof v !== "number" || v > f.max)) return false;
    if (f.category !== undefined && String(v) !== f.category) return false;
    return true;
  });
}
