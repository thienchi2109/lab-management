import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
  children: React.ReactNode;
  valueClassName?: string;
};

function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  children,
  valueClassName,
}: DashboardStatCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-1 hover:ring-primary/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {title}
        </span>
        <div className={cn("rounded-lg p-2", iconClassName)}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
          {children}
        </p>
      </CardContent>
    </Card>
  );
}

export { DashboardStatCard };
