import type {
  SampleGridResultGroupSummary,
  SampleGridResultSummary,
} from "./operations";

type SampleRow = {
  id: string;
  sample_type_id: string;
};

type TemplateRow = {
  id: string;
  sample_type_id: string;
};

type AssignmentRow = {
  result_template_id: string;
  result_metric_id: string;
};

type MetricRow = {
  id: string;
  result_group_id: string;
  code: string;
  name: string;
  unit?: string | null;
};

type GroupRow = {
  id: string;
  code: string;
  name: string;
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

/** Map batched result rows into per-sample grid summaries. */
export function buildResultSummaries(input: {
  assignments: AssignmentRow[];
  conclusions: ConclusionRow[];
  groups: GroupRow[];
  metrics: MetricRow[];
  results: ResultRow[];
  samples: SampleRow[];
  templateBySampleType: Map<string, TemplateRow>;
}) {
  const assignmentsByTemplate = groupBy(
    input.assignments,
    "result_template_id"
  );
  const metricsById = new Map(
    input.metrics.map((metric) => [metric.id, metric])
  );
  const groupsById = new Map(input.groups.map((group) => [group.id, group]));
  const resultsBySampleMetric = new Map(
    input.results.map((row) => [
      `${row.sample_id}:${row.result_metric_id}`,
      row.value,
    ])
  );
  const conclusionsBySampleGroup = new Map(
    input.conclusions.map((row) => [
      `${row.sample_id}:${row.result_group_id}`,
      row.kq_chung,
    ])
  );
  const summaries: Record<string, SampleGridResultSummary> = {};

  for (const sample of input.samples) {
    const template = input.templateBySampleType.get(sample.sample_type_id);
    const assignments = template
      ? (assignmentsByTemplate.get(template.id) ?? [])
      : [];
    summaries[sample.id] = {
      groups: buildSampleGroups({
        assignments,
        conclusionsBySampleGroup,
        groupsById,
        metricsById,
        resultsBySampleMetric,
        sampleId: sample.id,
      }),
    };
  }

  return summaries;
}

function buildSampleGroups(input: {
  assignments: AssignmentRow[];
  conclusionsBySampleGroup: Map<string, string>;
  groupsById: Map<string, GroupRow>;
  metricsById: Map<string, MetricRow>;
  resultsBySampleMetric: Map<string, unknown>;
  sampleId: string;
}) {
  const groupMap = new Map<string, SampleGridResultGroupSummary>();

  for (const assignment of input.assignments) {
    const metric = input.metricsById.get(assignment.result_metric_id);
    const group = metric ? input.groupsById.get(metric.result_group_id) : null;

    if (!metric || !group) {
      continue;
    }

    const summary =
      groupMap.get(group.id) ??
      createGroupSummary(
        group,
        input.conclusionsBySampleGroup.get(`${input.sampleId}:${group.id}`) ??
          null
      );
    const value =
      input.resultsBySampleMetric.get(`${input.sampleId}:${metric.id}`) ?? null;

    summary.metrics.push({
      id: metric.id,
      code: metric.code,
      name: metric.name,
      unit: metric.unit ?? null,
      value,
    });
    summary.totalMetrics += 1;
    if (hasEnteredValue(value)) summary.enteredMetrics += 1;
    groupMap.set(group.id, summary);
  }

  return Array.from(groupMap.values()).toSorted((a, b) =>
    a.name.localeCompare(b.name, "vi")
  );
}

function createGroupSummary(group: GroupRow, kqChung: string | null) {
  return {
    id: group.id,
    code: group.code,
    name: group.name,
    kqChung,
    enteredMetrics: 0,
    totalMetrics: 0,
    metrics: [],
  };
}

function hasEnteredValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function groupBy<T>(rows: T[], key: keyof T) {
  const groups = new Map<string, T[]>();

  for (const row of rows) {
    const value = String(row[key]);
    const group = groups.get(value);

    if (group) {
      group.push(row);
    } else {
      groups.set(value, [row]);
    }
  }

  return groups;
}
