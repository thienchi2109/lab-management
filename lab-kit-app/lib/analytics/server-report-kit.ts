import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { AnalyticsQuery } from "./query";
import type {
  ReportKitAnalyticsReadPort,
  ReportKitAnalyticsSourceRow,
} from "./report-kit";
import {
  assertPositiveLimit,
  createDashboardSource,
  readRows,
} from "./server-query";
import type {
  DashboardQuery,
  DashboardSource,
  RelationName,
} from "./server-types";

const REPORT_SAMPLE_SELECT =
  "id, customer_id, company_id, customer_name, kit_batch_id, sample_types(name), kit_batches(kit_types(name))";

type ReportSampleRow = {
  company_id: string | null;
  customer_id: string | null;
  customer_name: string | null;
  id: string;
  kit_batch_id: string | null;
  kit_batches?: ReportKitBatchRelation | ReportKitBatchRelation[] | null;
  sample_types?: RelationName | RelationName[] | null;
};

type ReportKitBatchRelation = {
  kit_types?: RelationName | RelationName[] | null;
};

type ReportConclusionRow = {
  kq_chung: string;
  sample_id: string;
};

/** Tạo cổng đọc Supabase cho hợp đồng biểu đồ báo cáo kit/mẫu. */
export function createSupabaseReportKitAnalyticsPort(): ReportKitAnalyticsReadPort {
  const supabase = createDashboardSource(getSupabaseAdminClient());

  return {
    async listReportRows(input) {
      assertPositiveLimit(input.query.limit);
      const samples = await listReportSamples(
        supabase,
        input.organizationId,
        input.query
      );
      const conclusions = await loadReportConclusions(
        supabase,
        input.organizationId,
        samples.map((sample) => sample.id)
      );
      const conclusionBySampleId = new Map(
        conclusions.map((row) => [row.sample_id, row.kq_chung])
      );

      return samples.map((sample) =>
        mapReportSampleRow(sample, conclusionBySampleId.get(sample.id) ?? null)
      );
    },
  };
}

function listReportSamples(
  supabase: DashboardSource,
  organizationId: string,
  query: AnalyticsQuery
) {
  let builder = supabase
    .from<ReportSampleRow>("samples")
    .select(REPORT_SAMPLE_SELECT)
    .eq("organization_id", organizationId);

  builder = applyReportFilters(builder, query);

  return readRows(
    builder.order("received_at", { ascending: true }).range(0, query.limit - 1),
    "Không thể tải dữ liệu báo cáo kit/mẫu."
  );
}

function applyReportFilters<T>(
  builder: DashboardQuery<T>,
  query: AnalyticsQuery
) {
  const { filters } = query;

  if (filters.receivedFrom)
    builder = builder.gte("received_at", filters.receivedFrom);
  if (filters.receivedTo)
    builder = builder.lte("received_at", filters.receivedTo);
  if (filters.status) builder = builder.eq("status", filters.status);
  if (filters.sampleTypeId)
    builder = builder.eq("sample_type_id", filters.sampleTypeId);
  if (filters.kitTypeId)
    builder = builder.eq("kit_batches.kit_type_id", filters.kitTypeId);
  if (filters.companyId) builder = builder.eq("company_id", filters.companyId);
  if (filters.customerId)
    builder = builder.eq("customer_id", filters.customerId);

  return builder;
}

function loadReportConclusions(
  supabase: DashboardSource,
  organizationId: string,
  sampleIds: string[]
) {
  if (sampleIds.length === 0) return Promise.resolve([]);

  return readRows(
    supabase
      .from<ReportConclusionRow>("sample_group_conclusions")
      .select("sample_id, kq_chung")
      .eq("organization_id", organizationId)
      .in("sample_id", sampleIds),
    "Không thể tải Kết Quả Chung cho báo cáo kit/mẫu."
  );
}

function mapReportSampleRow(
  sample: ReportSampleRow,
  generalPcrConclusion: string | null
): ReportKitAnalyticsSourceRow {
  const kitBatch = firstRelation(sample.kit_batches);

  return {
    companyId: sample.company_id,
    customerId: sample.customer_id,
    customerName: sample.customer_name,
    generalPcrConclusion,
    kitBatchId: sample.kit_batch_id,
    kitTypeName: firstRelation(kitBatch?.kit_types)?.name ?? null,
    sampleId: sample.id,
    sampleTypeName: firstRelation(sample.sample_types)?.name ?? null,
  };
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;

  return Array.isArray(value) ? (value[0] ?? null) : value;
}
