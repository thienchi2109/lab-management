import {
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Package,
} from "lucide-react";

import type { DashboardOverviewData } from "@/lib/analytics/overview";

import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardStatsGridProps = {
  stats: DashboardOverviewData["stats"];
};

function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <DashboardStatCard
        title={stats.totalSamples.title}
        value={stats.totalSamples.value}
        accentClassName="border-l-primary"
        icon={FlaskConical}
        iconClassName="bg-primary/10 text-primary"
      >
        {stats.totalSamples.detail}
      </DashboardStatCard>
      <DashboardStatCard
        title={stats.activeKits.title}
        value={stats.activeKits.value}
        accentClassName="border-l-amber-500"
        icon={Package}
        iconClassName="bg-amber-500/10 text-amber-700 dark:text-amber-400"
      >
        {stats.activeKits.detail}
      </DashboardStatCard>
      <DashboardStatCard
        title={stats.positiveSamples.title}
        value={stats.positiveSamples.value}
        accentClassName="border-l-destructive"
        icon={AlertTriangle}
        iconClassName="bg-destructive/10 text-destructive"
        valueClassName="text-destructive"
      >
        {stats.positiveSamples.detail}
      </DashboardStatCard>
      <DashboardStatCard
        title={stats.cleanSamples.title}
        value={stats.cleanSamples.value}
        accentClassName="border-l-emerald-500"
        icon={CheckCircle2}
        iconClassName="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      >
        {stats.cleanSamples.detail}
      </DashboardStatCard>
    </div>
  );
}

export { DashboardStatsGrid };
