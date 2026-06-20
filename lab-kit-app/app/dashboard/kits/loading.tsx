import { DashboardPageLoading } from "@/components/layout/dashboard-page-loading";

/** Render trạng thái đang tải cho trang kho KIT. */
export default function Loading() {
  return (
    <DashboardPageLoading
      title="Quản lý lô KIT & Tồn kho"
      description="Đang tải kho KIT..."
    />
  );
}
