import { Card, CardContent } from "@/components/ui/card";
import type { ManagedUserSummary } from "@/lib/user-management/users";

import { userSummaryItems } from "./user-summary-strip.data";

type UserSummaryStripProps = {
  summary: ManagedUserSummary;
};

export function UserSummaryStrip({ summary }: UserSummaryStripProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {userSummaryItems.map((item) => (
        <Card key={item.key} size="sm" className="rounded-lg bg-background">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {summary[item.key]}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
