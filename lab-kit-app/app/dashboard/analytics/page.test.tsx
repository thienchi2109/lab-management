// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import AnalyticsPage from "./page";

import {
  getAnalyticsActor,
  listAnalyticsDataset,
} from "@/lib/analytics/operations";
import { getDashboardOverviewData } from "@/lib/analytics/overview";
import { listReportKitAnalyticsContract } from "@/lib/analytics/report-kit";
import { getCurrentSession } from "@/lib/auth/session";

const { dashboardPageContent, analyticsPageClient } = vi.hoisted(() => ({
  analyticsPageClient: vi.fn(() => <section>Pivot báo cáo</section>),
  dashboardPageContent: vi.fn(() => <section>Overview dashboard</section>),
}));

vi.mock("next/server", () => ({
  connection: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/analytics/operations", () => ({
  getAnalyticsActor: vi.fn(),
  listAnalyticsDataset: vi.fn(),
}));

vi.mock("@/lib/analytics/overview", () => ({
  getDashboardOverviewData: vi.fn(),
}));

vi.mock("@/lib/analytics/report-kit", () => ({
  listReportKitAnalyticsContract: vi.fn(),
}));

vi.mock("@/lib/analytics/server", () => ({
  createSupabaseDashboardOverviewPort: vi.fn(() => "overview-port"),
}));

vi.mock("@/lib/analytics/server-report-kit", () => ({
  createSupabaseReportKitAnalyticsPort: vi.fn(() => "report-kit-port"),
}));

vi.mock("../_components/dashboard-page-content", () => ({
  DashboardPageContent: dashboardPageContent,
}));

vi.mock("./_components/analytics-page-client", () => ({
  AnalyticsPageClient: analyticsPageClient,
}));

describe("AnalyticsPage", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("renders dashboard overview before the analytics pivot", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      profile: { id: "profile-1" },
    } as never);
    vi.mocked(getAnalyticsActor).mockReturnValue({
      organizationId: "org-1",
      profileId: "profile-1",
      role: "admin",
    });
    vi.mocked(listAnalyticsDataset).mockResolvedValue({
      filterSummary: [],
      query: {
        dimensions: ["receivedDate"],
        filters: {},
        filterSummary: [],
        measures: ["sampleCount"],
        limit: 50,
        offset: 0,
        page: 1,
        pageSize: 50,
      },
      rows: [],
      totals: {},
      warnings: [],
    });
    vi.mocked(getDashboardOverviewData).mockResolvedValue({
      pcrMetrics: [],
      recentSamples: [],
      stats: {
        activeKits: { detail: "", title: "", value: "" },
        cleanSamples: { detail: "", title: "", value: "" },
        positiveSamples: { detail: "", title: "", value: "" },
        totalSamples: { detail: "", title: "", value: "" },
      },
      trend: { bars: [], dateRangeLabel: "" },
    });

    render(await AnalyticsPage());

    expect(dashboardPageContent).toHaveBeenCalledTimes(1);
    expect(analyticsPageClient).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Overview dashboard")).toBeTruthy();
    expect(screen.getByText("Pivot báo cáo")).toBeTruthy();
    expect(
      screen
        .getByText("Overview dashboard")
        .compareDocumentPosition(screen.getByText("Pivot báo cáo")) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test("uses the first day of the current month through today as default filters", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    vi.mocked(getCurrentSession).mockResolvedValue({
      profile: { id: "profile-1" },
    } as never);
    vi.mocked(getAnalyticsActor).mockReturnValue({
      organizationId: "org-1",
      profileId: "profile-1",
      role: "admin",
    });
    vi.mocked(listAnalyticsDataset).mockResolvedValue({
      filterSummary: ["Từ 01/06/2026 đến 15/06/2026"],
      query: {
        dimensions: ["receivedDate"],
        filters: {
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-15",
        },
        filterSummary: ["Từ 01/06/2026 đến 15/06/2026"],
        measures: ["sampleCount"],
        limit: 50,
        offset: 0,
        page: 1,
        pageSize: 50,
      },
      rows: [],
      totals: {},
      warnings: [],
    });
    vi.mocked(getDashboardOverviewData).mockResolvedValue({
      pcrMetrics: [],
      recentSamples: [],
      stats: {
        activeKits: { detail: "", title: "", value: "" },
        cleanSamples: { detail: "", title: "", value: "" },
        positiveSamples: { detail: "", title: "", value: "" },
        totalSamples: { detail: "", title: "", value: "" },
      },
      trend: { bars: [], dateRangeLabel: "" },
    });

    render(await AnalyticsPage());

    expect(listAnalyticsDataset).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-15",
        },
      }),
      expect.anything(),
      expect.anything()
    );
    expect(analyticsPageClient).toHaveBeenCalledWith(
      expect.objectContaining({
        initialFilters: {
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-15",
        },
      }),
      undefined
    );
  });

  test("loads the report kit chart contract with the same bounded default filters", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    vi.mocked(getCurrentSession).mockResolvedValue({
      profile: { id: "profile-1" },
    } as never);
    vi.mocked(getAnalyticsActor).mockReturnValue({
      organizationId: "org-1",
      profileId: "profile-1",
      role: "admin",
    });
    vi.mocked(listAnalyticsDataset).mockResolvedValue({
      filterSummary: ["Khoảng ngày đã chọn"],
      query: {
        dimensions: ["receivedDate"],
        filters: {
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-15",
        },
        filterSummary: ["Khoảng ngày đã chọn"],
        measures: ["sampleCount"],
        limit: 50,
        offset: 0,
        page: 1,
        pageSize: 50,
      },
      rows: [],
      totals: {},
      warnings: [],
    });
    vi.mocked(getDashboardOverviewData).mockResolvedValue({
      pcrMetrics: [],
      recentSamples: [],
      stats: {
        activeKits: { detail: "", title: "", value: "" },
        cleanSamples: { detail: "", title: "", value: "" },
        positiveSamples: { detail: "", title: "", value: "" },
        totalSamples: { detail: "", title: "", value: "" },
      },
      trend: { bars: [], dateRangeLabel: "" },
    });
    vi.mocked(listReportKitAnalyticsContract).mockResolvedValue({
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
        filters: {
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-15",
        },
        filterSummary: ["Khoảng ngày đã chọn"],
        limit: 50,
        measures: ["sampleCount"],
        offset: 0,
        page: 1,
        pageSize: 50,
      },
    });

    render(await AnalyticsPage());

    expect(listReportKitAnalyticsContract).toHaveBeenCalledWith(
      {
        filters: {
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-15",
        },
      },
      expect.objectContaining({ organizationId: "org-1" }),
      "report-kit-port"
    );
    expect(analyticsPageClient).toHaveBeenCalledWith(
      expect.objectContaining({
        initialReportKitContract: expect.objectContaining({
          charts: [
            "kitQuantityBySampleType",
            "kitQuantityByKitType",
            "sampleCountByClassification",
            "cleanShrimpPlByGeneralPcrConclusion",
          ],
        }),
      }),
      undefined
    );
  });
});
