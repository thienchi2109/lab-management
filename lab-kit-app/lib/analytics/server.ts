import "server-only";

import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { getAnalyticsActor, type AnalyticsAggregateRow } from "./operations";
import {
  getDashboardOverviewData,
  type DashboardOverviewReadPort,
  type DashboardOverviewRecentSampleRow,
} from "./overview";
import type { AnalyticsQuery } from "./query";
import type {
  DashboardConclusionRow,
  DashboardKitRow,
  DashboardMetricRow,
  DashboardQuery,
  DashboardResultRow,
  DashboardSampleRow,
  DashboardSource,
} from "./server-types";

const SAMPLE_SELECT =
  "id, sample_code, customer_name, received_at, status, sample_types(name)";
const CLEAN_PATTERN = /SẠCH/i;
const POSITIVE_PATTERN = /NHIỄM|POSITIVE|DƯƠNG/i;

/** Lỗi phân quyền khi người dùng không được đọc dashboard overview. */
export class DashboardOverviewAccessError extends Error {
  constructor() {
    super("Dashboard overview read access required.");
    this.name = "DashboardOverviewAccessError";
  }
}

/** Load dashboard overview data for the current authenticated session. */
export async function getDashboardOverviewPage(options?: { now?: Date }) {
  const session = await getCurrentSession();

  if (!session) {
    throw new DashboardOverviewAccessError();
  }

  const actor = getAnalyticsActor(session);

  if (!actor) {
    throw new DashboardOverviewAccessError();
  }

  return getDashboardOverviewData(
    actor,
    createSupabaseDashboardOverviewPort(),
    options
  );
}

/** Create the Supabase-backed dashboard overview read port. */
export function createSupabaseDashboardOverviewPort(): DashboardOverviewReadPort {
  const supabase = getSupabaseAdminClient() as unknown as DashboardSource;

  return {
    async countKits(input) {
      const rows = await readRows(
        supabase
          .from<DashboardKitRow>("kits")
          .select("status")
          .eq("organization_id", input.organizationId),
        "Không thể tải số lượng KIT cho dashboard."
      );
      const available = rows.filter((row) => row.status === "in_stock").length;

      return { available, total: rows.length };
    },
    async listDataset(input) {
      const samples = await listSamples(supabase, input.organizationId, {
        limit: input.query.limit,
        query: input.query,
      });
      const sampleIds = samples.map((sample) => sample.id);
      const conclusions = await loadConclusions(
        supabase,
        input.organizationId,
        sampleIds
      );

      if (input.query.dimensions.includes("pcrMetric")) {
        return {
          rows: await buildPcrMetricRows(
            supabase,
            input.organizationId,
            sampleIds
          ),
          totals: countConclusionTotals(samples, conclusions),
          warnings: [],
        };
      }

      const rows = buildReceivedDateRows(samples, conclusions);

      return {
        rows,
        totals: countConclusionTotals(samples, conclusions),
        warnings: [],
      };
    },
    async listRecentSamples(input) {
      const samples = await readRows(
        applyDateBounds(
          supabase
            .from<DashboardSampleRow>("samples")
            .select(SAMPLE_SELECT)
            .eq("organization_id", input.organizationId),
          input.receivedFrom,
          input.receivedTo
        )
          .order("received_at", { ascending: false })
          .range(0, input.limit - 1),
        "Không thể tải mẫu gần đây cho dashboard."
      );
      const conclusions = await loadConclusions(
        supabase,
        input.organizationId,
        samples.map((sample) => sample.id)
      );

      return samples.map((sample) => mapRecentSample(sample, conclusions));
    },
  };
}

function listSamples(
  supabase: DashboardSource,
  organizationId: string,
  input: { limit: number; query: AnalyticsQuery }
) {
  let query = supabase
    .from<DashboardSampleRow>("samples")
    .select(SAMPLE_SELECT)
    .eq("organization_id", organizationId);
  query = applyDateBounds(
    query,
    input.query.filters.receivedFrom,
    input.query.filters.receivedTo
  );
  if (input.query.filters.status) {
    query = query.eq("status", input.query.filters.status);
  }

  return readRows(
    query.order("received_at", { ascending: true }).range(0, input.limit - 1),
    "Không thể tải dữ liệu mẫu cho dashboard."
  );
}

function applyDateBounds<T>(
  query: DashboardQuery<T>,
  receivedFrom: string | undefined,
  receivedTo: string | undefined
) {
  if (receivedFrom) query = query.gte("received_at", receivedFrom);
  if (receivedTo) query = query.lte("received_at", receivedTo);

  return query;
}

async function buildPcrMetricRows(
  supabase: DashboardSource,
  organizationId: string,
  sampleIds: string[]
): Promise<AnalyticsAggregateRow[]> {
  const results = await readRows(
    supabase
      .from<DashboardResultRow>("sample_results")
      .select("sample_id, result_metric_id, value")
      .eq("organization_id", organizationId)
      .in("sample_id", sampleIds),
    "Không thể tải kết quả PCR cho dashboard."
  );
  const metrics = await readRows(
    supabase
      .from<DashboardMetricRow>("result_metrics")
      .select("id, code, name")
      .eq("organization_id", organizationId)
      .in("id", unique(results.map((result) => result.result_metric_id))),
    "Không thể tải chỉ tiêu PCR cho dashboard."
  );
  const metricById = new Map(metrics.map((metric) => [metric.id, metric]));
  const grouped = new Map<
    string,
    { positiveCount: number; sampleCount: number }
  >();

  for (const result of results) {
    const metric = metricById.get(result.result_metric_id);
    const title = metric?.name ?? metric?.code ?? "Không rõ chỉ tiêu";
    const counts = grouped.get(title) ?? { positiveCount: 0, sampleCount: 0 };
    counts.sampleCount += 1;
    if (isPositiveValue(result.value)) counts.positiveCount += 1;
    grouped.set(title, counts);
  }

  return [...grouped].map(([title, counts]) => ({
    dimensionValues: { pcrMetric: title },
    measureValues: counts,
  }));
}

function buildReceivedDateRows(
  samples: DashboardSampleRow[],
  conclusions: DashboardConclusionRow[]
): AnalyticsAggregateRow[] {
  const conclusionBySample = groupConclusionsBySample(conclusions);
  const grouped = new Map<
    string,
    { positiveCount: number; sampleCount: number }
  >();

  for (const sample of samples) {
    const receivedDate = sample.received_at.slice(0, 10);
    const counts = grouped.get(receivedDate) ?? {
      positiveCount: 0,
      sampleCount: 0,
    };
    counts.sampleCount += 1;
    if (isPositiveConclusion(conclusionBySample.get(sample.id) ?? [])) {
      counts.positiveCount += 1;
    }
    grouped.set(receivedDate, counts);
  }

  return [...grouped].map(([receivedDate, counts]) => ({
    dimensionValues: { receivedDate },
    measureValues: counts,
  }));
}

function countConclusionTotals(
  samples: DashboardSampleRow[],
  conclusions: DashboardConclusionRow[]
) {
  const conclusionBySample = groupConclusionsBySample(conclusions);
  let positiveCount = 0;
  let cleanCount = 0;

  for (const sample of samples) {
    const sampleConclusions = conclusionBySample.get(sample.id) ?? [];
    if (isPositiveConclusion(sampleConclusions)) positiveCount += 1;
    if (sampleConclusions.some((row) => CLEAN_PATTERN.test(row.kq_chung))) {
      cleanCount += 1;
    }
  }

  return {
    cleanCount,
    infectedCount: positiveCount,
    positiveCount,
    sampleCount: samples.length,
  };
}

function mapRecentSample(
  sample: DashboardSampleRow,
  conclusions: DashboardConclusionRow[]
): DashboardOverviewRecentSampleRow {
  const sampleConclusions = conclusions.filter(
    (row) => row.sample_id === sample.id
  );
  const firstConclusion = sampleConclusions[0]?.kq_chung ?? null;

  return {
    customerName: sample.customer_name,
    receivedAt: sample.received_at,
    resultLabel: firstConclusion ? `PCR (${firstConclusion})` : null,
    sampleCode: sample.sample_code,
    sampleTypeName:
      firstRelation(sample.sample_types)?.name ?? "Không rõ loại mẫu",
    status: sample.status,
  };
}

function loadConclusions(
  supabase: DashboardSource,
  organizationId: string,
  sampleIds: string[]
) {
  if (sampleIds.length === 0) return Promise.resolve([]);

  return readRows(
    supabase
      .from<DashboardConclusionRow>("sample_group_conclusions")
      .select("sample_id, kq_chung")
      .eq("organization_id", organizationId)
      .in("sample_id", sampleIds),
    "Không thể tải KQ_CHUNG cho dashboard."
  );
}

async function readRows<T>(query: DashboardQuery<T>, message: string) {
  const { data, error } = await query;

  if (error) {
    throw new Error(message);
  }

  return data ?? [];
}

function groupConclusionsBySample(rows: DashboardConclusionRow[]) {
  const grouped = new Map<string, DashboardConclusionRow[]>();

  for (const row of rows) {
    grouped.set(row.sample_id, [...(grouped.get(row.sample_id) ?? []), row]);
  }

  return grouped;
}

function isPositiveConclusion(rows: DashboardConclusionRow[]) {
  return rows.some((row) => POSITIVE_PATTERN.test(row.kq_chung));
}

function isPositiveValue(value: unknown) {
  return POSITIVE_PATTERN.test(JSON.stringify(value));
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;

  return Array.isArray(value) ? (value[0] ?? null) : value;
}
