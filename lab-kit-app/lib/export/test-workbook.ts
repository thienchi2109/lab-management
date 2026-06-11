import { Buffer as NodeBuffer } from "node:buffer";

import { readSheet } from "read-excel-file/node";

/** Đọc worksheet XLSX thành bảng string để test output export. */
export async function readWorksheetRows(
  buffer: NodeBuffer | Uint8Array,
  sheetName: string
) {
  const rows = await readSheet(NodeBuffer.from(buffer), sheetName);
  return rows.map((row) => row.map((value) => String(value ?? "")));
}
