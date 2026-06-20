import { DashboardPageLoading } from "@/components/layout/dashboard-page-loading";

/** Render trạng thái đang tải cho bảng mẫu xét nghiệm. */
export default function Loading() {
  return (
    <DashboardPageLoading
      title="Bảng mẫu xét nghiệm"
      description="Đang tải bảng mẫu xét nghiệm..."
    />
  );
}
