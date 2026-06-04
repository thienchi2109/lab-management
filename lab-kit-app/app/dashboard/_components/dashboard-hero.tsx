import Link from "next/link";

import { Button } from "@/components/ui/button";

function DashboardHero() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Xin chào, Nguyễn Văn A 👋
        </h2>
        <p className="text-xs text-muted-foreground md:text-sm">
          Chúc bạn một ngày làm việc hiệu quả. Dưới đây là tóm tắt hoạt động của
          phòng lab.
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
  );
}

export { DashboardHero };
