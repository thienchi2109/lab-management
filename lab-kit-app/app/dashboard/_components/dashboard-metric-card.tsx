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
        <CardTitle className="text-base font-semibold">
          Dương tính theo chỉ tiêu PCR
        </CardTitle>
        <CardDescription className="text-xs">
          Tỷ lệ nhiễm trên các chỉ tiêu xét nghiệm
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {metrics.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4">
            <p className="text-sm font-medium">Chưa có dữ liệu PCR</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Các chỉ tiêu PCR sẽ xuất hiện khi mẫu trong khoảng này có kết quả.
            </p>
          </div>
        ) : null}
        {metrics.map((metric) => (
          <div key={metric.title} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {metric.title}
              </span>
              <span
                className={`font-mono font-semibold tabular-nums ${toneTextClass[metric.tone]}`}
              >
                {metric.result}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
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
