// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import AnalyticsPage from "./page";

import {
  getAnalyticsActor,
  listAnalyticsDataset,
} from "@/lib/analytics/operations";
import { getDashboardOverviewData } from "@/lib/analytics/overview";
import { listReportKitAnalyticsContract } from "@/lib/analytics/report-kit";
import { createSupabaseReportKitPresetPort } from "@/lib/analytics/server-report-kit-presets";
import { getCurrentSession } from "@/lib/auth/session";

const { analyticsPageClient, chartIds, dashboardPageContent } = vi.hoisted(
  () => ({
    analyticsPageClient: vi.fn(() => <section>Pivot báo cáo</section>),
    chartIds: [
      "kitQuantityBySampleType",
      "kitQuantityByKitType",
      "sampleCountByClassification",
      "cleanShrimpPlByGeneralPcrConclusion",
    ] as const,
    dashboardPageContent: vi.fn(() => <section>Overview dashboard</section>),
  })
);

vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentSession: vi.fn() }));
vi.mock("@/lib/analytics/operations", () => ({
  getAnalyticsActor: vi.fn(),
  listAnalyticsDataset: vi.fn(),
}));
vi.mock("@/lib/analytics/overview", () => ({
  getDashboardOverviewData: vi.fn(),
}));
vi.mock("@/lib/analytics/report-kit", () => ({
  REPORT_KIT_ANALYTICS_CHART_IDS: chartIds,
  listReportKitAnalyticsContract: vi.fn(),
}));
vi.mock("@/lib/analytics/server", () => ({
  createSupabaseDashboardOverviewPort: vi.fn(() => "overview-port"),
}));
vi.mock("@/lib/analytics/server-report-kit", () => ({
  createSupabaseReportKitAnalyticsPort: vi.fn(() => "report-kit-port"),
}));
vi.mock("@/lib/analytics/server-report-kit-presets", () => ({
  createSupabaseReportKitPresetPort: vi.fn(),
}));
vi.mock("../_components/dashboard-page-content", () => ({
  DashboardPageContent: dashboardPageContent,
}));
vi.mock("./_components/analytics-page-client", () => ({
  AnalyticsPageClient: analyticsPageClient,
}));

describe("AnalyticsPage report kit preset bootstrap", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("loads report kit charts with saved preset filters by chart", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    mockPageData();
    vi.mocked(createSupabaseReportKitPresetPort).mockReturnValue({
      readPreset: vi.fn(async () => ({
        config: {
          charts: {
            kitQuantityBySampleType: {
              filters: { receivedFrom: "2026-06-05", sampleTypeId: "pl" },
            },
          },
        },
        updatedAt: "2026-06-20T00:00:00.000Z",
        updatedBy: "profile-admin",
      })),
      savePreset: vi.fn(),
    });
    vi.mocked(listReportKitAnalyticsContract).mockImplementation(
      async (input) => createContract(input as { charts: [ChartId] })
    );

    render(await AnalyticsPage());

    expect(listReportKitAnalyticsContract).toHaveBeenCalledTimes(4);
    expect(listReportKitAnalyticsContract).toHaveBeenCalledWith(
      {
        charts: ["kitQuantityBySampleType"],
        filters: {
          receivedFrom: "2026-06-05",
          receivedTo: "2026-06-15",
          sampleTypeId: "pl",
        },
      },
      expect.objectContaining({ organizationId: "org-1" }),
      "report-kit-port"
    );
    expect(analyticsPageClient).toHaveBeenCalledWith(
      expect.objectContaining({
        canSaveReportKitPreset: true,
        initialReportKitFiltersByChart: expect.objectContaining({
          kitQuantityBySampleType: {
            filters: expect.objectContaining({ sampleTypeId: "pl" }),
          },
        }),
      }),
      undefined
    );
  });
});

type ChartId = (typeof chartIds)[number];

function mockPageData() {
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
      filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-15" },
      filterSummary: ["Khoảng ngày đã chọn"],
      limit: 50,
      measures: ["sampleCount"],
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
}

function createContract(input: { charts: [ChartId]; filters?: unknown }) {
  const [chartId] = input.charts;

  return {
    charts: [chartId],
    datasets: Object.fromEntries(
      chartIds.map((id) => [id, { chartId: id, segments: [], warnings: [] }])
    ),
    filterSummary: ["Khoảng ngày đã chọn"],
    query: {
      dimensions: ["sampleType", "kitType"],
      filters: input.filters,
      filterSummary: ["Khoảng ngày đã chọn"],
      limit: 50,
      measures: ["sampleCount"],
      offset: 0,
      page: 1,
      pageSize: 50,
    },
  } as never;
}
