import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { DashboardOverviewData } from "@/lib/analytics/overview";
import { cn } from "@/lib/utils";

type DashboardTrendCardProps = {
  trend: DashboardOverviewData["trend"];
};

function DashboardTrendCard({ trend }: DashboardTrendCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">
              Xu hướng nhận mẫu xét nghiệm
            </CardTitle>
            <CardDescription className="text-[10px]">
              7 ngày gần nhất ({trend.dateRangeLabel})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" /> Tổng mẫu
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="size-2 rounded-full bg-destructive" /> Dương tính
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative flex h-[220px] w-full items-end justify-between px-2 pt-4">
        <div className="pointer-events-none absolute inset-x-6 bottom-8 top-8 flex flex-col justify-between">
          <div className="w-full border-t border-border/40" />
          <div className="w-full border-t border-border/40" />
          <div className="w-full border-t border-border/40" />
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative z-10 flex h-full w-full items-end justify-between">
          {trend.bars.map((bar) => (
            <div
              key={bar.day}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "group relative flex w-8 items-end justify-center rounded-t-sm",
                  bar.active
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-primary/20 hover:bg-primary/30"
                )}
                style={{ height: `${bar.samplePercent}%` }}
              >
                <span className="absolute -top-6 rounded border border-border bg-popover px-1 text-[10px] font-semibold opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {bar.sampleCount}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-sm",
                    bar.active ? "bg-destructive" : "bg-destructive/60"
                  )}
                  style={{ height: `${bar.positivePercent}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-[10px]",
                  bar.active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { DashboardTrendCard };
