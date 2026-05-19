import PdfPrinter from "pdfmake";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { ColumnStats } from "./stats";

const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

export function buildPdfReport(opts: {
  filename: string;
  rowCount: number;
  stats: ColumnStats[];
}): NodeJS.ReadableStream {
  const tableBody: any[][] = [
    [
      { text: "Column", bold: true },
      { text: "Type", bold: true },
      { text: "Count", bold: true },
      { text: "Unique", bold: true },
      { text: "Min", bold: true },
      { text: "Max", bold: true },
      { text: "Avg", bold: true },
    ],
  ];
  for (const s of opts.stats) {
    tableBody.push([
      s.column,
      s.type,
      s.count,
      s.unique,
      s.min ?? "—",
      s.max ?? "—",
      s.avg !== undefined ? s.avg.toFixed(2) : "—",
    ]);
  }

  const docDef: TDocumentDefinitions = {
    content: [
      { text: "InsightDash Report", style: "header" },
      { text: opts.filename, margin: [0, 0, 0, 4] },
      { text: `Rows: ${opts.rowCount}`, margin: [0, 0, 0, 12] },
      { text: "Column Statistics", style: "subheader" },
      {
        table: { headerRows: 1, body: tableBody, widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto"] },
        layout: "lightHorizontalLines",
      },
    ],
    styles: {
      header: { fontSize: 20, bold: true, margin: [0, 0, 0, 8] },
      subheader: { fontSize: 14, bold: true, margin: [0, 8, 0, 6] },
    },
    defaultStyle: { fontSize: 10 },
  };

  const doc = printer.createPdfKitDocument(docDef);
  doc.end();
  return doc;
}