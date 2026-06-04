import { DashboardMetricCard } from "./dashboard-metric-card";
import { DashboardRecentSamplesCard } from "./dashboard-recent-samples-card";
import { DashboardTrendCard } from "./dashboard-trend-card";

function DashboardMainGrid() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardTrendCard />
        <DashboardMetricCard />
      </div>
      <DashboardRecentSamplesCard />
    </>
  );
}

export { DashboardMainGrid };
