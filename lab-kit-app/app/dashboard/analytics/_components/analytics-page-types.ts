import type { AnalyticsReadResult } from "@/lib/analytics/operations";
import type {
  AnalyticsDimension,
  AnalyticsFilters,
  AnalyticsMeasure,
} from "@/lib/analytics/query";

/** Dataset pivot analytics hiển thị trên trang báo cáo. */
export type AnalyticsPivotDataset = AnalyticsReadResult & {
  filterSummary: string[];
};

/** Bộ lọc trang analytics được UI MVP hỗ trợ trực tiếp. */
export type AnalyticsPageFilters = Pick<
  AnalyticsFilters,
  "receivedFrom" | "receivedTo" | "status"
>;

/** Dimension pivot đã có adapter đọc dữ liệu rõ ràng trong US-010D. */
export type AnalyticsPageDimension = Extract<
  AnalyticsDimension,
  "receivedDate" | "pcrMetric"
>;

/** Measure pivot MVP hiển thị trong chart và table. */
export type AnalyticsPageMeasure = Extract<
  AnalyticsMeasure,
  "sampleCount" | "positiveCount"
>;

/** State truy vấn client-side cho Analytics Page MVP. */
export type AnalyticsPageQueryState = {
  dimension: AnalyticsPageDimension;
  filters: AnalyticsPageFilters;
  measures: AnalyticsPageMeasure[];
};

/** Dữ liệu một dòng pivot đã chuẩn hóa cho UI. */
export type AnalyticsPivotDisplayRow = {
  id: string;
  label: string;
  sampleCount: number;
  positiveCount: number;
};
