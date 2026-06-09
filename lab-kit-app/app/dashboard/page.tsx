import { DashboardPageContent } from "./_components/dashboard-page-content";
import { getDashboardOverviewPage } from "@/lib/analytics/server";

/** Render dashboard overview with bounded server-side analytics data. */
export default async function DashboardPage() {
  const overview = await getDashboardOverviewPage();

  return <DashboardPageContent overview={overview} />;
}
