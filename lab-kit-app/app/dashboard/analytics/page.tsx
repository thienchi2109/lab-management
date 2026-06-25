import { redirect } from "next/navigation";
import { connection } from "next/server";

import {
  getAnalyticsActor,
  listAnalyticsDataset,
} from "@/lib/analytics/operations";
import { getDashboardOverviewData } from "@/lib/analytics/overview";
import { listReportKitAnalyticsContract } from "@/lib/analytics/report-kit";
import { createSupabaseDashboardOverviewPort } from "@/lib/analytics/server";
import { createSupabaseReportKitAnalyticsPort } from "@/lib/analytics/server-report-kit";
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
  const [overview, initialDataset, initialReportKitContract] =
    await Promise.all([
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
      listReportKitAnalyticsContract(
        { filters: initialFilters },
        actor,
        reportKitPort
      ),
    ]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <DashboardPageContent overview={overview} />
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={initialFilters}
        initialReportKitContract={initialReportKitContract}
      />
    </div>
  );
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
