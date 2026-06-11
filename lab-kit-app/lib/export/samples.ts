import { utils, write } from "xlsx";

import type { ExportActor } from "./permissions";
import type { ExportField, ExportQuery } from "./query";
import type {
  SampleGridPort,
  SampleGridRow,
} from "@/lib/sample-grid/operations";
import {
  billingStatusLabels,
  sampleStatusLabels,
} from "@/lib/sample-metadata/labels";
import type {
  SampleBillingStatus,
  SampleStatus,
} from "@/lib/sample-metadata/schemas";

/** Actor đã được kiểm tra quyền export mẫu và scope tenant. */
export type SampleExportActor = ExportActor;

/** File export đã sẵn sàng trả về từ route handler. */
export type SampleExportFile = {
  body: Buffer;
  contentType: string;
  filename: string;
};

type BuildSampleExportOptions = {
  generatedAt?: Date;
};

const SAMPLE_EXPORT_COLUMNS: Record<
  ExportField,
  {
    header: string;
    value(row: SampleGridRow): string;
  }
> = {
  billingStatus: {
    header: "Thanh toán",
    value: (row) =>
      billingStatusLabels[row.billingStatus as SampleBillingStatus] ??
      row.billingStatus,
  },
  customerName: {
    header: "Khách hàng",
    value: (row) => row.customerName ?? "",
  },
  kitBatch: {
    header: "KIT",
    value: (row) => row.kitSummary,
  },
  receivedAt: {
    header: "Ngày nhận",
    value: (row) => row.receivedAt,
  },
  sampleCode: {
    header: "Mã mẫu",
    value: (row) => row.sampleCode,
  },
  sampleType: {
    header: "Loại mẫu",
    value: (row) => row.sampleTypeName,
  },
  status: {
    header: "Trạng thái",
    value: (row) =>
      sampleStatusLabels[row.status as SampleStatus] ?? row.status,
  },
  updatedAt: {
    header: "Cập nhật lúc",
    value: (row) => row.updatedAt,
  },
};

/** Build a bounded tenant-scoped sample export file from the shared grid port. */
export async function buildSampleExportFile(
  query: ExportQuery,
  actor: SampleExportActor,
  port: SampleGridPort,
  options: BuildSampleExportOptions = {}
): Promise<SampleExportFile> {
  const result = await port.listSamples({
    organizationId: actor.organizationId,
    query: {
      filters: query.filters,
      limit: query.rowLimit,
      offset: 0,
      page: 1,
      pageSize: query.rowLimit,
      resultColumnKeys: [],
      search: query.search,
      sort: query.sort,
    },
  });
  const rows = toTableRows(query.fields, result.rows);
  const dateStamp = formatDateStamp(options.generatedAt ?? new Date());

  if (query.format === "xlsx") {
    return {
      body: toXlsxBuffer(rows),
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `mau-xet-nghiem-${dateStamp}.xlsx`,
    };
  }

  return {
    body: Buffer.from(toCsv(rows), "utf8"),
    contentType: "text/csv; charset=utf-8",
    filename: `mau-xet-nghiem-${dateStamp}.csv`,
  };
}

function toTableRows(fields: ExportField[], rows: SampleGridRow[]) {
  const columns = fields.map((field) => SAMPLE_EXPORT_COLUMNS[field]);

  return [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => column.value(row))),
  ];
}

function toCsv(rows: string[][]) {
  const lines = rows.map((row) =>
    row.map((value) => escapeCsvValue(value)).join(",")
  );

  return lines.join("\r\n");
}

function toXlsxBuffer(rows: string[][]) {
  const worksheet = utils.aoa_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Mẫu xét nghiệm");

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
