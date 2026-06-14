import { redirect } from "next/navigation";
import { connection } from "next/server";

import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getCurrentSession } from "@/lib/auth/session";
import { getSampleMetadata } from "@/lib/sample-metadata/server";

import { createSampleMetadataAction } from "./samples/actions";
import { SampleCreateOverlayBridge } from "./samples/_components/sample-create-overlay-bridge";

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

  const sampleMetadata = await getSampleMetadata();

  return (
    <div className="flex min-h-svh flex-col pb-16 md:pb-0">
      <Topbar
        displayName={session.profile.displayName}
        username={session.profile.username}
      />
      <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
        {children}
      </main>
      <BottomNav />
      <SampleCreateOverlayBridge
        metadata={sampleMetadata}
        formAction={createSampleMetadataAction}
      />
    </div>
  );
}
