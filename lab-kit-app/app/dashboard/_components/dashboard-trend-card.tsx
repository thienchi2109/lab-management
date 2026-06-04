import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

const chartBars = [
  { day: "28/5", value: "40", height: "h-[80px]", positiveHeight: "h-[8px]" },
  { day: "29/5", value: "55", height: "h-[110px]", positiveHeight: "h-[15px]" },
  { day: "30/5", value: "30", height: "h-[60px]", positiveHeight: "h-[0px]" },
  { day: "31/5", value: "20", height: "h-[40px]", positiveHeight: "h-[4px]" },
  { day: "01/6", value: "65", height: "h-[130px]", positiveHeight: "h-[24px]" },
  { day: "02/6", value: "80", height: "h-[160px]", positiveHeight: "h-[10px]" },
  {
    day: "Hôm nay",
    value: "52",
    height: "h-[104px]",
    positiveHeight: "h-[16px]",
    active: true,
  },
];

function DashboardTrendCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">
              Xu hướng nhận mẫu xét nghiệm
            </CardTitle>
            <CardDescription className="text-[10px]">
              7 ngày gần nhất (28/05 - 03/06)
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
          {chartBars.map((bar) => (
            <div
              key={bar.day}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "group relative flex w-8 items-end justify-center rounded-t-sm",
                  bar.height,
                  bar.active
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-primary/20 hover:bg-primary/30"
                )}
              >
                <span className="absolute -top-6 rounded border border-border bg-popover px-1 text-[10px] font-semibold opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {bar.value}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-sm",
                    bar.positiveHeight,
                    bar.active ? "bg-destructive" : "bg-destructive/60"
                  )}
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
