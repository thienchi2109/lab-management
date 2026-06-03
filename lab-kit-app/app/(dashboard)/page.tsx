import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FlaskConical,
  Package,
  ArrowUpRight,
} from "lucide-react";
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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Xin chào, Nguyễn Văn A 👋
          </h2>
          <p className="text-xs text-muted-foreground md:text-sm">
            Chúc bạn một ngày làm việc hiệu quả. Dưới đây là tóm tắt hoạt động
            của phòng lab.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs">
            Xuất báo cáo ngày
          </Button>
          <Button
            size="sm"
            className="h-9 text-xs"
            render={<Link href="/dashboard/samples" />}
            nativeButton={false}
          >
            Nhập kết quả mới
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Samples */}
        <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-1 hover:ring-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Tổng số mẫu nhận
            </span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FlaskConical className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600 inline-flex items-center">
                <ArrowUpRight className="size-3" /> +12.5%
              </span>
              so với tuần trước
            </p>
          </CardContent>
        </Card>

        {/* Kit Inventory */}
        <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-1 hover:ring-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Lô KIT đang hoạt động
            </span>
            <div className="rounded-lg bg-secondary/80 p-2 text-secondary-foreground">
              <Package className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 / 12</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-semibold text-amber-600">2 lô</span> sắp hết
              hạn sử dụng
            </p>
          </CardContent>
        </Card>

        {/* PCR Positives */}
        <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-1 hover:ring-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Mẫu dương tính PCR
            </span>
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">8 mẫu</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              Chiếm <span className="font-semibold">2.3%</span> tổng số mẫu xét
              nghiệm
            </p>
          </CardContent>
        </Card>

        {/* Pending Approval */}
        <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-1 hover:ring-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Chờ duyệt kết quả
            </span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30 mẫu</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              Tỷ lệ hoàn thành{" "}
              <span className="font-semibold text-emerald-600">91.2%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend chart card (2 cols) */}
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
                  <span className="size-2 rounded-full bg-destructive" /> Dương
                  tính
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[220px] w-full flex items-end justify-between px-2 pt-4 relative">
            {/* Custom SVG Line & Bar Mockup Chart */}
            <div className="absolute inset-x-6 top-8 bottom-8 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-border/40 w-full" />
              <div className="border-t border-border/40 w-full" />
              <div className="border-t border-border/40 w-full" />
              <div className="border-t border-border/40 w-full" />
            </div>

            <div className="relative z-10 w-full h-full flex items-end justify-between">
              {/* Day 1: 28/05 */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-8 bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[80px] flex items-end justify-center relative group">
                  <span className="absolute -top-6 text-[10px] font-semibold bg-popover border border-border px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    40
                  </span>
                  <div className="w-full bg-destructive/60 h-[8px] rounded-t-sm" />
                </div>
                <span className="text-[10px] text-muted-foreground">28/5</span>
              </div>
              {/* Day 2: 29/05 */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-8 bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[110px] flex items-end justify-center relative group">
                  <span className="absolute -top-6 text-[10px] font-semibold bg-popover border border-border px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    55
                  </span>
                  <div className="w-full bg-destructive/60 h-[15px] rounded-t-sm" />
                </div>
                <span className="text-[10px] text-muted-foreground">29/5</span>
              </div>
              {/* Day 3: 30/05 */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-8 bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[60px] flex items-end justify-center relative group">
                  <span className="absolute -top-6 text-[10px] font-semibold bg-popover border border-border px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    30
                  </span>
                  <div className="w-full bg-destructive/60 h-[0px]" />
                </div>
                <span className="text-[10px] text-muted-foreground">30/5</span>
              </div>
              {/* Day 4: 31/05 */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-8 bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[40px] flex items-end justify-center relative group">
                  <span className="absolute -top-6 text-[10px] font-semibold bg-popover border border-border px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    20
                  </span>
                  <div className="w-full bg-destructive/60 h-[4px] rounded-t-sm" />
                </div>
                <span className="text-[10px] text-muted-foreground">31/5</span>
              </div>
              {/* Day 5: 01/06 */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-8 bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[130px] flex items-end justify-center relative group">
                  <span className="absolute -top-6 text-[10px] font-semibold bg-popover border border-border px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    65
                  </span>
                  <div className="w-full bg-destructive/60 h-[24px] rounded-t-sm" />
                </div>
                <span className="text-[10px] text-muted-foreground">01/6</span>
              </div>
              {/* Day 6: 02/06 */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-8 bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[160px] flex items-end justify-center relative group">
                  <span className="absolute -top-6 text-[10px] font-semibold bg-popover border border-border px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    80
                  </span>
                  <div className="w-full bg-destructive/60 h-[10px] rounded-t-sm" />
                </div>
                <span className="text-[10px] text-muted-foreground">02/6</span>
              </div>
              {/* Day 7: 03/06 */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-8 bg-primary hover:bg-primary/90 rounded-t-sm h-[104px] flex items-end justify-center relative group">
                  <span className="absolute -top-6 text-[10px] font-semibold bg-popover border border-border px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    52
                  </span>
                  <div className="w-full bg-destructive h-[16px] rounded-t-sm" />
                </div>
                <span className="text-[10px] font-semibold text-foreground">
                  Hôm nay
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positive PCR rate by metric (1 col) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">
              Dương tính theo chỉ tiêu PCR
            </CardTitle>
            <CardDescription className="text-[10px]">
              Tỷ lệ nhiễm trên các chỉ tiêu xét nghiệm
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Metric 1 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  WSSV (Đốm trắng)
                </span>
                <span className="font-semibold text-destructive">
                  4 mẫu (1.2%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-destructive"
                  style={{ width: "35%" }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  EHP (Vi bào tử trùng)
                </span>
                <span className="font-semibold text-destructive">
                  3 mẫu (0.9%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-destructive"
                  style={{ width: "25%" }}
                />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  AHPND (Hoại tử gan tụy)
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  1 mẫu (0.3%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: "10%" }}
                />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  IHHNV (Còi cọc)
                </span>
                <span className="font-semibold text-muted-foreground">
                  0 mẫu (0.0%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
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
            render={<Link href="/dashboard/samples" />}
            nativeButton={false}
          >
            Xem tất cả <ArrowRight className="size-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30 text-muted-foreground uppercase font-medium">
                  <th className="p-3">Mã mẫu</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Loại mẫu</th>
                  <th className="p-3">Ngày nhận</th>
                  <th className="p-3">Kết quả PCR</th>
                  <th className="p-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-semibold text-foreground">
                    T06_00124
                  </td>
                  <td className="p-3">Công ty Thủy sản Hùng Vương</td>
                  <td className="p-3 text-muted-foreground">
                    Tôm thẻ chân trắng
                  </td>
                  <td className="p-3">03/06/2026</td>
                  <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">
                    PCR (SẠCH)
                  </td>
                  <td className="p-3 text-right">
                    <Badge
                      variant="default"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                    >
                      Đã duyệt
                    </Badge>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-semibold text-foreground">
                    T06_00123
                  </td>
                  <td className="p-3">Nông trại Minh Phú</td>
                  <td className="p-3 text-muted-foreground">Nước ao nuôi</td>
                  <td className="p-3">03/06/2026</td>
                  <td className="p-3 font-medium text-destructive">
                    PCR (NHIỄM - EHP)
                  </td>
                  <td className="p-3 text-right">
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0"
                    >
                      Chờ duyệt
                    </Badge>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-semibold text-foreground">
                    T06_00122
                  </td>
                  <td className="p-3">Đại lý Ba Huân</td>
                  <td className="p-3 text-muted-foreground">Tôm sú</td>
                  <td className="p-3">02/06/2026</td>
                  <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">
                    PCR (SẠCH)
                  </td>
                  <td className="p-3 text-right">
                    <Badge
                      variant="default"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                    >
                      Đã duyệt
                    </Badge>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-semibold text-foreground">
                    T06_00121
                  </td>
                  <td className="p-3">Công ty CP Miền Trung</td>
                  <td className="p-3 text-muted-foreground">Nước nguồn</td>
                  <td className="p-3">02/06/2026</td>
                  <td className="p-3 text-muted-foreground">Đang xử lý...</td>
                  <td className="p-3 text-right">
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground"
                    >
                      Bản nháp
                    </Badge>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-semibold text-foreground">
                    T06_00120
                  </td>
                  <td className="p-3">Khách lẻ Trần Văn B</td>
                  <td className="p-3 text-muted-foreground">Tôm giống</td>
                  <td className="p-3">01/06/2026</td>
                  <td className="p-3 font-medium text-destructive">
                    PCR (NHIỄM - WSSV)
                  </td>
                  <td className="p-3 text-right">
                    <Badge
                      variant="default"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                    >
                      Đã duyệt
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
