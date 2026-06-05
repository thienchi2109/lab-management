import { describe, expect, test } from "vitest";

import {
  filterResultConfiguration,
  getResultConfigurationSummary,
  mapResultConfigurationRows,
} from "./configuration";

const rows = {
  groups: [
    {
      id: "group-pcr",
      organization_id: "org-1",
      code: "PCR",
      name: "PCR",
      sort_order: 20,
      is_active: true,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-02T00:00:00.000Z",
    },
    {
      id: "group-mic",
      organization_id: "org-1",
      code: "MIC",
      name: "Vi sinh",
      sort_order: 10,
      is_active: false,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-02T00:00:00.000Z",
    },
  ],
  metrics: [
    {
      id: "metric-ct",
      organization_id: "org-1",
      result_group_id: "group-pcr",
      code: "PCR_REALTIME",
      name: "PCR Realtime Ct",
      input_type: "pcr_realtime",
      unit: "Ct",
      options: [],
      metric_settings: { positive_threshold: 35 },
      sort_order: 20,
      is_required: true,
      is_active: true,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-02T00:00:00.000Z",
    },
    {
      id: "metric-kq",
      organization_id: "org-1",
      result_group_id: "group-pcr",
      code: "KQ_CHUNG",
      name: "Kết luận",
      input_type: "text",
      unit: null,
      options: [],
      metric_settings: {},
      sort_order: 10,
      is_required: true,
      is_active: true,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-02T00:00:00.000Z",
    },
  ],
  sampleTypes: [
    {
      id: "sample-pcr",
      code: "PCR_SAMPLE",
      name: "Mẫu PCR",
      is_active: true,
    },
  ],
  templates: [
    {
      id: "template-basic",
      organization_id: "org-1",
      sample_type_id: "sample-pcr",
      code: "PCR_BASIC",
      name: "PCR cơ bản",
      is_active: true,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-02T00:00:00.000Z",
    },
  ],
  templateMetrics: [
    {
      id: "assignment-ct",
      organization_id: "org-1",
      result_template_id: "template-basic",
      result_metric_id: "metric-ct",
      sort_order: 20,
      created_at: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "assignment-kq",
      organization_id: "org-1",
      result_template_id: "template-basic",
      result_metric_id: "metric-kq",
      sort_order: 10,
      created_at: "2026-06-01T00:00:00.000Z",
    },
  ],
};

describe("mapResultConfigurationRows", () => {
  test("maps groups, metrics, templates, and assignments in stable order", () => {
    const config = mapResultConfigurationRows(rows);

    expect(config.groups.map((group) => group.code)).toEqual(["MIC", "PCR"]);
    expect(config.groups[1]?.metrics.map((metric) => metric.code)).toEqual([
      "KQ_CHUNG",
      "PCR_REALTIME",
    ]);
    expect(config.templates[0]?.metrics.map((metric) => metric.code)).toEqual([
      "KQ_CHUNG",
      "PCR_REALTIME",
    ]);
  });

  test("keeps missing sample-type fallback neutral in mapped data", () => {
    const config = mapResultConfigurationRows({
      ...rows,
      templates: [
        {
          ...rows.templates[0],
          sample_type_id: "missing-sample-type",
        },
      ],
    });

    expect(config.templates[0]?.sampleTypeName).toBeNull();
  });

  test("falls back to text input type for unknown database values", () => {
    const config = mapResultConfigurationRows({
      ...rows,
      metrics: [
        {
          ...rows.metrics[0],
          input_type: "legacy_unknown",
        },
      ],
    });

    expect(config.metrics[0]?.inputType).toBe("text");
  });
});

describe("getResultConfigurationSummary", () => {
  test("counts active groups, metrics, templates, and required metrics", () => {
    expect(
      getResultConfigurationSummary(mapResultConfigurationRows(rows))
    ).toEqual({
      groups: 1,
      metrics: 2,
      templates: 1,
      requiredMetrics: 2,
    });
  });
});

describe("filterResultConfiguration", () => {
  test("matches group, metric, and template text", () => {
    const config = mapResultConfigurationRows(rows);

    expect(filterResultConfiguration(config, "vi sinh").groups).toHaveLength(1);
    expect(filterResultConfiguration(config, "realtime").metrics).toHaveLength(
      1
    );
    expect(filterResultConfiguration(config, "cơ bản").templates).toHaveLength(
      1
    );
  });
});
