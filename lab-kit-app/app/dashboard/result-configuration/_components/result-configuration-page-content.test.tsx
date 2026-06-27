import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { mapResultConfigurationRows } from "@/lib/result-configuration/configuration";

import { ResultConfigurationPageContent } from "./result-configuration-page-content";

vi.mock("../actions", () => ({
  createGroupAction: vi.fn(),
  createMetricAction: vi.fn(),
  createTemplateAction: vi.fn(),
}));

const config = mapResultConfigurationRows({
  groups: [
    {
      id: "group-pcr",
      organization_id: "org-1",
      code: "PCR",
      name: "PCR",
      sort_order: 10,
      is_active: true,
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
  templateMetrics: [],
});

describe("ResultConfigurationPageContent", () => {
  test("renders operational result-configuration controls", () => {
    const html = renderToStaticMarkup(
      <ResultConfigurationPageContent config={config} />
    );

    expect(html).toContain("Cấu hình chỉ tiêu");
    expect(html).toContain("Thêm nhóm");
    expect(html).toContain("PCR Realtime Ct");
    expect(html).toContain("Mẫu cấu hình");
  });

  test("renders mobile-first layout landmarks", () => {
    const html = renderToStaticMarkup(
      <ResultConfigurationPageContent config={config} />
    );

    expect(html).toContain('aria-label="Thao tác cấu hình"');
    expect(html).toContain('aria-label="Tổng quan cấu hình"');
    expect(html).toContain("Chọn phạm vi hiển thị");
    expect(html).toContain('aria-label="Danh sách cấu hình"');
    expect(html).toContain("pb-24");
  });
});
