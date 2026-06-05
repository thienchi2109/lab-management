export const RESULT_INPUT_TYPES = [
  "number",
  "text",
  "textarea",
  "select",
  "multi_select",
  "boolean",
  "scale_1_5",
  "percent",
  "pcr_qualitative",
  "pcr_realtime",
] as const;

export type ResultInputType = (typeof RESULT_INPUT_TYPES)[number];

export type ResultGroupRow = {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ResultMetricRow = {
  id: string;
  organization_id: string;
  result_group_id: string;
  code: string;
  name: string;
  input_type: string;
  unit: string | null;
  options: unknown;
  metric_settings: Record<string, unknown>;
  sort_order: number;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SampleTypeRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type ResultTemplateRow = {
  id: string;
  organization_id: string;
  sample_type_id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ResultTemplateMetricRow = {
  id: string;
  organization_id: string;
  result_template_id: string;
  result_metric_id: string;
  sort_order: number;
  created_at: string;
};

export type ResultMetric = {
  id: string;
  organizationId: string;
  resultGroupId: string;
  code: string;
  name: string;
  inputType: ResultInputType;
  unit: string | null;
  options: unknown[];
  metricSettings: Record<string, unknown>;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResultGroup = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metrics: ResultMetric[];
};

export type SampleType = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type ResultTemplate = {
  id: string;
  organizationId: string;
  sampleTypeId: string;
  sampleTypeName: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metrics: ResultMetric[];
};

export type ResultConfiguration = {
  groups: ResultGroup[];
  metrics: ResultMetric[];
  sampleTypes: SampleType[];
  templates: ResultTemplate[];
};

export type ResultConfigurationSummary = {
  groups: number;
  metrics: number;
  templates: number;
  requiredMetrics: number;
};

export function isResultInputType(value: string): value is ResultInputType {
  return RESULT_INPUT_TYPES.some((inputType) => inputType === value);
}

export function mapResultConfigurationRows(rows: {
  groups: ResultGroupRow[];
  metrics: ResultMetricRow[];
  sampleTypes: SampleTypeRow[];
  templates: ResultTemplateRow[];
  templateMetrics: ResultTemplateMetricRow[];
}): ResultConfiguration {
  const metrics = rows.metrics.map(mapMetricRow).sort(compareSortAndName);
  const metricsByGroup = groupBy(metrics, (metric) => metric.resultGroupId);
  const metricsById = new Map(metrics.map((metric) => [metric.id, metric]));
  const sampleTypes = rows.sampleTypes
    .map((sampleType) => ({
      id: sampleType.id,
      code: sampleType.code,
      name: sampleType.name,
      isActive: sampleType.is_active,
    }))
    .sort(compareName);
  const sampleTypeById = new Map(
    sampleTypes.map((sampleType) => [sampleType.id, sampleType])
  );
  const assignmentsByTemplate = groupBy(
    rows.templateMetrics,
    (assignment) => assignment.result_template_id
  );

  return {
    groups: rows.groups
      .map((group) => ({
        id: group.id,
        organizationId: group.organization_id,
        code: group.code,
        name: group.name,
        sortOrder: group.sort_order,
        isActive: group.is_active,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        metrics: metricsByGroup.get(group.id) ?? [],
      }))
      .sort(compareSortAndName),
    metrics,
    sampleTypes,
    templates: rows.templates.map((template) => {
      const assignments = assignmentsByTemplate.get(template.id) ?? [];
      const templateMetrics = assignments
        .toSorted((left, right) => left.sort_order - right.sort_order)
        .flatMap((assignment) => {
          const metric = metricsById.get(assignment.result_metric_id);
          return metric ? [metric] : [];
        });

      return {
        id: template.id,
        organizationId: template.organization_id,
        sampleTypeId: template.sample_type_id,
        sampleTypeName:
          sampleTypeById.get(template.sample_type_id)?.name ?? "Khác",
        code: template.code,
        name: template.name,
        isActive: template.is_active,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        metrics: templateMetrics,
      };
    }),
  };
}

export function getResultConfigurationSummary(
  config: ResultConfiguration
): ResultConfigurationSummary {
  return {
    groups: config.groups.filter((group) => group.isActive).length,
    metrics: config.metrics.filter((metric) => metric.isActive).length,
    templates: config.templates.filter((template) => template.isActive).length,
    requiredMetrics: config.metrics.filter((metric) => metric.isRequired)
      .length,
  };
}

export function filterResultConfiguration(
  config: ResultConfiguration,
  search: string
): ResultConfiguration {
  const query = search.trim().toLowerCase();

  if (!query) {
    return config;
  }

  return {
    ...config,
    groups: config.groups.filter((group) => matchesText(group, query)),
    metrics: config.metrics.filter((metric) => matchesText(metric, query)),
    templates: config.templates.filter((template) =>
      matchesText(template, query)
    ),
  };
}

function mapMetricRow(row: ResultMetricRow): ResultMetric {
  if (!isResultInputType(row.input_type)) {
    throw new Error("Unknown result input type.");
  }

  return {
    id: row.id,
    organizationId: row.organization_id,
    resultGroupId: row.result_group_id,
    code: row.code,
    name: row.name,
    inputType: row.input_type,
    unit: row.unit,
    options: Array.isArray(row.options) ? row.options : [],
    metricSettings: row.metric_settings,
    sortOrder: row.sort_order,
    isRequired: row.is_required,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  return grouped;
}

function compareSortAndName<T extends { sortOrder: number; name: string }>(
  left: T,
  right: T
) {
  return (
    left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)
  );
}

function compareName<T extends { name: string }>(left: T, right: T) {
  return left.name.localeCompare(right.name);
}

function matchesText(item: { code: string; name: string }, query: string) {
  return (
    item.code.toLowerCase().includes(query) ||
    item.name.toLowerCase().includes(query)
  );
}
