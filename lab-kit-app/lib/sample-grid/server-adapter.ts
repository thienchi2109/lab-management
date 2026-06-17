import type { SampleGridRow } from "./operations";
import type { SampleGridQuery, SampleGridSortKey } from "./query";

type RelationName = {
  name?: string | null;
};

type KitBatchRelation = {
  lot_number?: string | null;
  kit_types?: RelationName | RelationName[] | null;
};

/** Dòng Supabase thô dùng riêng cho adapter đọc Sample Grid. */
export type SampleGridDbRow = {
  billing_status: string;
  company_id: string | null;
  companies?: RelationName | RelationName[] | null;
  customer_id: string | null;
  customer_name: string | null;
  id: string;
  kit_batch_id: string | null;
  kit_batches?: KitBatchRelation | KitBatchRelation[] | null;
  received_at: string;
  sample_code: string;
  sample_type_id: string;
  sample_types?: RelationName | RelationName[] | null;
  status: string;
  updated_at: string;
};

/** Query builder tối thiểu cần để adapter đọc, lọc và phân trang mẫu. */
export type SampleGridQueryBuilder = {
  eq(column: string, value: string): SampleGridQueryBuilder;
  gte(column: string, value: string): SampleGridQueryBuilder;
  ilike(column: string, value: string): SampleGridQueryBuilder;
  in(column: string, values: string[]): SampleGridQueryBuilder;
  lte(column: string, value: string): SampleGridQueryBuilder;
  or(filter: string): SampleGridQueryBuilder;
  order(
    column: string,
    options: { ascending: boolean }
  ): SampleGridQueryBuilder;
  range(
    from: number,
    to: number
  ): Promise<{
    count: number | null;
    data: SampleGridDbRow[] | null;
    error: unknown;
  }>;
  select(columns: string, options: { count: "exact" }): SampleGridQueryBuilder;
};

const SAMPLE_GRID_BASE_SELECT =
  "id, sample_type_id, customer_id, company_id, kit_batch_id, sample_code, customer_name, received_at, status, billing_status, updated_at, sample_types(name), companies(name), kit_batches(lot_number, kit_types(name))";
const SAMPLE_GRID_RESULT_GROUP_SELECT = `${SAMPLE_GRID_BASE_SELECT}, sample_result_groups!inner(result_group_id)`;
const MISSING_KIT_LABEL = "Chưa gán KIT";
const UNKNOWN_SAMPLE_TYPE_LABEL = "Không rõ loại mẫu";
const sortColumnByKey: Record<SampleGridSortKey, string> = {
  billingStatus: "billing_status",
  customerName: "customer_name",
  receivedAt: "received_at",
  sampleCode: "sample_code",
  status: "status",
  updatedAt: "updated_at",
};

/** Chọn select clause phù hợp khi có hoặc không có filter nhóm chỉ tiêu. */
export function getSampleGridSelect(query: SampleGridQuery) {
  return query.filters.resultGroupIds?.length
    ? SAMPLE_GRID_RESULT_GROUP_SELECT
    : SAMPLE_GRID_BASE_SELECT;
}

/** Map sort key đã normalize sang cột Supabase. */
export function getSampleGridSortColumn(query: SampleGridQuery) {
  return sortColumnByKey[query.sort.key];
}

/** Áp filter đã parse vào Supabase query mà vẫn giữ tenant scope. */
export function applySampleGridFilters(
  query: SampleGridQueryBuilder,
  gridQuery: SampleGridQuery,
  organizationId: string
) {
  const { filters } = gridQuery;

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.billingStatus) {
    query = query.eq("billing_status", filters.billingStatus);
  }
  if (filters.companyId) query = query.eq("company_id", filters.companyId);
  if (filters.customerId) query = query.eq("customer_id", filters.customerId);
  if (filters.companyName) {
    query = query.ilike("companies.name", toIlikePattern(filters.companyName));
  }
  if (filters.customerName) {
    query = query.ilike("customer_name", toIlikePattern(filters.customerName));
  }
  if (filters.kitBatchId) query = query.eq("kit_batch_id", filters.kitBatchId);
  if (filters.sampleTypeId) {
    query = query.eq("sample_type_id", filters.sampleTypeId);
  }
  if (filters.resultGroupIds?.length) {
    query = query
      .eq("sample_result_groups.organization_id", organizationId)
      .in("sample_result_groups.result_group_id", filters.resultGroupIds);
  }
  if (filters.receivedFrom) {
    query = query.gte("received_at", filters.receivedFrom);
  }
  if (filters.receivedTo) query = query.lte("received_at", filters.receivedTo);

  return query;
}

/** Áp tìm kiếm text tự do hiện có của Sample Grid. */
export function applySampleGridSearch(
  query: SampleGridQueryBuilder,
  gridQuery: SampleGridQuery
) {
  if (!gridQuery.search) {
    return query;
  }

  const pattern = toIlikePattern(gridQuery.search);

  return query.or(
    `sample_code.ilike.${pattern},customer_name.ilike.${pattern}`
  );
}

/** Map dòng Supabase sang view model Sample Grid ổn định cho UI. */
export function mapSampleGridRow(row: SampleGridDbRow): SampleGridRow {
  const sampleType = firstRelation(row.sample_types);
  const company = firstRelation(row.companies);
  const kitBatch = firstRelation(row.kit_batches);
  const kitType = firstRelation(kitBatch?.kit_types);

  return {
    billingStatus: row.billing_status,
    companyId: row.company_id,
    companyName: company?.name ?? null,
    customerId: row.customer_id,
    customerName: row.customer_name,
    id: row.id,
    kitBatchId: row.kit_batch_id,
    kitSummary:
      kitBatch?.lot_number && kitType?.name
        ? `${kitType.name} - ${kitBatch.lot_number}`
        : MISSING_KIT_LABEL,
    receivedAt: row.received_at,
    sampleCode: row.sample_code,
    sampleTypeId: row.sample_type_id,
    sampleTypeName: sampleType?.name ?? UNKNOWN_SAMPLE_TYPE_LABEL,
    status: row.status,
    resultSummary: null,
    updatedAt: row.updated_at,
  };
}

function toIlikePattern(value: string) {
  return `%${escapeSearchToken(value)}%`;
}

function escapeSearchToken(value: string) {
  return value.replace(/[\\%_(),]/g, "\\$&");
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}
