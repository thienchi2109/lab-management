import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardOverviewPcrMetric } from "@/lib/analytics/overview";

type DashboardMetricCardProps = {
  metrics: DashboardOverviewPcrMetric[];
};

function DashboardMetricCard({ metrics }: DashboardMetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold">
          Dương tính theo chỉ tiêu PCR
        </CardTitle>
        <CardDescription className="text-[10px]">
          Tỷ lệ nhiễm trên các chỉ tiêu xét nghiệm
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {metrics.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa có dữ liệu PCR trong khoảng thời gian này.
          </p>
        ) : null}
        {metrics.map((metric) => (
          <div key={metric.title} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {metric.title}
              </span>
              <span className={`font-semibold ${toneTextClass[metric.tone]}`}>
                {metric.result}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${toneBarClass[metric.tone]}`}
                style={{ width: `${metric.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const toneTextClass: Record<DashboardOverviewPcrMetric["tone"], string> = {
  danger: "text-destructive",
  muted: "text-muted-foreground",
  warning: "text-amber-600 dark:text-amber-400",
};
const toneBarClass: Record<DashboardOverviewPcrMetric["tone"], string> = {
  danger: "bg-destructive",
  muted: "bg-emerald-500",
  warning: "bg-amber-500",
};

export { DashboardMetricCard };
