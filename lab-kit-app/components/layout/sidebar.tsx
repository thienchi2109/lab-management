"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Package,
  BarChart3,
  Settings2,
  Settings,
  ShieldCheck,
  ChevronUp,
  User,
  FlaskConicalIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNavItems = [
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
    title: "Quản lý lô KIT",
    url: "/dashboard/kits",
    icon: Package,
  },
];

const analyticsNavItems = [
  {
    title: "Báo cáo & Pivot",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
];

const adminNavItems = [
  {
    title: "Cấu hình chỉ tiêu",
    url: "/dashboard/result-config",
    icon: ShieldCheck,
  },
  {
    title: "Cài đặt chung",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-sidebar-border/50 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FlaskConicalIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm tracking-tight text-foreground">
                  LAB CONNECT
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Hệ thống quản lý mẫu
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="py-2">
        {/* Main Functions */}
        <SidebarGroup>
          <SidebarGroupLabel>Nghiệp vụ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Báo cáo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Configuration */}
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent"
                  />
                }
              >
                <Avatar className="size-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="font-medium text-foreground">
                    Nguyễn Văn A
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Quản trị viên (Admin)
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <User className="size-4" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <Settings2 className="size-4" />
                  <span>Cài đặt tài khoản</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
