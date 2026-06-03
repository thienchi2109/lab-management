"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search, Sun } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const pathname = usePathname();

  // Simple title mapper based on pathname
  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard/samples")) return "Quản lý mẫu xét nghiệm";
    if (path.startsWith("/dashboard/kits")) return "Quản lý lô KIT & Tồn kho";
    if (path.startsWith("/dashboard/analytics"))
      return "Báo cáo thống kê & Pivot";
    if (path.startsWith("/dashboard/result-config"))
      return "Cấu hình chỉ tiêu động";
    if (path.startsWith("/dashboard/settings")) return "Cài đặt hệ thống";
    return "Tổng quan hệ thống";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background px-4 md:px-6">
      {/* Left side: Sidebar Toggle & Title */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hidden md:inline-flex h-9 w-9 border border-border/50" />
        <h1 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Center/Right side actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden w-60 sm:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm mẫu, kit..."
            className="h-9 pl-9 pr-4 text-xs focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 flex size-2 rounded-full bg-destructive" />
          <span className="sr-only">Thông báo</span>
        </Button>

        {/* Theme Toggle (Visual) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
        >
          <Sun className="size-4" />
          <span className="sr-only">Chế độ sáng/tối</span>
        </Button>

        {/* Quick Add Button */}
        <Button size="sm" className="h-9 gap-1.5 px-3 font-medium text-xs">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Thêm mẫu</span>
        </Button>
      </div>
    </header>
  );
}
