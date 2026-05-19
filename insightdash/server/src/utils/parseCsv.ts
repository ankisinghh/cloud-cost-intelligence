import Papa from "papaparse";

export interface ParsedFile {
  columns: string[];
  rows: Record<string, unknown>[];
}

export function parseCsvBuffer(buf: Buffer): ParsedFile {
  const text = buf.toString("utf8");
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  if (result.errors.length) {
    const first = result.errors[0];
    throw new Error(`CSV parse error: ${first.message} (row ${first.row})`);
  }
  const columns = result.meta.fields ?? [];
  return { columns, rows: result.data };
}