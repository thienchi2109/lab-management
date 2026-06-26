import type { DashboardOverviewData } from "@/lib/analytics/overview";

import { PageContainer } from "@/components/layout/page-container";

import { DashboardHero } from "./dashboard-hero";
import { DashboardMainGrid } from "./dashboard-main-grid";
import { DashboardStatsGrid } from "./dashboard-stats-grid";

type DashboardPageContentProps = {
  overview: DashboardOverviewData;
  recentSampleMobileLimit?: number;
};

function DashboardPageContent({
  overview,
  recentSampleMobileLimit,
}: DashboardPageContentProps) {
  return (
    <PageContainer className="gap-6 md:gap-8">
      <DashboardHero dateRangeLabel={overview.trend.dateRangeLabel} />
      <DashboardStatsGrid stats={overview.stats} />
      <DashboardMainGrid
        overview={overview}
        recentSampleMobileLimit={recentSampleMobileLimit}
      />
    </PageContainer>
  );
}

export { DashboardPageContent };
