import { Response } from "express";
import fs from "fs/promises";
import Papa from "papaparse";
import { Dataset } from "../models/Dataset";
import { Insight } from "../models/Insight";
import { buildPdfReport } from "../utils/pdfReport";
import type { AuthedRequest } from "../middleware/auth";

export async function exportCsv(req: AuthedRequest, res: Response) {
  const ds = await Dataset.findOne({ _id: req.params.id, userId: req.userId });
  if (!ds) return res.status(404).json({ error: "Not found" });
  const buf = await fs.readFile(ds.storagePath!);
  const parsed = JSON.parse(buf.toString("utf8")) as {
    columns: string[];
    rows: Record<string, unknown>[];
  };
  const csv = Papa.unparse({ fields: parsed.columns, data: parsed.rows.map((r) => parsed.columns.map((c) => r[c] ?? "")) });
  const safeName = ds.filename.replace(/[^a-z0-9._-]/gi, "_");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.csv"`);
  res.send(csv);
}

export async function exportPdf(req: AuthedRequest, res: Response) {
  const ds = await Dataset.findOne({ _id: req.params.id, userId: req.userId });
  if (!ds) return res.status(404).json({ error: "Not found" });
  const ins = await Insight.findOne({ datasetId: ds._id });
  if (!ins) return res.status(409).json({ error: "Insights not ready" });
  const stream = buildPdfReport({
    filename: ds.filename,
    rowCount: ds.rowCount,
    stats: ins.stats as any,
  });
  const safeName = ds.filename.replace(/[^a-z0-9._-]/gi, "_");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
  stream.pipe(res);
}