import { buildTabularExportFile, type TabularExportFile } from "./files";
import { assertExportRowCountWithinLimit } from "./limits";
import type { ExportActor } from "./permissions";
import type {
  NormalizedResultsExportField,
  NormalizedResultsExportQuery,
} from "./query";
import type {
  SampleGridPort,
  SampleGridResultSummary,
  SampleGridRow,
} from "@/lib/sample-grid/operations";
import { sampleStatusLabels } from "@/lib/sample-metadata/labels";
import { isSampleStatus } from "@/lib/sample-metadata/schemas";
import { GROUP_CONCLUSION_DISPLAY_LABEL } from "@/lib/result-labels";

/** Actor đã được kiểm tra quyền export kết quả chuẩn hóa và scope tenant. */
export type NormalizedResultsExportActor = ExportActor;

/** Query export kết quả chuẩn hóa đã được parser whitelist. */
export type { NormalizedResultsExportQuery };

/** File export kết quả chuẩn hóa đã sẵn sàng trả về từ route handler. */
export type NormalizedResultsExportFile = TabularExportFile;

type BuildNormalizedResultsExportOptions = {
  generatedAt?: Date;
};

type NormalizedResultsExportRow = {
  customerName: string;
  groupCode: string;
  groupName: string;
  kqChung: string;
  metricCode: string;
  metricName: string;
  metricUnit: string;
  receivedAt: string;
  sampleCode: string;
  sampleType: string;
  status: string;
  value: string;
};

const RESULTS_NORMALIZED_EXPORT_COLUMNS: Record<
  NormalizedResultsExportField,
  {
    header: string;
    value(row: NormalizedResultsExportRow): string;
  }
> = {
  customerName: { header: "Khách hàng", value: (row) => row.customerName },
  groupCode: { header: "Mã nhóm", value: (row) => row.groupCode },
  groupName: { header: "Nhóm kết quả", value: (row) => row.groupName },
  kqChung: {
    header: GROUP_CONCLUSION_DISPLAY_LABEL,
    value: (row) => row.kqChung,
  },
  metricCode: { header: "Mã chỉ tiêu", value: (row) => row.metricCode },
  metricName: { header: "Chỉ tiêu", value: (row) => row.metricName },
  metricUnit: { header: "Đơn vị", value: (row) => row.metricUnit },
  receivedAt: { header: "Ngày nhận", value: (row) => row.receivedAt },
  sampleCode: { header: "Mã mẫu", value: (row) => row.sampleCode },
  sampleType: { header: "Loại mẫu", value: (row) => row.sampleType },
  status: { header: "Trạng thái mẫu", value: (row) => row.status },
  value: { header: "Giá trị", value: (row) => row.value },
};

/** Tạo file export kết quả chuẩn hóa từ sample grid và summary kết quả. */
export async function buildNormalizedResultsExportFile(
  query: NormalizedResultsExportQuery,
  actor: NormalizedResultsExportActor,
  port: SampleGridPort,
  options: BuildNormalizedResultsExportOptions = {}
): Promise<NormalizedResultsExportFile> {
  if (!port.listSampleResultSummaries) {
    throw new Error("Không thể tải summary kết quả để export.");
  }

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
  const summaries = await port.listSampleResultSummaries({
    organizationId: actor.organizationId,
    sampleIds: result.rows.map((row) => row.id),
  });
  const rows = toTableRows(query.fields, flattenRows(result.rows, summaries));

  return await buildTabularExportFile({
    basename: "ket-qua-chuan-hoa",
    format: query.format,
    generatedAt: options.generatedAt,
    rows,
    sheetName: "Kết quả chuẩn hóa",
  });
}

function flattenRows(
  samples: SampleGridRow[],
  summaries: Record<string, SampleGridResultSummary>
) {
  return samples.flatMap((sample) => {
    const summary = summaries[sample.id];
    const rows = (summary?.groups ?? []).flatMap((group) =>
      group.metrics.map((metric) =>
        createResultRow(sample, {
          groupCode: group.code,
          groupName: group.name,
          kqChung: group.kqChung ?? "",
          metricCode: metric.code,
          metricName: metric.name,
          metricUnit: metric.unit ?? "",
          value: formatResultValue(metric.value),
        })
      )
    );

    return rows.length > 0 ? rows : [createResultRow(sample)];
  });
}

function createResultRow(
  sample: SampleGridRow,
  result: Partial<NormalizedResultsExportRow> = {}
): NormalizedResultsExportRow {
  return {
    customerName: sample.customerName ?? "",
    groupCode: "",
    groupName: "",
    kqChung: "",
    metricCode: "",
    metricName: "",
    metricUnit: "",
    receivedAt: sample.receivedAt,
    sampleCode: sample.sampleCode,
    sampleType: sample.sampleTypeName,
    status: formatSampleStatus(sample.status),
    value: "",
    ...result,
  };
}

function toTableRows(
  fields: NormalizedResultsExportField[],
  rows: NormalizedResultsExportRow[]
) {
  const columns = fields.map(
    (field) => RESULTS_NORMALIZED_EXPORT_COLUMNS[field]
  );

  return [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => column.value(row))),
  ];
}

function formatSampleStatus(value: string) {
  return isSampleStatus(value) ? sampleStatusLabels[value] : value;
}

function formatResultValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts: string[] = [];

    for (const item of value) {
      const formatted = formatResultValue(item);

      if (formatted !== "") {
        parts.push(formatted);
      }
    }

    return parts.join("; ");
  }

  if (isRecord(value)) {
    const pcrText = formatPcrValue(value);

    if (pcrText) {
      return pcrText;
    }
  }

  return stringifyUnknownResultValue(value);
}

function stringifyUnknownResultValue(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "[Giá trị không thể xuất]";
  }
}

function formatPcrValue(value: Record<string, unknown>) {
  const parts: string[] = [];

  if (value.status === "positive") {
    parts.push("Dương tính");
  } else if (value.status === "negative") {
    parts.push("Âm tính");
  } else if (typeof value.status === "string") {
    parts.push(value.status);
  }

  if (typeof value.ct === "number" && Number.isFinite(value.ct)) {
    parts.push(`Ct ${value.ct}`);
  }

  return parts.join("; ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
