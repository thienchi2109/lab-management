// @vitest-environment jsdom

import userEvent from "@testing-library/user-event";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AnalyticsPageClient } from "./analytics-page-client";

import type { ReportKitAnalyticsContract } from "@/lib/analytics/report-kit";

const initialDataset = {
  filterSummary: ["Khoảng ngày đã chọn"],
  rows: [],
  totals: {},
  warnings: [],
};

const initialReportKitContract: ReportKitAnalyticsContract = {
  charts: [
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
        { key: "kit-b", label: "KIT B", metrics: { totalKitQuantity: 1 } },
      ],
      warnings: [],
    },
    kitQuantityBySampleType: {
      chartId: "kitQuantityBySampleType",
      segments: [
        { key: "tom-pl", label: "Tôm PL", metrics: { totalKitQuantity: 2 } },
        { key: "ca", label: "Cá", metrics: { totalKitQuantity: 1 } },
      ],
      warnings: [],
    },
    sampleCountByClassification: {
      chartId: "sampleCountByClassification",
      segments: [
        {
          key: "customer",
          label: "Mẫu khách hàng",
          metrics: { sampleCount: 3 },
        },
        { key: "internal", label: "Mẫu nội bộ", metrics: { sampleCount: 1 } },
      ],
      warnings: [],
    },
  },
  filterSummary: ["Khoảng ngày đã chọn"],
  query: {
    dimensions: ["sampleType", "kitType"],
    filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
    filterSummary: ["Khoảng ngày đã chọn"],
    limit: 50,
    measures: ["sampleCount"],
    offset: 0,
    page: 1,
    pageSize: 50,
  },
};

describe("AnalyticsPageClient report kit charts", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test("renders four report kit pie charts with segment counts and percentages", () => {
    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
        initialReportKitContract={initialReportKitContract}
      />
    );

    expect(screen.getAllByLabelText(/Biểu đồ báo cáo/)).toHaveLength(4);
    expect(screen.queryByRole("combobox", { name: /biểu đồ/i })).toBeNull();

    const sampleTypeChart = within(
      screen.getByRole("region", {
        name: "Tổng lượng KIT theo loại mẫu",
      })
    );
    expect(sampleTypeChart.getByText("Tôm PL")).toBeTruthy();
    expect(sampleTypeChart.getByText("2")).toBeTruthy();
    expect(sampleTypeChart.getByText("66.7%")).toBeTruthy();
    expect(sampleTypeChart.getByText("Cá")).toBeTruthy();
    expect(sampleTypeChart.getByText("33.3%")).toBeTruthy();

    expect(
      screen.getByRole("region", { name: "Tổng lượng KIT theo loại KIT" })
    ).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Tổng lượng mẫu theo phân loại" })
    ).toBeTruthy();
    expect(
      screen.getByRole("region", {
        name: "Tôm PL sạch theo kết quả chung PCR",
      })
    ).toBeTruthy();
  });

  test("renders an empty state inside only the chart with an empty dataset", () => {
    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
        initialReportKitContract={initialReportKitContract}
      />
    );

    const emptyChart = within(
      screen.getByRole("region", {
        name: "Tôm PL sạch theo kết quả chung PCR",
      })
    );
    const filledChart = within(
      screen.getByRole("region", {
        name: "Tổng lượng KIT theo loại mẫu",
      })
    );

    expect(
      emptyChart.getByText("Chưa có dữ liệu cho biểu đồ này.")
    ).toBeTruthy();
    expect(
      filledChart.queryByText("Chưa có dữ liệu cho biểu đồ này.")
    ).toBeNull();
  });

  test("updates one chart filter without changing another chart summary or dataset", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        ...initialReportKitContract,
        charts: ["kitQuantityBySampleType"],
        datasets: {
          ...initialReportKitContract.datasets,
          kitQuantityBySampleType: {
            chartId: "kitQuantityBySampleType",
            segments: [
              {
                key: "nuoc-ao",
                label: "Nước ao",
                metrics: { totalKitQuantity: 5 },
              },
            ],
            warnings: [],
          },
        },
        query: {
          ...initialReportKitContract.query,
          filters: {
            receivedFrom: "2026-06-05",
            receivedTo: "2026-06-08",
          },
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
        initialReportKitContract={initialReportKitContract}
      />
    );

    const sampleTypeChart = within(
      screen.getByRole("region", {
        name: "Tổng lượng KIT theo loại mẫu",
      })
    );
    const kitTypeChart = within(
      screen.getByRole("region", {
        name: "Tổng lượng KIT theo loại KIT",
      })
    );

    expect(
      sampleTypeChart.getByText("Từ 01/06/2026 đến 08/06/2026")
    ).toBeTruthy();
    expect(kitTypeChart.getByText("Từ 01/06/2026 đến 08/06/2026")).toBeTruthy();

    fireEvent.change(sampleTypeChart.getByLabelText("Từ ngày"), {
      target: { value: "2026-06-05" },
    });
    await user.click(
      sampleTypeChart.getByRole("button", {
        name: "Áp dụng bộ lọc biểu đồ",
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/analytics/report-kit",
      expect.objectContaining({
        body: JSON.stringify({
          charts: ["kitQuantityBySampleType"],
          filters: {
            receivedFrom: "2026-06-05",
            receivedTo: "2026-06-08",
          },
        }),
      })
    );
    expect(await sampleTypeChart.findByText("Nước ao")).toBeTruthy();
    expect(sampleTypeChart.queryByText("Tôm PL")).toBeNull();
    expect(
      sampleTypeChart.getByText("Từ 05/06/2026 đến 08/06/2026")
    ).toBeTruthy();

    expect(kitTypeChart.getByText("KIT A")).toBeTruthy();
    expect(kitTypeChart.getByText("KIT B")).toBeTruthy();
    expect(kitTypeChart.getByText("Từ 01/06/2026 đến 08/06/2026")).toBeTruthy();
  });
});
