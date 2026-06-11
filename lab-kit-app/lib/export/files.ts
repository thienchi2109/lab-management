import { utils, write } from "xlsx";

/** File export đã sẵn sàng trả về từ route handler. */
export type TabularExportFile = {
  body: Buffer;
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
export function buildTabularExportFile(
  input: BuildTabularExportFileInput
): TabularExportFile {
  const dateStamp = formatDateStamp(input.generatedAt ?? new Date());

  if (input.format === "xlsx") {
    return {
      body: toXlsxBuffer(input.rows, input.sheetName),
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `${input.basename}-${dateStamp}.xlsx`,
    };
  }

  return {
    body: Buffer.from(toCsv(input.rows), "utf8"),
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

function toXlsxBuffer(rows: string[][], sheetName: string) {
  const worksheet = utils.aoa_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, sheetName);

  return write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
}

function escapeCsvValue(value: string) {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function formatDateStamp(date: Date) {
  return date.toISOString().slice(0, 10);
}
