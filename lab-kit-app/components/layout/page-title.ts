export function getPageTitle(path: string) {
  if (path.startsWith("/dashboard/samples")) return "Quản lý mẫu xét nghiệm";
  if (path.startsWith("/dashboard/kits")) return "Quản lý lô KIT & Tồn kho";
  if (path.startsWith("/dashboard/analytics"))
    return "Báo cáo thống kê & Pivot";
  if (path.startsWith("/dashboard/users")) return "Quản lý người dùng";
  if (path.startsWith("/dashboard/result-configuration"))
    return "Cấu hình chỉ tiêu động";
  if (path.startsWith("/dashboard/settings")) return "Cài đặt hệ thống";
  return "Tổng quan hệ thống";
}
