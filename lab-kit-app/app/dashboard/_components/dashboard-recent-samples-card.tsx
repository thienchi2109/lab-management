import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardOverviewRecentSample } from "@/lib/analytics/overview";

type DashboardRecentSamplesCardProps = {
  samples: DashboardOverviewRecentSample[];
};

function DashboardRecentSamplesCard({
  samples,
}: DashboardRecentSamplesCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold">
            Mẫu xét nghiệm nhận gần đây
          </CardTitle>
          <CardDescription className="text-[10px]">
            Danh sách các mẫu vừa cập nhật trong 7 ngày qua
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-primary"
          asChild
        >
          <Link href="/dashboard/samples">
            Xem tất cả <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30 font-medium uppercase text-muted-foreground">
                <th className="p-3">Mã mẫu</th>
                <th className="p-3">Khách hàng</th>
                <th className="p-3">Loại mẫu</th>
                <th className="p-3">Ngày nhận</th>
                <th className="p-3">Kết quả PCR</th>
                <th className="p-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {samples.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-3 text-center text-muted-foreground"
                  >
                    Chưa có mẫu trong khoảng thời gian này.
                  </td>
                </tr>
              ) : null}
              {samples.map((sample, index) => (
                <tr
                  key={sample.code}
                  className={
                    index < samples.length - 1
                      ? "border-b border-border/40 hover:bg-muted/40 transition-colors"
                      : "hover:bg-muted/40 transition-colors"
                  }
                >
                  <td className="p-3 font-semibold text-foreground">
                    {sample.code}
                  </td>
                  <td className="p-3">{sample.customer}</td>
                  <td className="p-3 text-muted-foreground">{sample.type}</td>
                  <td className="p-3">{sample.receivedAt}</td>
                  <td
                    className={`p-3 font-medium ${resultToneClass[sample.resultTone]}`}
                  >
                    {sample.result}
                  </td>
                  <td className="p-3 text-right">
                    <Badge
                      variant={statusVariant[sample.statusTone]}
                      className={statusToneClass[sample.statusTone]}
                    >
                      {sample.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

const resultToneClass: Record<
  DashboardOverviewRecentSample["resultTone"],
  string
> = {
  danger: "text-destructive",
  muted: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
};
const statusVariant: Record<
  DashboardOverviewRecentSample["statusTone"],
  "default" | "outline" | "secondary"
> = {
  muted: "outline",
  success: "default",
  warning: "secondary",
};
const statusToneClass: Record<
  DashboardOverviewRecentSample["statusTone"],
  string
> = {
  muted: "border-border text-muted-foreground",
  success: "border-0 bg-emerald-500 text-white hover:bg-emerald-600",
  warning:
    "border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export { DashboardRecentSamplesCard };
