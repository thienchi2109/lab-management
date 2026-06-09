import { z } from "zod";

import {
  SAMPLE_STATUSES,
  type SampleStatus,
} from "@/lib/sample-metadata/schemas";

/** Page size mặc định cho analytics/pivot dataset. */
export const DEFAULT_ANALYTICS_PAGE_SIZE = 50;

/** Page size tối đa để tránh đọc analytics quá rộng. */
export const MAX_ANALYTICS_PAGE_SIZE = 200;

/** Page tối đa để tránh offset analytics quá sâu trên database quan hệ. */
export const MAX_ANALYTICS_PAGE = 500;

/** Các dimension analytics được phép nhận từ input chưa tin cậy. */
export const ANALYTICS_DIMENSIONS = [
  "receivedDate",
  "company",
  "customer",
  "sampleType",
  "kitType",
  "resultGroup",
  "pcrMetric",
] as const;

/** Các measure analytics được phép nhận từ input chưa tin cậy. */
export const ANALYTICS_MEASURES = [
  "sampleCount",
  "positiveCount",
  "cleanCount",
  "infectedCount",
  "averageValue",
] as const;

/** Dimension analytics đã whitelist. */
export type AnalyticsDimension = (typeof ANALYTICS_DIMENSIONS)[number];

/** Measure analytics đã whitelist. */
export type AnalyticsMeasure = (typeof ANALYTICS_MEASURES)[number];

/** Bộ lọc analytics đã parse từ input chưa tin cậy. */
export type AnalyticsFilters = {
  companyId?: string;
  customerId?: string;
  kitTypeId?: string;
  metricId?: string;
  receivedFrom?: string;
  receivedTo?: string;
  resultGroupId?: string;
  sampleTypeId?: string;
  status?: SampleStatus;
};

/** Query analytics đã normalize cho use case và adapter đọc dữ liệu. */
export type AnalyticsQuery = {
  dimensions: AnalyticsDimension[];
  filterSummary: string[];
  filters: AnalyticsFilters;
  limit: number;
  measures: AnalyticsMeasure[];
  offset: number;
  page: number;
  pageSize: number;
};

/** Lỗi validation cho analytics query contract. */
export class AnalyticsQueryValidationError extends Error {
  constructor() {
    super("Truy vấn analytics không hợp lệ.");
    this.name = "AnalyticsQueryValidationError";
  }
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;
const dimensionSchema = z.enum(ANALYTICS_DIMENSIONS);
const measureSchema = z.enum(ANALYTICS_MEASURES);
const positiveIntegerSchema = z.coerce.number().int().positive();
const pageSchema = positiveIntegerSchema.max(MAX_ANALYTICS_PAGE);
const idSchema = z.string().refine((value) => SAFE_ID_PATTERN.test(value));
const isoDateSchema = z.string().refine(isValidIsoDate);

const filtersSchema = z
  .object({
    companyId: idSchema.optional(),
    customerId: idSchema.optional(),
    kitTypeId: idSchema.optional(),
    metricId: idSchema.optional(),
    receivedFrom: isoDateSchema.optional(),
    receivedTo: isoDateSchema.optional(),
    resultGroupId: idSchema.optional(),
    sampleTypeId: idSchema.optional(),
    status: z.enum(SAMPLE_STATUSES).optional(),
  })
  .strict();

const querySchema = z
  .object({
    dimensions: z.array(dimensionSchema).min(1).max(4).optional(),
    filters: filtersSchema.optional(),
    measures: z.array(measureSchema).min(1).max(4).optional(),
    page: pageSchema.optional(),
    pageSize: positiveIntegerSchema.optional(),
  })
  .strict();

/** Parse unknown analytics input into the internal query contract. */
export function parseAnalyticsQuery(input: unknown): AnalyticsQuery {
  const result = querySchema.safeParse(input);

  if (!result.success) {
    throw new AnalyticsQueryValidationError();
  }

  const page = result.data.page ?? 1;
  const pageSize = Math.min(
    result.data.pageSize ?? DEFAULT_ANALYTICS_PAGE_SIZE,
    MAX_ANALYTICS_PAGE_SIZE
  );
  const filters = result.data.filters ?? {};

  return {
    dimensions: result.data.dimensions ?? ["receivedDate"],
    filterSummary: buildFilterSummary(filters),
    filters,
    limit: pageSize,
    measures: result.data.measures ?? ["sampleCount"],
    offset: (page - 1) * pageSize,
    page,
    pageSize,
  };
}

function buildFilterSummary(filters: AnalyticsFilters): string[] {
  const summary: string[] = [];

  if (filters.receivedFrom || filters.receivedTo) {
    summary.push(formatDateRange(filters.receivedFrom, filters.receivedTo));
  }
  if (filters.companyId) summary.push("Công ty đã chọn");
  if (filters.customerId) summary.push("Khách hàng đã chọn");
  if (filters.sampleTypeId) summary.push("Loại mẫu đã chọn");
  if (filters.kitTypeId) summary.push("Loại KIT đã chọn");
  if (filters.resultGroupId) summary.push("Nhóm kết quả đã chọn");
  if (filters.metricId) summary.push("Chỉ tiêu đã chọn");
  if (filters.status)
    summary.push(`Trạng thái: ${statusLabels[filters.status]}`);

  return summary.length > 0 ? summary : ["Chưa áp dụng bộ lọc"];
}

function formatDateRange(from: string | undefined, to: string | undefined) {
  if (from && to) return `Từ ${formatDate(from)} đến ${formatDate(to)}`;
  if (from) return `Từ ${formatDate(from)}`;
  if (to) return `Đến ${formatDate(to)}`;

  return "Mọi thời gian";
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
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

const statusLabels: Record<SampleStatus, string> = {
  archived: "Đã lưu trữ",
  completed: "Hoàn tất",
  draft: "Bản nháp",
  in_progress: "Đang xử lý",
  received: "Đã nhận",
};
