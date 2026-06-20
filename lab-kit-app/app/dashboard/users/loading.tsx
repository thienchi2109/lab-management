import { DashboardPageLoading } from "@/components/layout/dashboard-page-loading";

/** Render trạng thái đang tải cho trang người dùng. */
export default function Loading() {
  return (
    <DashboardPageLoading
      title="Quản lý người dùng"
      description="Đang tải người dùng..."
    />
  );
}
