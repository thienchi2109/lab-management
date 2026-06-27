// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ReportKitChartCard } from "./analytics-report-kit-chart-card";

import type { ReportKitChartDatasetState } from "./analytics-report-kit-chart-state";
import type { ReportKitAnalyticsChartId } from "@/lib/analytics/report-kit";

const chartExpectations: Array<{
  chartId: ReportKitAnalyticsChartId;
  marker: string;
  title: string;
}> = [
  {
    chartId: "kitQuantityBySampleType",
    marker: "Theo loại mẫu",
    title: "Tổng lượng KIT theo loại mẫu",
  },
  {
    chartId: "kitQuantityByKitType",
    marker: "Theo loại KIT",
    title: "Tổng lượng KIT theo loại KIT",
  },
  {
    chartId: "sampleCountByClassification",
    marker: "Theo phân loại",
    title: "Tổng lượng mẫu theo phân loại",
  },
  {
    chartId: "cleanShrimpPlByGeneralPcrConclusion",
    marker: "Tôm PL sạch",
    title: "Tôm PL sạch theo kết quả chung PCR",
  },
];

describe("ReportKitChartCard", () => {
  test.each(chartExpectations)(
    "renders a distinctive title marker for $chartId",
    ({ chartId, marker, title }) => {
      render(
        <ReportKitChartCard
          chartState={createChartState(chartId)}
          onFilterChange={vi.fn()}
          onOpenFilter={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      const chart = within(screen.getByRole("region", { name: title }));

      expect(chart.getByRole("heading", { name: title })).toBeTruthy();
      expect(chart.getByText(marker)).toBeTruthy();
      expect(
        chart.getByLabelText(`Dấu hiệu nhận diện biểu đồ: ${marker}`)
      ).toBeTruthy();
      expect(chart.getByText("Xem biểu đồ")).toBeTruthy();
    }
  );
});

function createChartState(
  chartId: ReportKitAnalyticsChartId
): ReportKitChartDatasetState {
  return {
    dataset: {
      chartId,
      segments: [
        {
          key: "primary",
          label: "Nhóm chính",
          metrics: {
            cleanCount: 2,
            sampleCount: 2,
            totalKitQuantity: 2,
          },
        },
      ],
      warnings: [],
    },
    error: null,
    filterSummary: ["Từ 01/06/2026 đến 08/06/2026"],
    filters: {
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
    },
    isLoading: false,
  };
}
