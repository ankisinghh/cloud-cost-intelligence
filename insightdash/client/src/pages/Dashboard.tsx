import CostChart from "../components/CostChart";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/apiClient";
import { UploadForm } from "../components/UploadForm";
import { Dataset, DatasetList } from "../components/DatasetList";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/Sidebar";
import {
  BarChart3,
  LogOut,
  User,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Globe,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface DashboardSummary {
  totalRows: number;
  totalSpend: number | null;
  topService: string | null;
  activeRegions: number;
  highSeverity: number;
  recommendationsCount: number;
  latestDatasetStatus: string | null;
}

const defaultSummary: DashboardSummary = {
  totalRows: 0,
  totalSpend: null,
  topService: null,
  activeRegions: 0,
  highSeverity: 0,
  recommendationsCount: 0,
  latestDatasetStatus: null,
};

export interface Recommendation {
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Dataset[]>([]);
  const [insights, setInsights] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [alertCount, setAlertCount] = useState(0);
  const [awsCosts, setAwsCosts] = useState<
    Array<{ date: string; cost: number }>
  >([]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const updateInsights = (newInsights: Recommendation[]) => {
    setInsights(newInsights);
    setAlertCount(newInsights.filter((i) => i.severity === "high").length);
  };

  const load = useCallback(async () => {
    try {
      const r = await api.get<Dataset[]>("/api/datasets");
      setItems(r.data);

      const totalRows = r.data.reduce(
        (sum, dataset) => sum + dataset.rowCount,
        0,
      );

      // Fetch AWS costs
      try {
        const response = await api.get("/api/aws/costs");
        setAwsCosts(response.data.data);
        if (response.data.insights) {
          setInsights(response.data.insights);
        }
      } catch (awsError) {
        console.error("Failed to fetch AWS costs", awsError);
      }

      const latestDataset = r.data[0];
      if (latestDataset) {
        const insightRes = await api.get(
          `/api/datasets/${latestDataset._id}/insights`,
        );
        const recs = insightRes.data?.insight?.recommendations || [];
        if (recs.length > 0) {
          updateInsights(recs);
        }

        setSummary({
          totalRows,
          totalSpend: insightRes.data?.summary?.totalSpend ?? null,
          topService: insightRes.data?.summary?.topService ?? null,
          activeRegions: insightRes.data?.summary?.activeRegions ?? 0,
          highSeverity: insightRes.data?.summary?.highSeverity ?? 0,
          recommendationsCount:
            insightRes.data?.summary?.recommendationsCount ?? recs.length,
          latestDatasetStatus: latestDataset.status,
        });
      } else {
        setSummary({ ...defaultSummary, totalRows });
      }
    } catch (e) {
      console.error("Failed to load datasets/insights", e);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <Sidebar />

          <main className="space-y-8">
            <header className="rounded-[32px] bg-white/95 border border-slate-200 shadow-xl p-8 backdrop-blur-sm">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-5 flex-1">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-lg flex-shrink-0">
                    <BarChart3 className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                      <span className="text-xs uppercase tracking-widest text-blue-600 font-bold">
                        Analytics
                      </span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-3">
                      Cost Intelligence Dashboard
                    </h1>
                    <p className="text-slate-600 max-w-xl leading-relaxed text-sm">
                      Monitor cloud billing imports, surface risks, and uncover
                      infrastructure analytics in one polished view.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end xl:flex-col xl:items-end">
                  <div className="flex items-center gap-2 rounded-3xl bg-slate-100 px-4 py-3">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700 font-medium">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-3xl bg-rose-600 px-4 py-3 text-white shadow-sm hover:bg-rose-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {(function createCards() {
                const totalRows = items.reduce(
                  (sum, dataset) => sum + dataset.rowCount,
                  0,
                );

                const latestDataset = items[0];

                const totalSpend = awsCosts.reduce(
                  (sum, item) => sum + item.cost,
                  0,
                );

                const maxDay = awsCosts.reduce(
                  (a, b) => (a.cost > b.cost ? a : b),
                  awsCosts[0] || { date: "", cost: 0 },
                );

                const cards = [
                  {
                    label: "Datasets ingested",
                    value: `${items.length}`,
                    accent:
                      "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900",
                    icon: FileText,
                    change: `${totalRows.toLocaleString()} records imported`,
                  },
                  {
                    label: "Total spend",
                    value: `$${(totalSpend ?? 0).toFixed(2)}`,

                    accent:
                      "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900",
                    icon: DollarSign,
                    change:
                      maxDay.cost > 0
                        ? `Highest: $${maxDay.cost.toFixed(2)}`
                        : "AWS Free Tier Active",
                  },
                  {
                    label: "Active regions",
                    value:
                      items.length > 0 && summary.activeRegions > 0
                        ? `${summary.activeRegions}`
                        : "--",

                    accent:
                      "bg-gradient-to-br from-green-50 to-green-100 text-green-900",
                    icon: Globe,
                    change: `${summary.recommendationsCount} insights generated`,
                  },
                  {
                    label: "AI findings",
                    value: `${insights.length}`,

                    accent:
                      "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900",
                    icon: Sparkles,
                    change: `${summary.highSeverity} critical alerts`,
                  },
                  {
                    label: "Latest import",
                    value: latestDataset?.filename ?? "No upload yet",
                    accent:
                      "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-900",
                    icon: Activity,
                    change: latestDataset
                      ? `Status: ${latestDataset.status}`
                      : "Awaiting data",
                  },
                ];

                return cards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.label}
                      className={`rounded-3xl border border-slate-300 p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all ${card.accent}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-lg bg-white/60 p-2 backdrop-blur-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">
                        {card.label}
                      </p>

                      <p className="text-3xl font-bold mb-2">{card.value}</p>

                      <p className="text-xs opacity-60">{card.change}</p>
                    </div>
                  );
                });
              })()}
            </section>
            <CostChart data={awsCosts} />
            <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-lg">
                <div className="flex items-start justify-between gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                      <p className="text-xs uppercase tracking-widest text-blue-600 font-bold">
                        AI Insights
                      </p>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Actionable alerts from your cloud spend
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">
                      Real-time anomaly detection and optimization
                      recommendations
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-4 text-blue-600 shrink-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-3">
                  {insights.length > 0 ? (
                    insights.map((insight, idx) => {
                      const severityColor = {
                        high: "border-rose-200 bg-gradient-to-r from-rose-50/50 to-transparent",
                        medium:
                          "border-amber-200 bg-gradient-to-r from-amber-50/50 to-transparent",
                        low: "border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent",
                      }[insight.severity];

                      const severityBg = {
                        high: "bg-rose-600",
                        medium: "bg-amber-600",
                        low: "bg-blue-600",
                      }[insight.severity];

                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border ${severityColor} p-4 hover:shadow-md transition-all group`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`${severityBg} text-white w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold rounded-full`}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-900 text-sm font-semibold">
                                {insight.title}
                              </p>
                              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-slate-500 text-sm">
                        Upload a dataset to see AI insights
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] bg-gradient-to-br from-rose-900/95 to-rose-950 border border-rose-800 p-8 shadow-xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-800/20 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="rounded-xl bg-rose-800/50 p-3 backdrop-blur-sm">
                      <AlertTriangle className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-rose-300 font-bold">
                        Risk Alerts
                      </p>
                      <h3 className="text-lg font-bold mt-1">
                        {alertCount} actionable cost findings
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {insights
                      .filter((i) => i.severity === "high")
                      .slice(0, 3)
                      .map((insight, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-rose-100 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-amber-300 flex-shrink-0" />
                          {insight.title}
                        </div>
                      ))}
                    {insights.filter((i) => i.severity === "high").length ===
                      0 && (
                      <div className="text-rose-100 text-sm">
                        No critical alerts
                      </div>
                    )}
                  </div>
                  <p className="text-rose-100 text-sm leading-6 border-t border-rose-700/50 pt-4">
                    {alertCount > 0
                      ? "Act on the high severity findings to optimize costs."
                      : "Monitor your cloud spend for cost optimization opportunities."}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
              <section
                id="upload"
                className="rounded-[32px] bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 p-8 shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-start gap-3 mb-6">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-600 font-bold">
                      Import Data
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      Cloud Billing
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Upload CSV or JSON files to begin cloud cost analysis and
                  AI-powered insights.
                </p>
                <UploadForm
                  onUploaded={load}
                  onInsights={updateInsights}
                  onSummary={(newSummary) =>
                    setSummary((prev) => ({
                      ...prev,
                      ...(newSummary as Partial<DashboardSummary>),
                    }))
                  }
                />
              </section>

              <section
                id="datasets"
                className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-slate-900 to-slate-700 rounded-full"></div>
                      <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                        Processing Queue
                      </p>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Cost Intelligence Feed
                    </h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {items.length} files
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Monitor imported datasets, processing status, and analytics
                  readiness in real-time.
                </p>
                <DatasetList items={items} />
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
