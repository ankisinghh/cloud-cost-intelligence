import { Response } from "express";
import fs from "fs/promises";
import path from "path";
import { Dataset } from "../models/Dataset";
import { Insight } from "../models/Insight";
import { parseCsvBuffer } from "../utils/parseCsv";
import { parseJsonBuffer } from "../utils/parseJson";
import { runAnalysis } from "../workers/analysisWorker";
import { triggerCloudAnalysis } from "../services/cloudAnalysis";
import { generateInsights, generateInsightSummary } from "../services/insightEngine";
import { env } from "../config/env";
import type { AuthedRequest } from "../middleware/auth";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export async function uploadDataset(req: AuthedRequest, res: Response) {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Missing file" });

  const isCsv =
    file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv");
  const parsed = isCsv ? parseCsvBuffer(file.buffer) : parseJsonBuffer(file.buffer);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ds = await Dataset.create({
    userId: req.userId,
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    columnNames: parsed.columns,
    rowCount: parsed.rows.length,
    status: "pending",
    storagePath: "", // set below
  });

  const storagePath = path.join(UPLOAD_DIR, `${ds._id.toString()}.json`);
  await fs.writeFile(storagePath, JSON.stringify(parsed));
  ds.storagePath = storagePath;
  await ds.save();

  // Generate insights synchronously for immediate response
  const insights = generateInsights(parsed.rows);
  const summary = generateInsightSummary(parsed.rows, insights);
  console.log("[insights-generated]", {
    datasetId: ds._id.toString(),
    filename: ds.filename,
    rowCount: parsed.rows.length,
    insightCount: insights.length,
    summary,
  });

  // Trigger analysis (fire-and-forget)
  if (env.useCloudAnalysis) {
    triggerCloudAnalysis(ds._id.toString()).catch((e) =>
      console.error("[cloud-analysis]", e)
    );
  } else {
    setImmediate(() => {
      runAnalysis(ds._id.toString()).catch((e) => console.error("[analysis]", e));
    });
  }

  res.status(201).json({
    ...ds.toObject(),
    insights,
    summary,
  });
}

export async function listDatasets(req: AuthedRequest, res: Response) {
  const items = await Dataset.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(items);
}

export async function getDataset(req: AuthedRequest, res: Response) {
  const ds = await Dataset.findOne({ _id: req.params.id, userId: req.userId });
  if (!ds) return res.status(404).json({ error: "Not found" });
  res.json(ds);
}

export async function getInsights(req: AuthedRequest, res: Response) {
  const ds = await Dataset.findOne({ _id: req.params.id, userId: req.userId });
  if (!ds) return res.status(404).json({ error: "Not found" });

  // Try to get stored insights first (from async analysis)
  let ins = await Insight.findOne({ datasetId: ds._id });
  let summary = null;

  // If not yet analyzed, generate insights on-demand from stored data
  if (ds.storagePath) {
    try {
      const buf = await fs.readFile(ds.storagePath);
      const parsed = JSON.parse(buf.toString("utf8")) as {
        columns: string[];
        rows: Record<string, unknown>[];
      };

      if (!ins) {
        const recommendations = generateInsights(parsed.rows);
        ins = await Insight.findOneAndUpdate(
          { datasetId: ds._id },
          { datasetId: ds._id, recommendations, computedAt: new Date() },
          { upsert: true, new: true }
        );
      }

      summary = generateInsightSummary(
  parsed.rows,
  (ins?.recommendations as any) || [],
);
    } catch (e) {
      console.error("[insights-generation-error]", e);
    }
  }

  res.json({ status: ds.status, error: ds.error, insight: ins, summary });
}

export async function getRows(req: AuthedRequest, res: Response) {
  const ds = await Dataset.findOne({ _id: req.params.id, userId: req.userId });
  if (!ds) return res.status(404).json({ error: "Not found" });
  const limit = Math.min(parseInt((req.query.limit as string) || "100", 10), 1000);
  const offset = Math.max(parseInt((req.query.offset as string) || "0", 10), 0);
  const buf = await fs.readFile(ds.storagePath!);
  const parsed = JSON.parse(buf.toString("utf8")) as {
    columns: string[];
    rows: Record<string, unknown>[];
  };
  res.json({
    columns: parsed.columns,
    total: parsed.rows.length,
    rows: parsed.rows.slice(offset, offset + limit),
  });
}