import { buildTabularExportFile, type TabularExportFile } from "./files";
import { assertExportRowCountWithinLimit } from "./limits";
import type { ExportActor } from "./permissions";
import type { SampleExportField, SampleExportQuery } from "./query";
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
export type SampleExportFile = TabularExportFile;

type BuildSampleExportOptions = {
  generatedAt?: Date;
};

const SAMPLE_EXPORT_COLUMNS: Record<
  SampleExportField,
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

/** Tạo file export mẫu có giới hạn dòng và scope tenant từ grid port chung. */
export async function buildSampleExportFile(
  query: SampleExportQuery,
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
  assertExportRowCountWithinLimit(result.totalCount, query.rowLimit);
  const rows = toTableRows(query.fields, result.rows);

  return await buildTabularExportFile({
    basename: "mau-xet-nghiem",
    format: query.format,
    generatedAt: options.generatedAt,
    rows,
    sheetName: "Mẫu xét nghiệm",
  });
}

function toTableRows(fields: SampleExportField[], rows: SampleGridRow[]) {
  const columns = fields.map((field) => SAMPLE_EXPORT_COLUMNS[field]);

  return [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => column.value(row))),
  ];
}
