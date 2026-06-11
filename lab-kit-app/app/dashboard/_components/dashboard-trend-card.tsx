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
  const hasSparseData = trend.bars.length > 0 && trend.bars.length < 3;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle className="text-base font-semibold">
              Xu hướng nhận mẫu xét nghiệm
            </CardTitle>
            <CardDescription className="text-xs">
              7 ngày gần nhất ({trend.dateRangeLabel})
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" /> Tổng mẫu
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-destructive" /> Dương tính
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative flex h-[240px] w-full flex-col gap-3 px-2 pt-2">
        {hasSparseData ? (
          <p className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Dữ liệu xu hướng còn ít trong khoảng này; biểu đồ sẽ dày hơn khi có
            thêm ngày nhận mẫu.
          </p>
        ) : null}
        {trend.bars.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 text-center">
            <p className="text-sm font-medium">Chưa có dữ liệu xu hướng</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Khi có mẫu trong khoảng này, biểu đồ 7 ngày sẽ hiển thị tại đây.
            </p>
          </div>
        ) : null}
        {trend.bars.length > 0 ? (
          <>
            <div className="pointer-events-none absolute inset-x-6 bottom-8 top-16 flex flex-col justify-between">
              <div className="w-full border-t border-border/40" />
              <div className="w-full border-t border-border/40" />
              <div className="w-full border-t border-border/40" />
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative z-10 flex min-h-0 flex-1 items-end justify-between">
              {trend.bars.map((bar) => (
                <div
                  key={bar.day}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "group relative flex w-8 min-w-6 items-end justify-center rounded-t-sm",
                      bar.active
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-primary/20 hover:bg-primary/30"
                    )}
                    style={{
                      height: `${bar.sampleCount > 0 ? Math.max(bar.samplePercent, 8) : 3}%`,
                    }}
                  >
                    <span className="absolute -top-6 rounded border border-border bg-popover px-1 text-[10px] font-semibold opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      {bar.sampleCount} mẫu
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
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { DashboardTrendCard };
