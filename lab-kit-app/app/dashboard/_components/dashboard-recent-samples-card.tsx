import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const samples = [
  {
    code: "T06_00124",
    customer: "Công ty Thủy sản Hùng Vương",
    type: "Tôm thẻ chân trắng",
    receivedAt: "03/06/2026",
    result: "PCR (SẠCH)",
    resultClassName: "text-emerald-600 dark:text-emerald-400",
    status: "Đã duyệt",
    badgeClassName: "border-0 bg-emerald-500 text-white hover:bg-emerald-600",
  },
  {
    code: "T06_00123",
    customer: "Nông trại Minh Phú",
    type: "Nước ao nuôi",
    receivedAt: "03/06/2026",
    result: "PCR (NHIỄM - EHP)",
    resultClassName: "text-destructive",
    status: "Chờ duyệt",
    badgeClassName:
      "border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    badgeVariant: "secondary" as const,
  },
  {
    code: "T06_00122",
    customer: "Đại lý Ba Huân",
    type: "Tôm sú",
    receivedAt: "02/06/2026",
    result: "PCR (SẠCH)",
    resultClassName: "text-emerald-600 dark:text-emerald-400",
    status: "Đã duyệt",
    badgeClassName: "border-0 bg-emerald-500 text-white hover:bg-emerald-600",
  },
  {
    code: "T06_00121",
    customer: "Công ty CP Miền Trung",
    type: "Nước nguồn",
    receivedAt: "02/06/2026",
    result: "Đang xử lý...",
    resultClassName: "text-muted-foreground",
    status: "Bản nháp",
    badgeClassName: "border-border text-muted-foreground",
    badgeVariant: "outline" as const,
  },
  {
    code: "T06_00120",
    customer: "Khách lẻ Trần Văn B",
    type: "Tôm giống",
    receivedAt: "01/06/2026",
    result: "PCR (NHIỄM - WSSV)",
    resultClassName: "text-destructive",
    status: "Đã duyệt",
    badgeClassName: "border-0 bg-emerald-500 text-white hover:bg-emerald-600",
  },
];

function DashboardRecentSamplesCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold">
            Mẫu xét nghiệm nhận gần đây
          </CardTitle>
          <CardDescription className="text-[10px]">
            Danh sách các mẫu vừa cập nhật trong 48 giờ qua
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
                  <td className={`p-3 font-medium ${sample.resultClassName}`}>
                    {sample.result}
                  </td>
                  <td className="p-3 text-right">
                    <Badge
                      variant={sample.badgeVariant ?? "default"}
                      className={sample.badgeClassName}
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

export { DashboardRecentSamplesCard };
