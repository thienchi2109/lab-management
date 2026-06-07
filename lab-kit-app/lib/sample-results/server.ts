import "server-only";

import {
  isResultInputType,
  type ResultInputType,
} from "@/lib/result-configuration/configuration";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type {
  SampleResultGroup,
  SampleResultMetric,
  SampleResultsPort,
  SampleResultTemplate,
} from "./operations";

type SampleRow = {
  id: string;
  organization_id: string;
  sample_type_id: string;
  sample_code: string;
};

type TemplateRow = {
  id: string;
  name: string;
};

type AssignmentRow = {
  result_metric_id: string;
  sort_order: number;
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
        .select("id, organization_id, sample_type_id, sample_code")
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

    const metricIds = (assignments ?? []).map((item) => item.result_metric_id);
    const metrics = await loadMetrics(organizationId, metricIds);
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
        organizationId,
      },
      template,
      groups: buildGroups(assignments ?? [], metrics, groups),
      results,
      conclusions,
    };
  }

  async function loadMetrics(organizationId: string, metricIds: string[]) {
    if (metricIds.length === 0) return [];

    const { data, error } = await supabase
      .from("result_metrics")
      .select(
        "id, result_group_id, code, name, input_type, unit, options, metric_settings, sort_order, is_required"
      )
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", metricIds)
      .returns<MetricRow[]>();

    if (error) throw new Error("Không thể tải chỉ tiêu kết quả.");
    return data ?? [];
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

function normalizeOptions(value: unknown) {
  return Array.isArray(value)
    ? value.filter((option): option is string => typeof option === "string")
    : [];
}

function normalizeMetricSettings(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, setting]) => {
      if (isNumericSettingKey(key)) {
        return typeof setting === "number" && Number.isFinite(setting)
          ? [[key, setting]]
          : [];
      }

      return isJsonValue(setting) ? [[key, setting]] : [];
    })
  );
}

function isNumericSettingKey(key: string) {
  return key === "min" || key === "max" || key === "ct_min" || key === "ct_max";
}

function normalizeInputType(value: string): ResultInputType {
  return isResultInputType(value) ? value : "text";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (isRecord(value)) {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}
