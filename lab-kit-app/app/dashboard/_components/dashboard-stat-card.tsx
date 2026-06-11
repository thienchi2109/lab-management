import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  title: string;
  value: string;
  accentClassName: string;
  icon: LucideIcon;
  iconClassName: string;
  children: React.ReactNode;
  valueClassName?: string;
};

function DashboardStatCard({
  title,
  value,
  accentClassName,
  icon: Icon,
  iconClassName,
  children,
  valueClassName,
}: DashboardStatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 transition-colors hover:bg-muted/30",
        accentClassName
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <div className={cn("rounded-lg p-2", iconClassName)}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "font-mono text-2xl font-semibold tracking-tight tabular-nums",
            valueClassName
          )}
        >
          {value}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[11px] leading-4 text-muted-foreground">
          {children}
        </p>
      </CardContent>
    </Card>
  );
}

export { DashboardStatCard };
