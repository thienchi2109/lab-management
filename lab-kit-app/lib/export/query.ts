import { z } from "zod";

import type { SampleGridSortKey } from "@/lib/sample-grid/query";
import {
  SAMPLE_BILLING_STATUSES,
  SAMPLE_STATUSES,
  type SampleBillingStatus,
  type SampleStatus,
} from "@/lib/sample-metadata/schemas";

/** Số dòng mặc định cho một request export MVP. */
export const DEFAULT_EXPORT_ROW_LIMIT = 1_000;

/** Hard cap số dòng export để tránh đọc dataset quá rộng trong MVP. */
export const EXPORT_HARD_ROW_LIMIT = 5_000;

/** Dataset export được phép nhận từ client ở US-011A/US-011C. */
export type ExportDataset = "samples" | "results-normalized";

/** Định dạng file export được whitelist. */
export type ExportFormat = "csv" | "xlsx";

/** Field export mẫu được whitelist. */
export type SampleExportField =
  | "billingStatus"
  | "customerName"
  | "kitBatch"
  | "receivedAt"
  | "sampleCode"
  | "sampleType"
  | "status"
  | "updatedAt";

/** Field export kết quả chuẩn hóa được whitelist. */
export type NormalizedResultsExportField =
  | "customerName"
  | "groupCode"
  | "groupName"
  | "kqChung"
  | "metricCode"
  | "metricName"
  | "metricUnit"
  | "receivedAt"
  | "sampleCode"
  | "sampleType"
  | "status"
  | "value";

/** Field export được whitelist theo từng dataset. */
export type ExportField = SampleExportField | NormalizedResultsExportField;

/** Bộ lọc export đã parse từ input chưa tin cậy. */
export type ExportFilters = {
  billingStatus?: SampleBillingStatus;
  companyId?: string;
  kitBatchId?: string;
  receivedFrom?: string;
  receivedTo?: string;
  sampleTypeId?: string;
  status?: SampleStatus;
};

/** Phần query export chung đã normalize. */
export type BaseExportQuery<
  TDataset extends ExportDataset,
  TField extends ExportField,
> = {
  dataset: TDataset;
  fields: TField[];
  filters: ExportFilters;
  format: ExportFormat;
  rowLimit: number;
  search: string | null;
  sort: {
    direction: "asc" | "desc";
    key: SampleGridSortKey;
  };
};

/** Query export mẫu đã normalize. */
export type SampleExportQuery = BaseExportQuery<"samples", SampleExportField>;

/** Query export kết quả chuẩn hóa đã normalize. */
export type NormalizedResultsExportQuery = BaseExportQuery<
  "results-normalized",
  NormalizedResultsExportField
>;

/** Query export đã normalize trước khi route hoặc read port đọc dữ liệu. */
export type ExportQuery = SampleExportQuery | NormalizedResultsExportQuery;

/** Lỗi contract export có code ổn định cho API route tương lai. */
export class ExportQueryValidationError extends Error {
  /** Mã lỗi có thể đưa vào response JSON có cấu trúc. */
  readonly code: "export_query_invalid" | "export_row_limit_exceeded";

  constructor(
    code:
      | "export_query_invalid"
      | "export_row_limit_exceeded" = "export_query_invalid",
    message = "Truy vấn export không hợp lệ."
  ) {
    super(message);
    this.name = "ExportQueryValidationError";
    this.code = code;
  }
}

const EXPORT_FORMATS = ["csv", "xlsx"] as const;
const SAMPLE_EXPORT_FIELDS = [
  "billingStatus",
  "customerName",
  "kitBatch",
  "receivedAt",
  "sampleCode",
  "sampleType",
  "status",
  "updatedAt",
] as const;
const NORMALIZED_RESULTS_EXPORT_FIELDS = [
  "customerName",
  "groupCode",
  "groupName",
  "kqChung",
  "metricCode",
  "metricName",
  "metricUnit",
  "receivedAt",
  "sampleCode",
  "sampleType",
  "status",
  "value",
] as const;
const SAMPLE_EXPORT_SORT_KEYS = [
  "billingStatus",
  "customerName",
  "receivedAt",
  "sampleCode",
  "status",
  "updatedAt",
] as const satisfies readonly SampleGridSortKey[];
const DEFAULT_SORT: ExportQuery["sort"] = {
  direction: "desc",
  key: "receivedAt",
};
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;
const MAX_SEARCH_LENGTH = 100;

const idSchema = z.string().refine((value) => SAFE_ID_PATTERN.test(value));
const isoDateSchema = z.string().refine(isValidIsoDate);
const filterSchema = z.strictObject({
  billingStatus: z.enum(SAMPLE_BILLING_STATUSES).optional(),
  companyId: idSchema.optional(),
  kitBatchId: idSchema.optional(),
  receivedFrom: isoDateSchema.optional(),
  receivedTo: isoDateSchema.optional(),
  sampleTypeId: idSchema.optional(),
  status: z.enum(SAMPLE_STATUSES).optional(),
});
const sortSchema = z.strictObject({
  direction: z.enum(["asc", "desc"]).optional(),
  key: z.enum(SAMPLE_EXPORT_SORT_KEYS),
});
const baseQueryShape = {
  filters: filterSchema.optional(),
  format: z.enum(EXPORT_FORMATS),
  rowLimit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sort: sortSchema.optional(),
};
const sampleQuerySchema = z.strictObject({
  dataset: z.literal("samples"),
  fields: z
    .array(z.enum(SAMPLE_EXPORT_FIELDS))
    .min(1)
    .max(SAMPLE_EXPORT_FIELDS.length),
  ...baseQueryShape,
});
const normalizedResultsQuerySchema = z.strictObject({
  dataset: z.literal("results-normalized"),
  fields: z
    .array(z.enum(NORMALIZED_RESULTS_EXPORT_FIELDS))
    .min(1)
    .max(NORMALIZED_RESULTS_EXPORT_FIELDS.length),
  ...baseQueryShape,
});
const querySchema = z.discriminatedUnion("dataset", [
  sampleQuerySchema,
  normalizedResultsQuerySchema,
]);

/** Parse input export chưa tin cậy vào contract query nghiêm ngặt. */
export function parseExportQuery(input: unknown): ExportQuery {
  const result = querySchema.safeParse(input);

  if (!result.success) {
    throw new ExportQueryValidationError();
  }

  const rowLimit = result.data.rowLimit ?? DEFAULT_EXPORT_ROW_LIMIT;

  if (rowLimit > EXPORT_HARD_ROW_LIMIT) {
    throw new ExportQueryValidationError(
      "export_row_limit_exceeded",
      "Vượt giới hạn số dòng export."
    );
  }

  const baseQuery = {
    filters: result.data.filters ?? {},
    format: result.data.format,
    rowLimit,
    search: normalizeSearch(result.data.search),
    sort: normalizeSort(result.data.sort),
  };

  if (result.data.dataset === "samples") {
    return {
      ...baseQuery,
      dataset: result.data.dataset,
      fields: result.data.fields,
    };
  }

  return {
    ...baseQuery,
    dataset: result.data.dataset,
    fields: result.data.fields,
  };
}

function normalizeSort(sort: z.infer<typeof sortSchema> | undefined) {
  if (!sort) {
    return DEFAULT_SORT;
  }

  return {
    direction: sort.direction ?? DEFAULT_SORT.direction,
    key: sort.key,
  };
}

function normalizeSearch(value: string | undefined) {
  const search = value?.trim().replace(/\s+/g, " ") ?? "";

  return search.length > 0 ? search.slice(0, MAX_SEARCH_LENGTH) : null;
}

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
