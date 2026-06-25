import type {
  ReportKitAnalyticsChartId,
  ReportKitAnalyticsContract,
} from "@/lib/analytics/report-kit";
import type { AnalyticsFilters } from "@/lib/analytics/query";

/** Tải lại contract cho đúng một biểu đồ báo cáo kit theo filter hiện tại. */
export async function fetchReportKitChartContract(
  chartId: ReportKitAnalyticsChartId,
  filters: AnalyticsFilters
): Promise<ReportKitAnalyticsContract> {
  const response = await fetch("/api/analytics/report-kit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      charts: [chartId],
      filters: cleanFilters(filters),
    }),
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(getReportKitErrorMessage(payload));
  }

  if (!isReportKitAnalyticsContract(payload)) {
    throw new Error("Không thể tải dữ liệu biểu đồ báo cáo kit.");
  }

  return payload;
}

function cleanFilters(filters: AnalyticsFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value)
  );
}

function getReportKitErrorMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return "Không thể tải dữ liệu biểu đồ báo cáo kit.";
}

function isReportKitAnalyticsContract(
  payload: unknown
): payload is ReportKitAnalyticsContract {
  if (typeof payload !== "object" || payload === null) return false;

  const value = payload as Partial<ReportKitAnalyticsContract>;

  return (
    Array.isArray(value.charts) &&
    typeof value.datasets === "object" &&
    value.datasets !== null &&
    typeof value.query === "object" &&
    value.query !== null
  );
}
