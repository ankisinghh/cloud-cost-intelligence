export interface Insight {
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
}

export interface InsightSummary {
  totalRows: number;
  totalSpend: number | null;
  topService: string | null;
  topServiceShare: number | null;
  activeRegions: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  recommendationsCount: number;
}

export interface Recommendation {
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
}

export function generateInsights(costs: any[]) {
  const insights: Recommendation[] = [];

  const totalSpend = costs.reduce(
    (sum, item) => sum + item.cost,
    0,
  );

  const avgSpend = costs.length > 0 ? totalSpend / costs.length : 0;

  const highestDay = costs.reduce(
    (a, b) => (a.cost > b.cost ? a : b),
    costs[0] || { cost: 0 },
  );

  // FREE TIER
  if (totalSpend === 0) {
    insights.push({
      severity: "low",
      title: "AWS Free Tier Active",
      description: "No significant AWS billing detected.",
      recommendation: "Deploy workloads to begin cloud cost analysis.",
    });
  }

  // HIGH SPEND
  if (totalSpend > 50) {
    insights.push({
      severity: "high",
      title: "High Cloud Spend",
      description: `Total AWS spend reached $${totalSpend.toFixed(2)}.`,
      recommendation: "Review EC2, S3, and networking costs.",
    });
  }

  // COST SPIKE
  if (highestDay.cost > avgSpend * 2 && highestDay.cost > 0) {
    insights.push({
      severity: "medium",
      title: "Daily Spend Spike",
      description: `Unusual spend spike detected on ${highestDay.date}.`,
      recommendation: "Investigate workload scaling or idle resources.",
    });
  }

  return insights;
}

// Backwards-compatible summary for existing dataset flow.
export function generateInsightSummary(
  rows: any[],
  insights: Recommendation[] = generateInsights(
    rows.map((r: any) => ({ date: r?.date ?? "", cost: r?.cost ?? 0 })),
  ),
): InsightSummary {
  const totalRows = rows.length;

  const totalSpend = rows.reduce((sum, item) => sum + (item?.cost ?? 0), 0);

  const severityCounts = insights.reduce(
    (counts, insight) => {
      if (insight.severity === "high") counts.high += 1;
      if (insight.severity === "medium") counts.medium += 1;
      if (insight.severity === "low") counts.low += 1;
      return counts;
    },
    { high: 0, medium: 0, low: 0 },
  );

  return {
    totalRows,
    totalSpend: totalSpend > 0 ? totalSpend : null,
    topService: null,
    topServiceShare: null,
    activeRegions: 0,
    highSeverity: severityCounts.high,
    mediumSeverity: severityCounts.medium,
    lowSeverity: severityCounts.low,
    recommendationsCount: insights.length,
  };
}

