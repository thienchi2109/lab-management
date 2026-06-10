import type {
  AnalyticsPageDimension,
  AnalyticsPivotDataset,
  AnalyticsPivotDisplayRow,
} from "./analytics-page-types";

const dimensionLabels: Record<AnalyticsPageDimension, string> = {
  pcrMetric: "Chỉ tiêu PCR",
  receivedDate: "Ngày nhận mẫu",
};

/** Lấy nhãn tiếng Việt cho dimension pivot analytics. */
export function getAnalyticsDimensionLabel(dimension: AnalyticsPageDimension) {
  return dimensionLabels[dimension];
}

/** Chuẩn hoá row API thành row hiển thị ổn định cho chart và table. */
export function mapAnalyticsRows(
  dataset: AnalyticsPivotDataset,
  dimension: AnalyticsPageDimension
): AnalyticsPivotDisplayRow[] {
  return dataset.rows.map((row, index) => {
    const rawLabel = row.dimensionValues[dimension];
    const label = rawLabel && rawLabel.length > 0 ? rawLabel : "Không rõ";

    return {
      id: `${dimension}-${label}-${index}`,
      label,
      positiveCount: row.measureValues.positiveCount ?? 0,
      sampleCount: row.measureValues.sampleCount ?? 0,
    };
  });
}

/** Định dạng số mẫu ngắn gọn cho bảng và biểu đồ analytics. */
export function formatSampleCount(value: number) {
  return `${value.toLocaleString("vi-VN")} mẫu`;
}

/** Tính phần trăm dương tính có guard chia cho 0. */
export function formatPositiveRate(row: AnalyticsPivotDisplayRow) {
  if (row.sampleCount === 0) return "0.0%";

  return `${((row.positiveCount / row.sampleCount) * 100).toFixed(1)}%`;
}
