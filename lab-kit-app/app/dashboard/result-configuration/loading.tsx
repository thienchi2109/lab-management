import { DashboardPageLoading } from "@/components/layout/dashboard-page-loading";

/** Render trạng thái đang tải cho trang cấu hình chỉ tiêu. */
export default function Loading() {
  return (
    <DashboardPageLoading
      title="Cấu hình chỉ tiêu động"
      description="Đang tải cấu hình chỉ tiêu..."
    />
  );
}
