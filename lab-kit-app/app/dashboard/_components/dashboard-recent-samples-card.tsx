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
import {
  DashboardDataTable,
  type DashboardDataTableRow,
} from "@/components/dashboard/data-table";
import type { DashboardOverviewRecentSample } from "@/lib/analytics/overview";

type DashboardRecentSamplesCardProps = {
  mobileSampleLimit?: number;
  samples: DashboardOverviewRecentSample[];
};

function DashboardRecentSamplesCard({
  mobileSampleLimit,
  samples,
}: DashboardRecentSamplesCardProps) {
  const rows = samples.map(toRecentSampleRow);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Mẫu xét nghiệm nhận gần đây
          </CardTitle>
          <CardDescription className="text-xs">
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
      <CardContent>
        <DashboardDataTable
          caption="Danh sách mẫu xét nghiệm nhận gần đây"
          emptyTitle="Chưa có mẫu gần đây"
          emptyDescription="Các mẫu nhận trong 7 ngày gần nhất sẽ xuất hiện tại đây."
          mobileRowLimit={mobileSampleLimit}
          rows={rows}
        />
      </CardContent>
    </Card>
  );
}

function toRecentSampleRow(
  sample: DashboardOverviewRecentSample
): DashboardDataTableRow {
  return {
    id: sample.code,
    cells: [
      {
        columnKey: "code",
        header: "Mã mẫu",
        content: (
          <span className="font-mono text-primary tabular-nums">
            {sample.code}
          </span>
        ),
        primary: true,
      },
      {
        columnKey: "customer",
        header: "Khách hàng",
        content: sample.customer,
      },
      {
        columnKey: "type",
        header: "Loại mẫu",
        content: sample.type,
      },
      {
        columnKey: "receivedAt",
        header: "Ngày nhận",
        content: (
          <span className="font-mono tabular-nums">{sample.receivedAt}</span>
        ),
      },
      {
        columnKey: "result",
        header: "Kết quả PCR",
        content: (
          <span className={resultToneClass[sample.resultTone]}>
            {sample.result}
          </span>
        ),
      },
      {
        columnKey: "status",
        desktopClassName: "text-right",
        header: "Trạng thái",
        content: (
          <Badge
            variant={statusVariant[sample.statusTone]}
            className={statusToneClass[sample.statusTone]}
          >
            {sample.status}
          </Badge>
        ),
      },
    ],
  };
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
