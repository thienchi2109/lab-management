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

import type { ReportKitAnalyticsContract } from "@/lib/analytics/report-kit";

import { AnalyticsReportKitCharts } from "./analytics-report-kit-charts";

describe("AnalyticsReportKitCharts preset UI", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test("lets Admin save the current per-chart filters as organization preset", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        config: { charts: {} },
        updatedAt: "2026-06-20T00:00:00.000Z",
        updatedBy: "profile-admin",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalyticsReportKitCharts contract={createContract()} canSavePreset />
    );

    const sampleTypeChart = within(
      screen.getByRole("region", { name: "Tổng lượng KIT theo loại mẫu" })
    );
    fireEvent.change(sampleTypeChart.getByLabelText("Từ ngày"), {
      target: { value: "2026-06-05" },
    });

    await user.click(
      screen.getByRole("button", { name: "Lưu preset mặc định" })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/analytics/report-kit/preset",
      expect.objectContaining({ method: "PUT" })
    );
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      charts: {
        cleanShrimpPlByGeneralPcrConclusion: {
          filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
        },
        kitQuantityByKitType: {
          filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
        },
        kitQuantityBySampleType: {
          filters: { receivedFrom: "2026-06-05", receivedTo: "2026-06-08" },
        },
        sampleCountByClassification: {
          filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
        },
      },
    });
    const message = await screen.findByRole("status");
    expect(message.getAttribute("aria-live")).toBe("polite");
    expect(message.textContent).toBe("Đã lưu preset mặc định.");
    expect(message.className).toContain("text-primary");
  });

  test("clears the saved preset message when filters become dirty again", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ config: { charts: {} } }))
    );

    render(
      <AnalyticsReportKitCharts contract={createContract()} canSavePreset />
    );

    await user.click(
      screen.getByRole("button", { name: "Lưu preset mặc định" })
    );
    expect((await screen.findByRole("status")).textContent).toBe(
      "Đã lưu preset mặc định."
    );

    const sampleTypeChart = within(
      screen.getByRole("region", { name: "Tổng lượng KIT theo loại mẫu" })
    );
    fireEvent.change(sampleTypeChart.getByLabelText("Từ ngày"), {
      target: { value: "2026-06-05" },
    });

    expect(screen.queryByRole("status")).toBeNull();
  });

  test("announces preset save errors with error styling", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            message: "Bạn không có quyền lưu preset báo cáo.",
            status: "error",
          },
          { status: 403 }
        )
      )
    );

    render(
      <AnalyticsReportKitCharts contract={createContract()} canSavePreset />
    );

    await user.click(
      screen.getByRole("button", { name: "Lưu preset mặc định" })
    );

    const message = await screen.findByRole("alert");
    expect(message.getAttribute("aria-live")).toBe("assertive");
    expect(message.textContent).toBe("Bạn không có quyền lưu preset báo cáo.");
    expect(message.className).toContain("text-destructive");
  });

  test("does not show preset persistence controls for Viewer", () => {
    render(
      <AnalyticsReportKitCharts
        contract={createContract()}
        canSavePreset={false}
      />
    );

    expect(
      screen.queryByRole("button", { name: "Lưu preset mặc định" })
    ).toBeNull();
  });
});

function createContract(): ReportKitAnalyticsContract {
  return {
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
        segments: [],
        warnings: [],
      },
      kitQuantityBySampleType: {
        chartId: "kitQuantityBySampleType",
        segments: [],
        warnings: [],
      },
      sampleCountByClassification: {
        chartId: "sampleCountByClassification",
        segments: [],
        warnings: [],
      },
    },
    filterSummary: ["Khoảng ngày đã chọn"],
    query: {
      dimensions: ["sampleType", "kitType"],
      filterSummary: ["Khoảng ngày đã chọn"],
      filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
      limit: 50,
      measures: ["sampleCount"],
      offset: 0,
      page: 1,
      pageSize: 50,
    },
  };
}
