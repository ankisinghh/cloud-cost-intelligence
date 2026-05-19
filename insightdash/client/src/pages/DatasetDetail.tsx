import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/apiClient";
import { ColumnStats, InsightCharts } from "../components/InsightCharts";
import { Filters, FilterState, applyFilter } from "../components/Filters";
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  Filter,
  Table,
} from "lucide-react";

interface Insight {
  stats: ColumnStats[];
  outliers: Record<string, { top: unknown[]; bottom: unknown[] }>;
  topN: Record<string, Record<string, unknown>[]>;
}

interface DatasetMeta {
  _id: string;
  filename: string;
  rowCount: number;
  columnNames: string[];
  status: string;
  error?: string;
}

export default function DatasetDetail() {
  const { id } = useParams();
  const [meta, setMeta] = useState<DatasetMeta | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterState>({ column: null });

  const apiBase =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5001";

  const load = useCallback(async () => {
    const m = await api.get<DatasetMeta>(`/api/datasets/${id}`);
    setMeta(m.data);
    const ins = await api.get<{
      status: string;
      insight: Insight | null;
      error?: string;
    }>(`/api/datasets/${id}/insights`);
    setStatus(ins.data.status);
    setInsight(ins.data.insight);
    if (ins.data.status === "completed") {
      const r = await api.get<{
        columns: string[];
        rows: Record<string, unknown>[];
      }>(`/api/datasets/${id}/rows?limit=1000`);
      setRows(r.data.rows);
      setColumns(r.data.columns);
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (status !== "completed" && status !== "failed") load();
    }, 2000);
    return () => clearInterval(t);
  }, [load, status]);

  const filtered = useMemo(() => applyFilter(rows, filter), [rows, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {meta?.filename}
                  </h1>
                  <p className="text-slate-600">
                    {meta?.rowCount.toLocaleString()} rows ·{" "}
                    {meta?.columnNames.length} columns
                  </p>
                  <p className="text-sm text-slate-500">
                    Import status: {status}
                  </p>
                  {meta?.error && (
                    <p className="text-sm text-red-600 mt-1">{meta.error}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`${apiBase}/api/exports/${id}/csv`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </a>
              <a
                href={`${apiBase}/api/exports/${id}/pdf`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </a>
            </div>
          </div>
        </header>

        {status !== "completed" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-600 border-t-transparent"></div>
              <p className="text-yellow-800 font-medium">
                Computing insights… this updates automatically.
              </p>
            </div>
          </div>
        )}

        {insight && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Charts
                  </h2>
                </div>
                <InsightCharts
                  stats={insight.stats}
                  rows={filtered.length ? filtered : rows}
                />
              </section>

              <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Table className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Data Preview
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {columns.map((c) => (
                          <th
                            key={c}
                            className="text-left px-3 py-2 font-semibold text-slate-900"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 50).map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          {columns.map((c) => (
                            <td key={c} className="px-3 py-2 text-slate-700">
                              {String(r[c] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Showing first 50 rows of {filtered.length} filtered rows.
                </p>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Filters
                  </h2>
                </div>
                <Filters
                  stats={insight.stats}
                  value={filter}
                  onChange={setFilter}
                />
              </section>

              <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Column Statistics
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-slate-900">
                          Column
                        </th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-900">
                          Type
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-900">
                          Count
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-900">
                          Unique
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-900">
                          Min
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-900">
                          Max
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-900">
                          Avg
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {insight.stats.map((s) => (
                        <tr
                          key={s.column}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-3 py-2 font-medium text-slate-900">
                            {s.column}
                          </td>
                          <td className="px-3 py-2 text-slate-600">{s.type}</td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {s.count}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {s.unique}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {s.min ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {s.max ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {s.avg !== undefined
                              ? Number(s.avg).toFixed(2)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
