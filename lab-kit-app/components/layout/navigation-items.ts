import {
  BarChart3,
  FlaskConical,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const mobileNavItems = [
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
    title: "Chỉ tiêu",
    url: "/dashboard/result-configuration",
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

const desktopNavItems = [
  {
    title: "Báo cáo",
    url: "/dashboard/analytics",
    icon: BarChart3,
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
    title: "Chỉ tiêu",
    url: "/dashboard/result-configuration",
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
