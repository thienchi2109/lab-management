import type { SampleGridResultSummary } from "./operations";
import { buildResultSummaries } from "./result-summary-mapper";

type SampleRow = {
  id: string;
  sample_type_id: string;
};

type TemplateRow = {
  id: string;
  sample_type_id: string;
  created_at: string;
};

type AssignmentRow = {
  result_template_id: string;
  result_metric_id: string;
  sort_order: number;
};

type MetricRow = {
  id: string;
  result_group_id: string;
  code: string;
  name: string;
  sort_order: number;
};

type GroupRow = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
};

type ResultRow = {
  sample_id: string;
  result_metric_id: string;
  value: unknown;
};

type ConclusionRow = {
  sample_id: string;
  result_group_id: string;
  kq_chung: string;
};

type QueryResult<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

/** Query builder tối thiểu cần cho các truy vấn summary kết quả. */
export type QueryBuilder<T> = QueryResult<T> & {
  eq(column: string, value: unknown): QueryBuilder<T>;
  in(column: string, values: string[]): QueryBuilder<T>;
  order(column: string, options?: { ascending: boolean }): QueryBuilder<T>;
};

/** Client Supabase tối thiểu để đọc summary kết quả của Sample Grid. */
export type SupabaseLike = {
  from<T>(table: string): {
    select(columns: string): QueryBuilder<T>;
  };
};

/** Load result summaries for the current sample grid page only. */
export async function listSampleGridResultSummaries(
  supabase: SupabaseLike,
  input: { organizationId: string; sampleIds: string[] }
): Promise<Record<string, SampleGridResultSummary>> {
  if (input.sampleIds.length === 0) {
    return {};
  }

  const resultsPromise = loadResults(
    supabase,
    input.organizationId,
    input.sampleIds
  );
  const conclusionsPromise = loadConclusions(
    supabase,
    input.organizationId,
    input.sampleIds
  );
  const samples = await readRows<SampleRow>(
    supabase
      .from<SampleRow>("samples")
      .select("id, sample_type_id")
      .eq("organization_id", input.organizationId)
      .in("id", input.sampleIds),
    "Không thể tải mẫu cho summary kết quả."
  );
  const templateBySampleType = await loadTemplates(
    supabase,
    input.organizationId,
    unique(samples.map((sample) => sample.sample_type_id))
  );
  const templateIds = unique(
    [...templateBySampleType.values()].map((row) => row.id)
  );
  const assignments = await loadAssignments(
    supabase,
    input.organizationId,
    templateIds
  );
  const metricIds = unique(assignments.map((row) => row.result_metric_id));
  const metrics = await loadMetrics(supabase, input.organizationId, metricIds);
  const groups = await loadGroups(
    supabase,
    input.organizationId,
    unique(metrics.map((metric) => metric.result_group_id))
  );
  const [results, conclusions] = await Promise.all([
    resultsPromise,
    conclusionsPromise,
  ]);

  return buildResultSummaries({
    assignments,
    conclusions,
    groups,
    metrics,
    results,
    samples,
    templateBySampleType,
  });
}

async function loadTemplates(
  supabase: SupabaseLike,
  organizationId: string,
  sampleTypeIds: string[]
) {
  const rows = await readRows<TemplateRow>(
    supabase
      .from<TemplateRow>("result_templates")
      .select("id, sample_type_id, created_at")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("sample_type_id", sampleTypeIds)
      .order("created_at", { ascending: false }),
    "Không thể tải template summary kết quả."
  );
  const bySampleType = new Map<string, TemplateRow>();

  for (const row of rows) {
    if (!bySampleType.has(row.sample_type_id)) {
      bySampleType.set(row.sample_type_id, row);
    }
  }

  return bySampleType;
}

function loadAssignments(
  supabase: SupabaseLike,
  organizationId: string,
  templateIds: string[]
) {
  return readRows<AssignmentRow>(
    supabase
      .from<AssignmentRow>("result_template_metrics")
      .select("result_template_id, result_metric_id, sort_order")
      .eq("organization_id", organizationId)
      .in("result_template_id", templateIds)
      .order("sort_order", { ascending: true }),
    "Không thể tải chỉ tiêu template summary."
  );
}

function loadMetrics(
  supabase: SupabaseLike,
  organizationId: string,
  metricIds: string[]
) {
  return readRows<MetricRow>(
    supabase
      .from<MetricRow>("result_metrics")
      .select("id, result_group_id, code, name, sort_order")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", metricIds),
    "Không thể tải chỉ tiêu summary kết quả."
  );
}

function loadGroups(
  supabase: SupabaseLike,
  organizationId: string,
  groupIds: string[]
) {
  return readRows<GroupRow>(
    supabase
      .from<GroupRow>("result_groups")
      .select("id, code, name, sort_order")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", groupIds),
    "Không thể tải nhóm summary kết quả."
  );
}

function loadResults(
  supabase: SupabaseLike,
  organizationId: string,
  sampleIds: string[]
) {
  return readRows<ResultRow>(
    supabase
      .from<ResultRow>("sample_results")
      .select("sample_id, result_metric_id, value")
      .eq("organization_id", organizationId)
      .in("sample_id", sampleIds),
    "Không thể tải giá trị summary kết quả."
  );
}

function loadConclusions(
  supabase: SupabaseLike,
  organizationId: string,
  sampleIds: string[]
) {
  return readRows<ConclusionRow>(
    supabase
      .from<ConclusionRow>("sample_group_conclusions")
      .select("sample_id, result_group_id, kq_chung")
      .eq("organization_id", organizationId)
      .in("sample_id", sampleIds),
    "Không thể tải KQ_CHUNG summary kết quả."
  );
}

async function readRows<T>(query: QueryResult<T>, message: string) {
  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch sample grid result summary rows:", error);
    throw new Error(message);
  }

  return data ?? [];
}

function unique(values: string[]) {
  return [...new Set(values)];
}
