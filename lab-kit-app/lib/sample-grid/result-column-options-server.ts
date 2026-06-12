import type { SampleGridResultColumnOption } from "./operations";
import type { SupabaseLike } from "./result-summary-server";

type TemplateRow = {
  id: string;
};

type AssignmentRow = {
  result_metric_id: string;
  sort_order: number;
};

type MetricRow = {
  id: string;
  result_group_id: string;
  name: string;
  sort_order: number;
};

type GroupRow = {
  id: string;
  name: string;
  sort_order: number;
};

/** Đọc schema cột kết quả Sample Grid từ result template ổn định của tenant. */
export async function listSampleGridResultColumnOptions(
  supabase: SupabaseLike,
  input: { organizationId: string; sampleTypeId?: string }
): Promise<SampleGridResultColumnOption[]> {
  const templates = await loadTemplates(supabase, input);
  const templateIds = templates.map((template) => template.id);

  if (templateIds.length === 0) {
    return [];
  }

  const assignments = await loadAssignments(
    supabase,
    input.organizationId,
    templateIds
  );
  const metrics = await loadMetrics(
    supabase,
    input.organizationId,
    unique(assignments.map((assignment) => assignment.result_metric_id))
  );
  const groups = await loadGroups(
    supabase,
    input.organizationId,
    unique(metrics.map((metric) => metric.result_group_id))
  );

  return buildResultColumnOptions(assignments, metrics, groups);
}

async function loadTemplates(
  supabase: SupabaseLike,
  input: { organizationId: string; sampleTypeId?: string }
) {
  let query = supabase
    .from<TemplateRow>("result_templates")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (input.sampleTypeId) {
    query = query.eq("sample_type_id", input.sampleTypeId);
  }

  return readRows(query, "Không thể tải template cột kết quả.");
}

function loadAssignments(
  supabase: SupabaseLike,
  organizationId: string,
  templateIds: string[]
) {
  return readRows<AssignmentRow>(
    supabase
      .from<AssignmentRow>("result_template_metrics")
      .select("result_metric_id, sort_order")
      .eq("organization_id", organizationId)
      .in("result_template_id", templateIds)
      .order("sort_order", { ascending: true }),
    "Không thể tải mapping cột kết quả."
  );
}

function loadMetrics(
  supabase: SupabaseLike,
  organizationId: string,
  metricIds: string[]
) {
  if (metricIds.length === 0) {
    return Promise.resolve([]);
  }

  return readRows<MetricRow>(
    supabase
      .from<MetricRow>("result_metrics")
      .select("id, result_group_id, name, sort_order")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", metricIds),
    "Không thể tải chỉ tiêu cột kết quả."
  );
}

function loadGroups(
  supabase: SupabaseLike,
  organizationId: string,
  groupIds: string[]
) {
  if (groupIds.length === 0) {
    return Promise.resolve([]);
  }

  return readRows<GroupRow>(
    supabase
      .from<GroupRow>("result_groups")
      .select("id, name, sort_order")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", groupIds),
    "Không thể tải nhóm cột kết quả."
  );
}

function buildResultColumnOptions(
  assignments: AssignmentRow[],
  metrics: MetricRow[],
  groups: GroupRow[]
): SampleGridResultColumnOption[] {
  const metricsById = new Map(metrics.map((metric) => [metric.id, metric]));
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const options = new Map<string, SampleGridResultColumnOption>();

  for (const assignment of assignments.toSorted(compareAssignment)) {
    const metric = metricsById.get(assignment.result_metric_id);
    if (!metric) continue;

    const group = groupsById.get(metric.result_group_id);
    if (!group) continue;

    options.set(`group:${group.id}`, {
      key: `group:${group.id}`,
      label: group.name,
    });
    options.set(`metric:${metric.id}`, {
      key: `metric:${metric.id}`,
      label: `${group.name} / ${metric.name}`,
    });
  }

  return [...options.values()];
}

async function readRows<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>,
  message: string
) {
  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch sample grid result column rows:", error);
    throw new Error(message);
  }

  return data ?? [];
}

function compareAssignment(left: AssignmentRow, right: AssignmentRow) {
  return left.sort_order - right.sort_order;
}

function unique(values: string[]) {
  return [...new Set(values)];
}
