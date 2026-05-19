import { env } from "../config/env";

/**
 * Cloud mode: POST { datasetId } to a Lambda / Cloud Function URL.
 * The remote handler should run the same logic as utils/stats.ts and
 * write the Insight document directly to MongoDB.
 *
 * Example Lambda handler (deploy separately):
 *
 *   import { analyze } from "./stats";
 *   import { Insight } from "./Insight";
 *   export const handler = async (event) => {
 *     const { datasetId } = JSON.parse(event.body);
 *     // load rows from S3 / Mongo, then:
 *     const result = analyze(rows, columns);
 *     await Insight.findOneAndUpdate({ datasetId }, { datasetId, ...result });
 *     return { statusCode: 200, body: "ok" };
 *   };
 */
export async function triggerCloudAnalysis(datasetId: string): Promise<void> {
  if (!env.cloudAnalysisUrl) throw new Error("CLOUD_ANALYSIS_URL not set");
  const res = await fetch(env.cloudAnalysisUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.cloudAnalysisToken ? { Authorization: `Bearer ${env.cloudAnalysisToken}` } : {}),
    },
    body: JSON.stringify({ datasetId }),
  });
  if (!res.ok) {
    throw new Error(`Cloud analysis failed: ${res.status} ${await res.text()}`);
  }
}