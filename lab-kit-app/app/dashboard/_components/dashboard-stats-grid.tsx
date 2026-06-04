import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  FlaskConical,
  Package,
} from "lucide-react";

import { DashboardStatCard } from "./dashboard-stat-card";

function DashboardStatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        title="Tổng số mẫu nhận"
        value="342"
        icon={FlaskConical}
        iconClassName="bg-primary/10 text-primary"
      >
        <span className="inline-flex items-center font-semibold text-emerald-600">
          <ArrowUpRight className="size-3" /> +12.5%
        </span>
        so với tuần trước
      </DashboardStatCard>
      <DashboardStatCard
        title="Lô KIT đang hoạt động"
        value="8 / 12"
        icon={Package}
        iconClassName="bg-secondary/80 text-secondary-foreground"
      >
        <span className="font-semibold text-amber-600">2 lô</span> sắp hết hạn
        sử dụng
      </DashboardStatCard>
      <DashboardStatCard
        title="Mẫu dương tính PCR"
        value="8 mẫu"
        icon={AlertTriangle}
        iconClassName="bg-destructive/10 text-destructive"
        valueClassName="text-destructive"
      >
        Chiếm <span className="font-semibold">2.3%</span> tổng số mẫu xét nghiệm
      </DashboardStatCard>
      <DashboardStatCard
        title="Chờ duyệt kết quả"
        value="30 mẫu"
        icon={Clock}
        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      >
        Tỷ lệ hoàn thành{" "}
        <span className="font-semibold text-emerald-600">91.2%</span>
      </DashboardStatCard>
    </div>
  );
}

export { DashboardStatsGrid };
