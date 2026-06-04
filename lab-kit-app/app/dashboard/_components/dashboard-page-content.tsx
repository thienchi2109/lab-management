import { DashboardHero } from "./dashboard-hero";
import { DashboardMainGrid } from "./dashboard-main-grid";
import { DashboardStatsGrid } from "./dashboard-stats-grid";

function DashboardPageContent() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <DashboardHero />
      <DashboardStatsGrid />
      <DashboardMainGrid />
    </div>
  );
}

export { DashboardPageContent };
