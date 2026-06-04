import { redirect } from "next/navigation";
import { connection } from "next/server";

import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getCurrentSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col pb-16 md:pb-0">
      <Topbar
        displayName={session.profile.displayName}
        username={session.profile.username}
      />
      <main className="flex-1 overflow-auto bg-zinc-50/50 p-4 md:p-6 dark:bg-zinc-950/20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
