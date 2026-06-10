// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AnalyticsPageClient } from "./analytics-page-client";

const initialDataset = {
  filterSummary: ["Từ 01/06/2026 đến 08/06/2026"],
  rows: [
    {
      dimensionValues: { receivedDate: "2026-06-01" },
      measureValues: { sampleCount: 3, positiveCount: 1 },
    },
  ],
  totals: { sampleCount: 3, positiveCount: 1 },
  warnings: [],
};

describe("AnalyticsPageClient", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("renders filter summary, pivot chart, and responsive table from initial data", () => {
    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Báo cáo thống kê & Pivot" })
    ).toBeTruthy();
    expect(screen.getByText("Từ 01/06/2026 đến 08/06/2026")).toBeTruthy();
    expect(screen.getAllByText("2026-06-01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3 mẫu").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Biểu đồ pivot analytics")).toBeTruthy();
    expect(screen.getAllByText("Bảng pivot analytics").length).toBeGreaterThan(
      0
    );
  });

  test("submits bounded filters to the pivot API and renders the returned dataset", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        filterSummary: ["Từ 02/06/2026 đến 09/06/2026", "Trạng thái: Hoàn tất"],
        rows: [
          {
            dimensionValues: { pcrMetric: "DIV1" },
            measureValues: { sampleCount: 5, positiveCount: 2 },
          },
        ],
        totals: { sampleCount: 5, positiveCount: 2 },
        warnings: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    fireEvent.change(screen.getByLabelText("Từ ngày"), {
      target: { value: "2026-06-02" },
    });
    fireEvent.change(screen.getByLabelText("Đến ngày"), {
      target: { value: "2026-06-09" },
    });
    fireEvent.change(screen.getByLabelText("Trạng thái"), {
      target: { value: "completed" },
    });
    fireEvent.change(screen.getByLabelText("Chiều pivot"), {
      target: { value: "pcrMetric" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));

    await waitFor(() =>
      expect(screen.getAllByText("DIV1").length).toBeGreaterThan(0)
    );
    expect(screen.getAllByText("5 mẫu").length).toBeGreaterThan(0);
    expect(screen.getByText("Trạng thái: Hoàn tất")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/analytics/pivot",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          dimensions: ["pcrMetric"],
          measures: ["sampleCount", "positiveCount"],
          filters: {
            receivedFrom: "2026-06-02",
            receivedTo: "2026-06-09",
            status: "completed",
          },
        }),
      })
    );
  });

  test("renders an API error without dropping the last good dataset", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: "Không thể tải dữ liệu pivot analytics.",
        }),
      })
    );

    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));

    await waitFor(() =>
      expect(
        screen.getByText("Không thể tải dữ liệu pivot analytics.")
      ).toBeTruthy()
    );
    expect(screen.getAllByText("2026-06-01").length).toBeGreaterThan(0);
  });
});
