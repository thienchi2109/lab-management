import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SampleStatus } from "@/lib/sample-metadata/schemas";

import type {
  SampleResultGroup,
  SampleResultMetric,
  SampleResultsPort,
  SampleResultTemplate,
} from "./operations";
import {
  normalizeInputType,
  normalizeMetricSettings,
  normalizeOptions,
} from "./metric-row-normalizers";

type SampleRow = {
  id: string;
  organization_id: string;
  sample_type_id: string;
  sample_code: string;
  customer_name: string | null;
  received_at: string;
  status: SampleStatus;
  sample_types?: RelationName | RelationName[] | null;
  companies?: RelationName | RelationName[] | null;
};

type RelationName = {
  name?: string | null;
};

type TemplateRow = {
  id: string;
  name: string;
};

type AssignmentRow = {
  result_metric_id: string;
  sort_order: number;
};

type SelectedGroupRow = {
  result_group_id: string;
};

type MetricRow = {
  id: string;
  result_group_id: string;
  code: string;
  name: string;
  input_type: string;
  unit: string | null;
  options: unknown;
  metric_settings: unknown;
  sort_order: number;
  is_required: boolean;
};

type GroupRow = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
};

type ResultRow = {
  result_metric_id: string;
  value: unknown;
};

type ConclusionRow = {
  result_group_id: string;
  kq_chung: string;
};

/** Create the Supabase-backed sample-results port for route/page boundaries. */
export function createSupabaseSampleResultsPort(): SampleResultsPort {
  const supabase = getSupabaseAdminClient();

  return {
    async getTemplateForSample(input) {
      const { data: sample, error: sampleError } = await supabase
        .from("samples")
        .select(
          "id, organization_id, sample_type_id, sample_code, customer_name, received_at, status, sample_types(name), companies(name)"
        )
        .eq("id", input.sampleId)
        .eq("organization_id", input.organizationId)
        .maybeSingle<SampleRow>();

      if (sampleError) throw new Error("Không thể tải mẫu xét nghiệm.");
      if (!sample) return null;

      const { data: template, error: templateError } = await supabase
        .from("result_templates")
        .select("id, name")
        .eq("organization_id", input.organizationId)
        .eq("sample_type_id", sample.sample_type_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<TemplateRow>();

      if (templateError) throw new Error("Không thể tải template kết quả.");
      if (!template) return null;

      return loadTemplateDetails(input.organizationId, sample, template);
    },
    async saveResultsTransaction(input) {
      const { error } = await supabase.rpc("save_sample_results_with_audit", {
        p_organization_id: input.organizationId,
        p_actor_id: input.actorId,
        p_sample_id: input.sampleId,
        p_results: input.results,
        p_conclusions: input.conclusions,
        p_audit_event: input.auditEvent,
      });

      if (error) {
        throw new Error("Không thể lưu kết quả xét nghiệm.");
      }
    },
  };

  async function loadTemplateDetails(
    organizationId: string,
    sample: SampleRow,
    template: TemplateRow
  ): Promise<SampleResultTemplate> {
    const { data: assignments, error: assignmentError } = await supabase
      .from("result_template_metrics")
      .select("result_metric_id, sort_order")
      .eq("organization_id", organizationId)
      .eq("result_template_id", template.id)
      .order("sort_order", { ascending: true })
      .returns<AssignmentRow[]>();

    if (assignmentError) throw new Error("Không thể tải chỉ tiêu template.");

    const selectedGroupIds = await loadSelectedResultGroupIds(
      organizationId,
      sample.id
    );
    const metricIds = (assignments ?? []).map((item) => item.result_metric_id);
    const metrics = await loadMetrics(
      organizationId,
      metricIds,
      selectedGroupIds
    );
    const groupIds = [
      ...new Set(metrics.map((metric) => metric.result_group_id)),
    ];
    const [groups, results, conclusions] = await Promise.all([
      loadGroups(organizationId, groupIds),
      loadResults(organizationId, sample.id),
      loadConclusions(organizationId, sample.id),
    ]);

    return {
      sample: {
        id: sample.id,
        sampleCode: sample.sample_code,
        sampleTypeId: sample.sample_type_id,
        sampleTypeName:
          firstRelation(sample.sample_types)?.name ?? "Không rõ loại mẫu",
        organizationId,
        receivedAt: sample.received_at,
        customerName: sample.customer_name,
        companyName: firstRelation(sample.companies)?.name ?? null,
        status: sample.status,
      },
      template,
      groups: buildGroups(assignments ?? [], metrics, groups),
      results,
      conclusions,
    };
  }

  async function loadSelectedResultGroupIds(
    organizationId: string,
    sampleId: string
  ) {
    const { data, error } = await supabase
      .from("sample_result_groups")
      .select("result_group_id")
      .eq("organization_id", organizationId)
      .eq("sample_id", sampleId)
      .returns<SelectedGroupRow[]>();

    if (error) throw new Error("Không thể tải nhóm chỉ tiêu của mẫu.");

    const groupIds = [
      ...new Set((data ?? []).map((row) => row.result_group_id)),
    ];
    return groupIds.length > 0 ? groupIds : null;
  }

  async function loadMetrics(
    organizationId: string,
    metricIds: string[],
    selectedGroupIds: string[] | null
  ) {
    if (!selectedGroupIds && metricIds.length === 0) return [];

    const query = supabase
      .from("result_metrics")
      .select(
        "id, result_group_id, code, name, input_type, unit, options, metric_settings, sort_order, is_required"
      )
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    if (selectedGroupIds) {
      query.in("result_group_id", selectedGroupIds);
    } else {
      query.in("id", metricIds);
    }

    const { data, error } = await query.returns<MetricRow[]>();

    if (error) throw new Error("Không thể tải chỉ tiêu kết quả.");
    return selectedGroupIds
      ? (data ?? []).filter((row) =>
          selectedGroupIds.includes(row.result_group_id)
        )
      : (data ?? []);
  }

  async function loadGroups(organizationId: string, groupIds: string[]) {
    if (groupIds.length === 0) return [];

    const { data, error } = await supabase
      .from("result_groups")
      .select("id, code, name, sort_order")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", groupIds)
      .order("sort_order", { ascending: true })
      .returns<GroupRow[]>();

    if (error) throw new Error("Không thể tải nhóm kết quả.");
    return data ?? [];
  }

  async function loadResults(organizationId: string, sampleId: string) {
    const { data, error } = await supabase
      .from("sample_results")
      .select("result_metric_id, value")
      .eq("organization_id", organizationId)
      .eq("sample_id", sampleId)
      .returns<ResultRow[]>();

    if (error) throw new Error("Không thể tải kết quả hiện có.");

    return (data ?? []).map((row) => ({
      metricId: row.result_metric_id,
      value: row.value,
    }));
  }

  async function loadConclusions(organizationId: string, sampleId: string) {
    const { data, error } = await supabase
      .from("sample_group_conclusions")
      .select("result_group_id, kq_chung")
      .eq("organization_id", organizationId)
      .eq("sample_id", sampleId)
      .returns<ConclusionRow[]>();

    if (error) throw new Error("Không thể tải kết luận nhóm.");

    return (data ?? []).map((row) => ({
      groupId: row.result_group_id,
      kqChung: row.kq_chung,
    }));
  }
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function buildGroups(
  assignments: AssignmentRow[],
  metricRows: MetricRow[],
  groupRows: GroupRow[]
): SampleResultGroup[] {
  const assignmentSort = new Map(
    assignments.map((item) => [item.result_metric_id, item.sort_order])
  );
  const metricsByGroup = groupBy(
    metricRows,
    (metric) => metric.result_group_id
  );

  return groupRows
    .flatMap((group): SampleResultGroup[] => {
      const groupMetrics = (metricsByGroup.get(group.id) ?? [])
        .map((row) => mapMetric(row, assignmentSort.get(row.id)))
        .toSorted((left, right) => left.sortOrder - right.sortOrder);
      return groupMetrics.length > 0
        ? [
            {
              id: group.id,
              code: group.code,
              name: group.name,
              sortOrder: group.sort_order,
              metrics: groupMetrics,
            },
          ]
        : [];
    })
    .toSorted((left, right) => left.sortOrder - right.sortOrder);
}

function mapMetric(
  row: MetricRow,
  assignmentSort?: number
): SampleResultMetric {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    inputType: normalizeInputType(row.input_type),
    unit: row.unit,
    options: normalizeOptions(row.options),
    metricSettings: normalizeMetricSettings(row.metric_settings),
    sortOrder: assignmentSort ?? row.sort_order,
    isRequired: row.is_required,
  };
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const list = grouped.get(key);

    if (list) {
      list.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  return grouped;
}
