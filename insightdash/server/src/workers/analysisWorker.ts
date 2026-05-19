import fs from "fs/promises";
import path from "path";
import { Dataset } from "../models/Dataset";
import { Insight } from "../models/Insight";
import { analyze } from "../utils/stats";
import { generateInsights } from "../services/insightEngine";

export async function runAnalysis(datasetId: string): Promise<void> {
  const ds = await Dataset.findById(datasetId);
  if (!ds) throw new Error(`Dataset ${datasetId} not found`);
  ds.status = "processing";
  await ds.save();
  try {
    const buf = await fs.readFile(path.resolve(ds.storagePath!));
    const parsed = JSON.parse(buf.toString("utf8")) as {
      columns: string[];
      rows: Record<string, unknown>[];
    };
    const result = analyze(parsed.rows, parsed.columns);
    const recommendations = generateInsights(parsed.rows);
    await Insight.findOneAndUpdate(
      { datasetId: ds._id },
      { datasetId: ds._id, ...result, recommendations, computedAt: new Date() },
      { upsert: true, new: true }
    );
    ds.status = "completed";
    await ds.save();
  } catch (e: any) {
    ds.status = "failed";
    ds.error = e.message;
    await ds.save();
    throw e;
  }
}