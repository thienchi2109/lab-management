import {
  BarChart3,
  FlaskConical,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const mobileNavItems = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mẫu",
    url: "/dashboard/samples",
    icon: FlaskConical,
  },
  {
    title: "Kho KIT",
    url: "/dashboard/kits",
    icon: Package,
  },
  {
    title: "Báo cáo",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Cài đặt",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

const desktopNavItems = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mẫu xét nghiệm",
    url: "/dashboard/samples",
    icon: FlaskConical,
  },
  {
    title: "Kho KIT",
    url: "/dashboard/kits",
    icon: Package,
  },
  {
    title: "Báo cáo",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Chỉ tiêu",
    url: "/dashboard/result-config",
    icon: ShieldCheck,
  },
  {
    title: "Người dùng",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Cài đặt",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

function isNavItemActive(pathname: string, url: string) {
  return (
    pathname === url || (url !== "/dashboard" && pathname.startsWith(url + "/"))
  );
}

export { desktopNavItems, isNavItemActive, mobileNavItems };
