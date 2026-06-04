import { ShieldCheck, UserCheck, UserRoundX, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ManagedUserSummary } from "@/lib/user-management/users";

type UserSummaryStripProps = {
  summary: ManagedUserSummary;
};

export const userSummaryItems = [
  {
    key: "total",
    label: "Tổng người dùng",
    icon: Users,
  },
  {
    key: "active",
    label: "Đang hoạt động",
    icon: UserCheck,
  },
  {
    key: "admins",
    label: "Admin",
    icon: ShieldCheck,
  },
  {
    key: "inactive",
    label: "Tạm khóa",
    icon: UserRoundX,
  },
] as const;

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
