import {
  isSampleBillingStatus,
  isSampleStatus,
  type SampleBillingStatus,
  type SampleStatus,
} from "@/lib/sample-metadata/schemas";

/** Page size mặc định cho data grid mẫu. */
export const DEFAULT_SAMPLE_GRID_PAGE_SIZE = 25;

/** Page size tối đa để tránh truy vấn bảng mẫu quá rộng. */
export const MAX_SAMPLE_GRID_PAGE_SIZE = 100;

/** Các cột sort được phép nhận từ URL/client. */
export type SampleGridSortKey =
  | "billingStatus"
  | "customerName"
  | "receivedAt"
  | "sampleCode"
  | "status"
  | "updatedAt";

/** Hướng sort đã normalize cho data grid mẫu. */
export type SampleGridSortDirection = "asc" | "desc";

/** Bộ lọc server-side được whitelist cho data grid mẫu. */
export type SampleGridFilters = {
  billingStatus?: SampleBillingStatus;
  companyId?: string;
  kitBatchId?: string;
  receivedFrom?: string;
  receivedTo?: string;
  sampleTypeId?: string;
  status?: SampleStatus;
};

/** Query đã normalize, sẵn sàng truyền vào adapter server-side. */
export type SampleGridQuery = {
  filters: SampleGridFilters;
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
  resultColumnKeys: string[];
  search: string | null;
  sort: {
    direction: SampleGridSortDirection;
    key: SampleGridSortKey;
  };
};

/** Search params từ Next route hoặc test doubles. */
export type SampleGridSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

const DEFAULT_SORT: SampleGridQuery["sort"] = {
  direction: "desc",
  key: "receivedAt",
};
const MAX_SEARCH_LENGTH = 100;
const MAX_RESULT_COLUMNS = 3;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;
const RESULT_COLUMN_KEY_PATTERN = /^(group|metric):[A-Za-z0-9_-]{1,120}$/;
const sortKeys = new Set<SampleGridSortKey>([
  "billingStatus",
  "customerName",
  "receivedAt",
  "sampleCode",
  "status",
  "updatedAt",
]);

/** Normalize URL search params into the safe server-side grid query contract. */
export function parseSampleGridQuery(
  params: SampleGridSearchParams
): SampleGridQuery {
  const page = positiveInteger(firstParam(params, "page")) ?? 1;
  const requestedPageSize =
    positiveInteger(firstParam(params, "pageSize")) ??
    DEFAULT_SAMPLE_GRID_PAGE_SIZE;
  const pageSize = Math.min(requestedPageSize, MAX_SAMPLE_GRID_PAGE_SIZE);
  const offset = (page - 1) * pageSize;

  return {
    filters: parseFilters(params),
    limit: pageSize,
    offset,
    page,
    pageSize,
    resultColumnKeys: parseResultColumnKeys(params),
    search: normalizeSearch(firstParam(params, "search")),
    sort: parseSort(params),
  };
}

function parseFilters(params: SampleGridSearchParams): SampleGridFilters {
  const filters: SampleGridFilters = {};
  const status = firstParam(params, "status");
  const billingStatus = firstParam(params, "billingStatus");

  if (status && isSampleStatus(status)) {
    filters.status = status;
  }

  if (billingStatus && isSampleBillingStatus(billingStatus)) {
    filters.billingStatus = billingStatus;
  }

  setSafeIdFilter(filters, "companyId", firstParam(params, "companyId"));
  setSafeIdFilter(filters, "kitBatchId", firstParam(params, "kitBatchId"));
  setSafeIdFilter(filters, "sampleTypeId", firstParam(params, "sampleTypeId"));

  const receivedFrom = firstParam(params, "receivedFrom");
  const receivedTo = firstParam(params, "receivedTo");

  if (receivedFrom && isValidIsoDate(receivedFrom)) {
    filters.receivedFrom = receivedFrom;
  }

  if (receivedTo && isValidIsoDate(receivedTo)) {
    filters.receivedTo = receivedTo;
  }

  return filters;
}

function setSafeIdFilter<K extends keyof SampleGridFilters>(
  filters: SampleGridFilters,
  key: K,
  value: string | undefined
) {
  if (value && SAFE_ID_PATTERN.test(value)) {
    filters[key] = value as SampleGridFilters[K];
  }
}

function parseSort(params: SampleGridSearchParams): SampleGridQuery["sort"] {
  const key = firstParam(params, "sort");
  const direction = firstParam(params, "dir");

  if (!key || !sortKeys.has(key as SampleGridSortKey)) {
    return DEFAULT_SORT;
  }

  return {
    direction: direction === "desc" ? "desc" : "asc",
    key: key as SampleGridSortKey,
  };
}

function parseResultColumnKeys(params: SampleGridSearchParams) {
  const rawValues = allParams(params, "resultColumns");
  const keys: string[] = [];

  for (const rawValue of rawValues) {
    for (const key of rawValue.split(",")) {
      const normalized = key.trim();

      if (
        normalized &&
        RESULT_COLUMN_KEY_PATTERN.test(normalized) &&
        !keys.includes(normalized)
      ) {
        keys.push(normalized);
      }

      if (keys.length >= MAX_RESULT_COLUMNS) {
        return keys;
      }
    }
  }

  return keys;
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

function positiveInteger(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function firstParam(
  params: SampleGridSearchParams,
  key: string
): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }

  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

function allParams(params: SampleGridSearchParams, key: string): string[] {
  if (params instanceof URLSearchParams) {
    return params.getAll(key);
  }

  const value = params[key];

  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
