import { redirect } from "next/navigation";
import { connection } from "next/server";

import {
  getAnalyticsActor,
  listAnalyticsDataset,
} from "@/lib/analytics/operations";
import { createSupabaseDashboardOverviewPort } from "@/lib/analytics/server";
import { getCurrentSession } from "@/lib/auth/session";

import { AnalyticsPageClient } from "./_components/analytics-page-client";

/** Render analytics pivot page with a bounded default query. */
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
  const initialDataset = await listAnalyticsDataset(
    {
      dimensions: ["receivedDate"],
      filters: initialFilters,
      measures: ["sampleCount", "positiveCount"],
    },
    actor,
    createSupabaseDashboardOverviewPort()
  );

  return (
    <AnalyticsPageClient
      initialDataset={initialDataset}
      initialFilters={initialFilters}
    />
  );
}

function getDefaultAnalyticsFilters(now: Date) {
  const receivedTo = toIsoDate(now);
  const receivedFrom = toIsoDate(
    new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6)
    )
  );

  return { receivedFrom, receivedTo };
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
