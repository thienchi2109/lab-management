import { AlertTriangle, Clock, FlaskConical, Package } from "lucide-react";

import type { DashboardOverviewData } from "@/lib/analytics/overview";

import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardStatsGridProps = {
  stats: DashboardOverviewData["stats"];
};

function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        title={stats.totalSamples.title}
        value={stats.totalSamples.value}
        icon={FlaskConical}
        iconClassName="bg-primary/10 text-primary"
      >
        {stats.totalSamples.detail}
      </DashboardStatCard>
      <DashboardStatCard
        title={stats.activeKits.title}
        value={stats.activeKits.value}
        icon={Package}
        iconClassName="bg-secondary/80 text-secondary-foreground"
      >
        {stats.activeKits.detail}
      </DashboardStatCard>
      <DashboardStatCard
        title={stats.positiveSamples.title}
        value={stats.positiveSamples.value}
        icon={AlertTriangle}
        iconClassName="bg-destructive/10 text-destructive"
        valueClassName="text-destructive"
      >
        {stats.positiveSamples.detail}
      </DashboardStatCard>
      <DashboardStatCard
        title={stats.cleanSamples.title}
        value={stats.cleanSamples.value}
        icon={Clock}
        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      >
        {stats.cleanSamples.detail}
      </DashboardStatCard>
    </div>
  );
}

export { DashboardStatsGrid };
