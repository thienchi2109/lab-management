// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AnalyticsPage from "./page";

import {
  getAnalyticsActor,
  listAnalyticsDataset,
} from "@/lib/analytics/operations";
import { getDashboardOverviewData } from "@/lib/analytics/overview";
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

vi.mock("@/lib/analytics/server", () => ({
  createSupabaseDashboardOverviewPort: vi.fn(() => "overview-port"),
}));

vi.mock("../_components/dashboard-page-content", () => ({
  DashboardPageContent: dashboardPageContent,
}));

vi.mock("./_components/analytics-page-client", () => ({
  AnalyticsPageClient: analyticsPageClient,
}));

describe("AnalyticsPage", () => {
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
});
