import { redirect } from "next/navigation";
import { connection } from "next/server";

import {
  getAnalyticsActor,
  listAnalyticsDataset,
} from "@/lib/analytics/operations";
import { getDashboardOverviewData } from "@/lib/analytics/overview";
import {
  listReportKitAnalyticsContract,
  REPORT_KIT_ANALYTICS_CHART_IDS,
  type ReportKitAnalyticsContract,
} from "@/lib/analytics/report-kit";
import {
  canSaveReportKitFilterPreset,
  mergeReportKitDefaultFilters,
  type ReportKitFilterPresetConfig,
} from "@/lib/analytics/report-kit-presets";
import type { AnalyticsFilters } from "@/lib/analytics/query";
import { createSupabaseDashboardOverviewPort } from "@/lib/analytics/server";
import { createSupabaseReportKitAnalyticsPort } from "@/lib/analytics/server-report-kit";
import { createSupabaseReportKitPresetPort } from "@/lib/analytics/server-report-kit-presets";
import { getCurrentSession } from "@/lib/auth/session";

import { DashboardPageContent } from "../_components/dashboard-page-content";
import { AnalyticsPageClient } from "./_components/analytics-page-client";

/** Render Báo cáo với dashboard overview và pivot analytics bounded. */
export default async function AnalyticsPage() {
  await connection();

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const actor = getAnalyticsActor(session);

  if (!actor) {
    return (
      <div className="rounded-lg border bg-background p-6">
        <h1 className="text-xl font-semibold">
          Bạn chưa có quyền xem analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tài khoản hiện tại không có quyền đọc dashboard analytics.
        </p>
      </div>
    );
  }

  const initialFilters = getDefaultAnalyticsFilters(new Date());
  const overviewPort = createSupabaseDashboardOverviewPort();
  const reportKitPort = createSupabaseReportKitAnalyticsPort();
  const presetPort = createSupabaseReportKitPresetPort();
  const [overview, initialDataset, savedPreset] = await Promise.all([
    getDashboardOverviewData(actor, overviewPort),
    listAnalyticsDataset(
      {
        dimensions: ["receivedDate"],
        filters: initialFilters,
        measures: ["sampleCount", "positiveCount"],
      },
      actor,
      overviewPort
    ),
    presetPort.readPreset(actor.organizationId).catch(() => null),
  ]);
  const initialReportKitFiltersByChart = mergeReportKitDefaultFilters(
    initialFilters,
    savedPreset?.config
  );
  const initialReportKitContract = await loadInitialReportKitContract(
    actor,
    reportKitPort,
    initialReportKitFiltersByChart
  );
  const initialReportKitPresetConfig = toPresetConfig(
    initialReportKitFiltersByChart
  );

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <DashboardPageContent overview={overview} />
      <AnalyticsPageClient
        canSaveReportKitPreset={canSaveReportKitFilterPreset(actor)}
        initialDataset={initialDataset}
        initialFilters={initialFilters}
        initialReportKitFiltersByChart={initialReportKitPresetConfig.charts}
        initialReportKitContract={initialReportKitContract}
      />
    </div>
  );
}

function toPresetConfig(
  filtersByChart: Record<
    (typeof REPORT_KIT_ANALYTICS_CHART_IDS)[number],
    AnalyticsFilters
  >
): ReportKitFilterPresetConfig {
  return {
    charts: Object.fromEntries(
      Object.entries(filtersByChart).map(([chartId, filters]) => [
        chartId,
        { filters },
      ])
    ),
  };
}

async function loadInitialReportKitContract(
  actor: NonNullable<ReturnType<typeof getAnalyticsActor>>,
  reportKitPort: ReturnType<typeof createSupabaseReportKitAnalyticsPort>,
  filtersByChart: Record<
    (typeof REPORT_KIT_ANALYTICS_CHART_IDS)[number],
    AnalyticsFilters
  >
): Promise<ReportKitAnalyticsContract | undefined> {
  try {
    const contracts = await Promise.all(
      REPORT_KIT_ANALYTICS_CHART_IDS.map((chartId) =>
        listReportKitAnalyticsContract(
          { charts: [chartId], filters: filtersByChart[chartId] },
          actor,
          reportKitPort
        )
      )
    );
    const [firstContract] = contracts;

    if (!firstContract) return undefined;

    return {
      ...firstContract,
      charts: [...REPORT_KIT_ANALYTICS_CHART_IDS],
      datasets: Object.fromEntries(
        contracts.map((contract) => {
          const [chartId] = contract.charts;

          return [chartId, contract.datasets[chartId]];
        })
      ) as ReportKitAnalyticsContract["datasets"],
    };
  } catch {
    return undefined;
  }
}

function getDefaultAnalyticsFilters(now: Date) {
  const receivedTo = toIsoDate(now);
  const receivedFrom = toIsoDate(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );

  return { receivedFrom, receivedTo };
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
