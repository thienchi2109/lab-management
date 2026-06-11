import Link from "next/link";

import { Button } from "@/components/ui/button";

type DashboardHeroProps = {
  dateRangeLabel: string;
};

function DashboardHero({ dateRangeLabel }: DashboardHeroProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tổng quan vận hành
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Theo dõi mẫu, KIT và kết quả PCR
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Dữ liệu 7 ngày gần nhất ({dateRangeLabel}) từ các lượt nhận mẫu và kết
          quả đã ghi nhận.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
        <Button variant="outline" size="sm" className="h-9 text-xs" asChild>
          <Link href="/dashboard/analytics">Xem analytics</Link>
        </Button>
        <Button size="sm" className="h-9 text-xs" asChild>
          <Link href="/dashboard/samples">Mở danh sách mẫu</Link>
        </Button>
      </div>
    </div>
  );
}

export { DashboardHero };
