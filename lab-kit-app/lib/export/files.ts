import { Buffer as NodeBuffer } from "node:buffer";

import writeExcelFile from "write-excel-file/node";

/** File export đã sẵn sàng trả về từ route handler. */
export type TabularExportFile = {
  body: NodeBuffer;
  contentType: string;
  filename: string;
};

/** Input để tạo file bảng CSV/XLSX từ rows đã normalize. */
export type BuildTabularExportFileInput = {
  basename: string;
  format: "csv" | "xlsx";
  generatedAt?: Date;
  rows: string[][];
  sheetName: string;
};

/** Tạo file CSV hoặc XLSX từ bảng string đã có header ổn định. */
export async function buildTabularExportFile(
  input: BuildTabularExportFileInput
): Promise<TabularExportFile> {
  const dateStamp = formatDateStamp(input.generatedAt ?? new Date());

  if (input.format === "xlsx") {
    return {
      body: await toXlsxBuffer(input.rows, input.sheetName),
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `${input.basename}-${dateStamp}.xlsx`,
    };
  }

  return {
    body: NodeBuffer.from(toCsv(input.rows), "utf8"),
    contentType: "text/csv; charset=utf-8",
    filename: `${input.basename}-${dateStamp}.csv`,
  };
}

function toCsv(rows: string[][]) {
  const lines = rows.map((row) =>
    row.map((value) => escapeCsvValue(value)).join(",")
  );

  return lines.join("\r\n");
}

async function toXlsxBuffer(
  rows: string[][],
  sheetName: string
): Promise<NodeBuffer> {
  return writeExcelFile(rows, { sheet: sheetName }).toBuffer();
}

function escapeCsvValue(value: string) {
  const safeValue = neutralizeFormulaValue(value);

  if (!/[",\n\r]/.test(safeValue)) {
    return safeValue;
  }

  return `"${safeValue.replaceAll('"', '""')}"`;
}

function neutralizeFormulaValue(value: string) {
  return /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function formatDateStamp(date: Date) {
  return date.toISOString().slice(0, 10);
}
