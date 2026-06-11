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

/** Dataset export được phép nhận từ client ở US-011A. */
export type ExportDataset = "samples";

/** Định dạng file export được whitelist. */
export type ExportFormat = "csv" | "xlsx";

/** Field export mẫu được whitelist. */
export type ExportField =
  | "billingStatus"
  | "customerName"
  | "kitBatch"
  | "receivedAt"
  | "sampleCode"
  | "sampleType"
  | "status"
  | "updatedAt";

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

/** Query export đã normalize trước khi route hoặc read port đọc dữ liệu. */
export type ExportQuery = {
  dataset: ExportDataset;
  fields: ExportField[];
  filters: ExportFilters;
  format: ExportFormat;
  rowLimit: number;
  search: string | null;
  sort: {
    direction: "asc" | "desc";
    key: SampleGridSortKey;
  };
};

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
const EXPORT_FIELDS = [
  "billingStatus",
  "customerName",
  "kitBatch",
  "receivedAt",
  "sampleCode",
  "sampleType",
  "status",
  "updatedAt",
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
const querySchema = z.strictObject({
  dataset: z.literal("samples"),
  fields: z.array(z.enum(EXPORT_FIELDS)).min(1).max(EXPORT_FIELDS.length),
  filters: filterSchema.optional(),
  format: z.enum(EXPORT_FORMATS),
  rowLimit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sort: sortSchema.optional(),
});

/** Parse unknown export input into the strict export query contract. */
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

  return {
    dataset: result.data.dataset,
    fields: result.data.fields,
    filters: result.data.filters ?? {},
    format: result.data.format,
    rowLimit,
    search: normalizeSearch(result.data.search),
    sort: normalizeSort(result.data.sort),
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
