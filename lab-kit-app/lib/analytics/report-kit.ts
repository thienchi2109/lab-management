import { z } from "zod";

import {
  AnalyticsUnboundedQueryError,
  type AnalyticsActor,
} from "./operations";
import {
  AnalyticsQueryValidationError,
  MAX_ANALYTICS_PAGE,
  MAX_ANALYTICS_PAGE_SIZE,
  type AnalyticsFilters,
  type AnalyticsQuery,
} from "./query";

/** Dòng nguồn tối thiểu để tạo hợp đồng biểu đồ báo cáo kit/mẫu. */
export type ReportKitAnalyticsSourceRow = {
  companyId: string | null;
  customerId: string | null;
  customerName: string | null;
  generalPcrConclusion: string | null;
  kitBatchId: string | null;
  kitTypeName: string | null;
  sampleId: string;
  sampleTypeName: string | null;
};

/** Metric của một lát biểu đồ báo cáo kit/mẫu. */
export type ReportKitAnalyticsSegment = {
  key: string;
  label: string;
  metrics: Partial<
    Record<"cleanCount" | "sampleCount" | "totalKitQuantity", number>
  >;
};

/** Một dataset biểu đồ đã ổn định tên contract. */
export type ReportKitAnalyticsDataset = {
  chartId: ReportKitAnalyticsChartId;
  segments: ReportKitAnalyticsSegment[];
  warnings: string[];
};

/** Chart id được phép cho hợp đồng biểu đồ báo cáo kit/mẫu. */
export type ReportKitAnalyticsChartId =
  | "cleanShrimpPlByGeneralPcrConclusion"
  | "kitQuantityByKitType"
  | "kitQuantityBySampleType"
  | "sampleCountByClassification";

/** Hợp đồng dữ liệu cho 4 biểu đồ báo cáo kit/mẫu. */
export type ReportKitAnalyticsContract = {
  charts: ReportKitAnalyticsChartId[];
  datasets: {
    cleanShrimpPlByGeneralPcrConclusion: ReportKitAnalyticsDataset;
    kitQuantityByKitType: ReportKitAnalyticsDataset;
    kitQuantityBySampleType: ReportKitAnalyticsDataset;
    sampleCountByClassification: ReportKitAnalyticsDataset;
  };
  filterSummary: string[];
  query: AnalyticsQuery;
};

/** Query báo cáo kit/mẫu đã parse riêng khỏi pivot analytics công khai. */
export type ReportKitAnalyticsQuery = AnalyticsQuery & {
  charts: ReportKitAnalyticsChartId[];
};

/** Cổng đọc rows báo cáo kit/mẫu đã scope theo tổ chức. */
export type ReportKitAnalyticsReadPort = {
  listReportRows(input: {
    organizationId: string;
    query: ReportKitAnalyticsQuery;
  }): Promise<ReportKitAnalyticsSourceRow[]>;
};

const UNKNOWN_SAMPLE_TYPE = "Không rõ loại mẫu";
const UNKNOWN_KIT_TYPE = "Không rõ loại KIT";
const CUSTOMER_LABEL = "Mẫu khách hàng";
const INTERNAL_LABEL = "Mẫu nội bộ";
const EMPTY_CONCLUSION_LABEL = "Chưa có kết quả PCR";
const CLEAN_LABEL = "SẠCH";
const INFECTED_LABEL = "NHIỄM";
const CLEAN_PATTERN = /SẠCH/i;
const INFECTED_PATTERN = /NHIỄM|POSITIVE|DƯƠNG/i;
const SHRIMP_PL_PATTERN = /(^|\s)tôm\s*pl(\s|$)/i;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;
/** Danh sách chart id hợp lệ cho hợp đồng báo cáo kit/mẫu. */
export const REPORT_KIT_ANALYTICS_CHART_IDS = [
  "kitQuantityBySampleType",
  "kitQuantityByKitType",
  "sampleCountByClassification",
  "cleanShrimpPlByGeneralPcrConclusion",
] as const satisfies readonly ReportKitAnalyticsChartId[];

const idSchema = z.string().refine((value) => SAFE_ID_PATTERN.test(value));
const isoDateSchema = z.string().refine(isValidIsoDate);
const filtersSchema = z.strictObject({
  companyId: idSchema.optional(),
  customerId: idSchema.optional(),
  kitTypeId: idSchema.optional(),
  receivedFrom: isoDateSchema.optional(),
  receivedTo: isoDateSchema.optional(),
  sampleTypeId: idSchema.optional(),
  status: z
    .enum(["archived", "completed", "draft", "in_progress", "received"])
    .optional(),
});
const querySchema = z.strictObject({
  charts: z
    .array(z.enum(REPORT_KIT_ANALYTICS_CHART_IDS))
    .min(1)
    .max(4)
    .optional(),
  filters: filtersSchema.optional(),
  page: z.coerce.number().int().positive().max(MAX_ANALYTICS_PAGE).optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

/** Parse unknown input thành query riêng cho hợp đồng báo cáo kit/mẫu. */
export function parseReportKitAnalyticsQuery(
  input: unknown
): ReportKitAnalyticsQuery {
  const result = querySchema.safeParse(input);

  if (!result.success) {
    throw new AnalyticsQueryValidationError();
  }

  const page = result.data.page ?? 1;
  const pageSize = Math.min(
    result.data.pageSize ?? 50,
    MAX_ANALYTICS_PAGE_SIZE
  );
  const filters = result.data.filters ?? {};

  return {
    charts: result.data.charts ?? [...REPORT_KIT_ANALYTICS_CHART_IDS],
    dimensions: ["sampleType", "kitType"],
    filterSummary: buildFilterSummary(filters),
    filters,
    limit: pageSize,
    measures: ["sampleCount"],
    offset: (page - 1) * pageSize,
    page,
    pageSize,
  };
}

/** Parse input và trả về hợp đồng 4 dataset biểu đồ báo cáo kit/mẫu. */
export async function listReportKitAnalyticsContract(
  input: unknown,
  actor: AnalyticsActor,
  port: ReportKitAnalyticsReadPort
): Promise<ReportKitAnalyticsContract> {
  const query = parseReportKitAnalyticsQuery(input);

  if (Object.keys(query.filters).length === 0) {
    throw new AnalyticsUnboundedQueryError();
  }

  const rows = await port.listReportRows({
    organizationId: actor.organizationId,
    query,
  });

  return {
    ...buildReportKitAnalyticsContract(rows),
    charts: query.charts,
    filterSummary: query.filterSummary,
    query,
  };
}

/** Build 4 dataset biểu đồ báo cáo kit/mẫu từ rows đã đọc và normalize. */
export function buildReportKitAnalyticsContract(
  rows: ReportKitAnalyticsSourceRow[]
): Omit<ReportKitAnalyticsContract, "filterSummary" | "query"> {
  return {
    charts: [...REPORT_KIT_ANALYTICS_CHART_IDS],
    datasets: {
      kitQuantityBySampleType: buildKitQuantityBySampleType(rows),
      kitQuantityByKitType: buildKitQuantityByKitType(rows),
      sampleCountByClassification: buildSampleCountByClassification(rows),
      cleanShrimpPlByGeneralPcrConclusion:
        buildCleanShrimpPlByGeneralPcrConclusion(rows),
    },
  };
}

function buildFilterSummary(filters: AnalyticsFilters): string[] {
  const summary: string[] = [];

  if (filters.receivedFrom || filters.receivedTo) {
    summary.push("Khoảng ngày đã chọn");
  }
  if (filters.companyId) summary.push("Công ty đã chọn");
  if (filters.customerId) summary.push("Khách hàng đã chọn");
  if (filters.sampleTypeId) summary.push("Loại mẫu đã chọn");
  if (filters.kitTypeId) summary.push("Loại KIT đã chọn");
  if (filters.status) summary.push("Trạng thái đã chọn");

  return summary.length > 0 ? summary : ["Chưa áp dụng bộ lọc"];
}

function buildKitQuantityBySampleType(
  rows: ReportKitAnalyticsSourceRow[]
): ReportKitAnalyticsDataset {
  const grouped = new Map<string, number>();

  for (const row of rows) {
    const label = valueOrFallback(row.sampleTypeName, UNKNOWN_SAMPLE_TYPE);
    grouped.set(label, (grouped.get(label) ?? 0) + kitQuantity(row));
  }

  return dataset("kitQuantityBySampleType", grouped, "totalKitQuantity");
}

function buildKitQuantityByKitType(
  rows: ReportKitAnalyticsSourceRow[]
): ReportKitAnalyticsDataset {
  const grouped = new Map<string, number>();

  for (const row of rows) {
    if (!row.kitBatchId) continue;
    const label = valueOrFallback(row.kitTypeName, UNKNOWN_KIT_TYPE);
    grouped.set(label, (grouped.get(label) ?? 0) + 1);
  }

  return dataset("kitQuantityByKitType", grouped, "totalKitQuantity");
}

function buildSampleCountByClassification(
  rows: ReportKitAnalyticsSourceRow[]
): ReportKitAnalyticsDataset {
  const grouped = new Map<string, number>();

  for (const row of rows) {
    const label = isCustomerSample(row) ? CUSTOMER_LABEL : INTERNAL_LABEL;
    grouped.set(label, (grouped.get(label) ?? 0) + 1);
  }

  return dataset("sampleCountByClassification", grouped, "sampleCount");
}

function buildCleanShrimpPlByGeneralPcrConclusion(
  rows: ReportKitAnalyticsSourceRow[]
): ReportKitAnalyticsDataset {
  const grouped = new Map<string, number>();

  for (const row of rows) {
    if (!isShrimpPl(row.sampleTypeName)) continue;
    const label = normalizeGeneralPcrConclusion(row.generalPcrConclusion);
    const cleanCount = label === CLEAN_LABEL ? 1 : 0;
    grouped.set(label, (grouped.get(label) ?? 0) + cleanCount);
  }

  return dataset("cleanShrimpPlByGeneralPcrConclusion", grouped, "cleanCount");
}

function dataset(
  chartId: ReportKitAnalyticsDataset["chartId"],
  grouped: Map<string, number>,
  metric: keyof ReportKitAnalyticsSegment["metrics"]
): ReportKitAnalyticsDataset {
  return {
    chartId,
    segments: [...grouped].map(([label, value]) => ({
      key: label,
      label,
      metrics: { [metric]: value },
    })),
    warnings: [],
  };
}

function isCustomerSample(row: ReportKitAnalyticsSourceRow) {
  return Boolean(
    row.customerId || row.companyId || valueOrFallback(row.customerName, "")
  );
}

function kitQuantity(row: ReportKitAnalyticsSourceRow) {
  return row.kitBatchId ? 1 : 0;
}

function normalizeGeneralPcrConclusion(value: string | null) {
  const normalized = valueOrFallback(value, "");

  if (CLEAN_PATTERN.test(normalized)) return CLEAN_LABEL;
  if (INFECTED_PATTERN.test(normalized)) return INFECTED_LABEL;

  return EMPTY_CONCLUSION_LABEL;
}

function isShrimpPl(value: string | null) {
  return SHRIMP_PL_PATTERN.test(valueOrFallback(value, ""));
}

function valueOrFallback(value: string | null, fallback: string) {
  const normalized = value?.trim();

  return normalized ? normalized : fallback;
}

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
