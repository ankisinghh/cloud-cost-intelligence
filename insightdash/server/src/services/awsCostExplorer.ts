import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

const client = new CostExplorerClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

function formatAwsDate(d: Date) {
  // AWS Cost Explorer expects YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function subtractDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function fetchAwsCosts() {
  // Dynamic rolling window (last 30 days up to today)
  // Note: Cost Explorer 'End' is typically exclusive, but using 'today'
  // keeps the chart aligned and avoids stale fixed ranges.
  const end = new Date();
  const start = subtractDays(30);

  const command = new GetCostAndUsageCommand({
    TimePeriod: {
      Start: formatAwsDate(start),
      End: formatAwsDate(end),
    },
    Granularity: "DAILY",
    Metrics: ["UnblendedCost"],
  });

  const response = await client.send(command);

  const resultsByTime = response.ResultsByTime || [];

  // Return a time series (daily) summing across services.
  // If AWS returns no data, this naturally yields an empty chart.
  return resultsByTime.map((item) => {
    const date = item.TimePeriod?.Start;

    // When GroupBy is omitted, AWS returns Total only.
    // Still defensively handle missing values.
    const amount = item.Total?.UnblendedCost?.Amount;

    return {
      date: date ?? "",
      cost: Number(amount || 0),
    };
  });
}

