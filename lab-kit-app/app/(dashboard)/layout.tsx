import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-svh pb-16 md:pb-0">
        <Topbar />
        <main className="flex-1 overflow-auto bg-zinc-50/50 p-4 md:p-6 dark:bg-zinc-950/20">
          {children}
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
