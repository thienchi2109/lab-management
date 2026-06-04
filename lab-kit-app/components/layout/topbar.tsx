"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Plus, Search, Sun } from "lucide-react";

import {
  desktopNavItems,
  isNavItemActive,
} from "@/components/layout/navigation-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function getPageTitle(path: string) {
  if (path.startsWith("/dashboard/samples")) return "Quản lý mẫu xét nghiệm";
  if (path.startsWith("/dashboard/kits")) return "Quản lý lô KIT & Tồn kho";
  if (path.startsWith("/dashboard/analytics"))
    return "Báo cáo thống kê & Pivot";
  if (path.startsWith("/dashboard/result-config"))
    return "Cấu hình chỉ tiêu động";
  if (path.startsWith("/dashboard/settings")) return "Cài đặt hệ thống";
  return "Tổng quan hệ thống";
}

type TopbarProps = {
  displayName: string;
  username: string | null;
};

export function Topbar({ displayName, username }: TopbarProps) {
  const pathname = usePathname();
  const accountLabel = username ?? displayName;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-border/50 bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <h1 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <nav
        className="hidden min-w-0 flex-1 items-center gap-1 md:flex"
        aria-label="Điều hướng chính"
      >
        {desktopNavItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.url);

          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                isActive && "bg-accent text-foreground"
              )}
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden w-60 sm:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm mẫu, kit..."
            className="h-9 pl-9 pr-4 text-xs focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 flex size-2 rounded-full bg-destructive" />
          <span className="sr-only">Thông báo</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
        >
          <Sun className="size-4" />
          <span className="sr-only">Chế độ sáng/tối</span>
        </Button>

        <Button size="sm" className="h-9 gap-1.5 px-3 font-medium text-xs">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Thêm mẫu</span>
        </Button>

        <div className="hidden min-w-0 flex-col items-end leading-tight lg:flex">
          <span className="max-w-32 truncate text-xs font-medium text-foreground">
            {accountLabel}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Đang hoạt động
          </span>
        </div>

        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Đăng xuất</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
