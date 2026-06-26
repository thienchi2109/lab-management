import type { DashboardOverviewData } from "@/lib/analytics/overview";

import { DashboardMetricCard } from "./dashboard-metric-card";
import { DashboardRecentSamplesCard } from "./dashboard-recent-samples-card";
import { DashboardTrendCard } from "./dashboard-trend-card";

type DashboardMainGridProps = {
  overview: DashboardOverviewData;
  recentSampleMobileLimit?: number;
};

function DashboardMainGrid({
  overview,
  recentSampleMobileLimit,
}: DashboardMainGridProps) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardTrendCard trend={overview.trend} />
        <DashboardMetricCard metrics={overview.pcrMetrics} />
      </div>
      <DashboardRecentSamplesCard
        mobileSampleLimit={recentSampleMobileLimit}
        samples={overview.recentSamples}
      />
    </>
  );
}

export { DashboardMainGrid };
