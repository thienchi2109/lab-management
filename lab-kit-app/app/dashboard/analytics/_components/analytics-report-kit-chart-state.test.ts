import { describe, expect, test } from "vitest";

import {
  applyReportKitChartContract,
  createReportKitChartState,
  formatReportKitChartFilterSummary,
  updateReportKitChartFilters,
} from "./analytics-report-kit-chart-state";

import type { ReportKitAnalyticsContract } from "@/lib/analytics/report-kit";

describe("analytics report kit chart state", () => {
  test("updates filters for one chartId without mutating the other chart states", () => {
    const state = createReportKitChartState(createContract());
    const untouchedChart = state.datasets.kitQuantityByKitType;

    const updated = updateReportKitChartFilters(
      state,
      "kitQuantityBySampleType",
      {
        receivedFrom: "2026-06-05",
        receivedTo: "2026-06-10",
      }
    );

    expect(updated.datasets.kitQuantityBySampleType.filters).toEqual({
      receivedFrom: "2026-06-05",
      receivedTo: "2026-06-10",
    });
    expect(updated.datasets.kitQuantityByKitType).toBe(untouchedChart);
    expect(updated.datasets.kitQuantityByKitType.filters).toEqual({
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
    });
    expect(state.datasets.kitQuantityBySampleType.filters).toEqual({
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
    });
  });

  test("replaces only the returned chart dataset and summary", () => {
    const state = createReportKitChartState(createContract());
    const untouchedChart = state.datasets.kitQuantityByKitType;
    const updatedContract = createContract({
      charts: ["kitQuantityBySampleType"],
      datasets: {
        kitQuantityBySampleType: {
          chartId: "kitQuantityBySampleType",
          segments: [
            {
              key: "nuoc-ao",
              label: "Nước ao",
              metrics: { totalKitQuantity: 7 },
            },
          ],
          warnings: [],
        },
      },
      filters: { receivedFrom: "2026-06-05", receivedTo: "2026-06-10" },
    });

    const updated = applyReportKitChartContract(state, updatedContract);

    expect(updated.datasets.kitQuantityBySampleType.dataset.segments).toEqual([
      {
        key: "nuoc-ao",
        label: "Nước ao",
        metrics: { totalKitQuantity: 7 },
      },
    ]);
    expect(updated.datasets.kitQuantityBySampleType.filterSummary).toEqual([
      "Từ 05/06/2026 đến 10/06/2026",
    ]);
    expect(updated.datasets.kitQuantityByKitType).toBe(untouchedChart);
  });

  test("formats date range summaries from the per-chart filters", () => {
    expect(
      formatReportKitChartFilterSummary({
        receivedFrom: "2026-06-01",
        receivedTo: "2026-06-08",
      })
    ).toEqual(["Từ 01/06/2026 đến 08/06/2026"]);
  });
});

function createContract(
  override: {
    charts?: ReportKitAnalyticsContract["charts"];
    datasets?: Partial<ReportKitAnalyticsContract["datasets"]>;
    filters?: ReportKitAnalyticsContract["query"]["filters"];
  } = {}
): ReportKitAnalyticsContract {
  const filters = override.filters ?? {
    receivedFrom: "2026-06-01",
    receivedTo: "2026-06-08",
  };

  return {
    charts: override.charts ?? [
      "kitQuantityBySampleType",
      "kitQuantityByKitType",
      "sampleCountByClassification",
      "cleanShrimpPlByGeneralPcrConclusion",
    ],
    datasets: {
      cleanShrimpPlByGeneralPcrConclusion: {
        chartId: "cleanShrimpPlByGeneralPcrConclusion",
        segments: [],
        warnings: [],
      },
      kitQuantityByKitType: {
        chartId: "kitQuantityByKitType",
        segments: [
          { key: "kit-a", label: "KIT A", metrics: { totalKitQuantity: 2 } },
        ],
        warnings: [],
      },
      kitQuantityBySampleType: {
        chartId: "kitQuantityBySampleType",
        segments: [
          { key: "tom-pl", label: "Tôm PL", metrics: { totalKitQuantity: 2 } },
        ],
        warnings: [],
      },
      sampleCountByClassification: {
        chartId: "sampleCountByClassification",
        segments: [],
        warnings: [],
      },
      ...override.datasets,
    },
    filterSummary: ["Khoảng ngày đã chọn"],
    query: {
      dimensions: ["sampleType", "kitType"],
      filterSummary: ["Khoảng ngày đã chọn"],
      filters,
      limit: 50,
      measures: ["sampleCount"],
      offset: 0,
      page: 1,
      pageSize: 50,
    },
  };
}
