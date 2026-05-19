import { ParsedFile } from "./parseCsv";

export function parseJsonBuffer(buf: Buffer): ParsedFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(buf.toString("utf8"));
  } catch (e: any) {
    throw new Error(`JSON parse error: ${e.message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of objects");
  }
  const rows = parsed as Record<string, unknown>[];
  const colSet = new Set<string>();
  for (const r of rows) {
    if (r && typeof r === "object") {
      Object.keys(r).forEach((k) => colSet.add(k));
    }
  }
  return { columns: Array.from(colSet), rows };
}