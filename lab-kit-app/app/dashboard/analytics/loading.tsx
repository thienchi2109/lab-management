import { DashboardPageLoading } from "@/components/layout/dashboard-page-loading";

/** Render trạng thái đang tải cho trang báo cáo. */
export default function Loading() {
  return (
    <DashboardPageLoading
      title="Báo cáo thống kê & Pivot"
      description="Đang tải báo cáo..."
    />
  );
}
