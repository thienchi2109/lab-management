import type { DashboardOverviewData } from "@/lib/analytics/overview";

import { DashboardHero } from "./dashboard-hero";
import { DashboardMainGrid } from "./dashboard-main-grid";
import { DashboardStatsGrid } from "./dashboard-stats-grid";

type DashboardPageContentProps = {
  overview: DashboardOverviewData;
};

function DashboardPageContent({ overview }: DashboardPageContentProps) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <DashboardHero dateRangeLabel={overview.trend.dateRangeLabel} />
      <DashboardStatsGrid stats={overview.stats} />
      <DashboardMainGrid overview={overview} />
    </div>
  );
}

export { DashboardPageContent };
