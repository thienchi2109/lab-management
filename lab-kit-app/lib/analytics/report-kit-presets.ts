import type { AnalyticsActor } from "./operations";
import type { AnalyticsFilters } from "./query";
import {
  parseReportKitAnalyticsQuery,
  REPORT_KIT_ANALYTICS_CHART_IDS,
  type ReportKitAnalyticsChartId,
} from "./report-kit";

/** Scope lưu preset bộ lọc mặc định cho nhóm biểu đồ báo cáo kit/mẫu. */
export const REPORT_KIT_FILTER_PRESET_SCOPE = "analytics-report-default";

/** Cấu hình preset cho từng chart báo cáo, chỉ gồm filter đã whitelist. */
export type ReportKitFilterPresetConfig = {
  charts: Partial<
    Record<ReportKitAnalyticsChartId, { filters: AnalyticsFilters }>
  >;
};

/** Preset bộ lọc đã lưu kèm metadata cập nhật gần nhất. */
export type ReportKitFilterPreset = {
  config: ReportKitFilterPresetConfig;
  updatedAt: string;
  updatedBy: string | null;
};

const PRESET_ERROR_MESSAGE = "Preset bộ lọc báo cáo không hợp lệ.";
const chartIds = new Set<string>(REPORT_KIT_ANALYTICS_CHART_IDS);

/** Parse cấu hình preset báo cáo và chỉ cho phép chart/filter đã whitelist. */
export function parseReportKitFilterPresetConfig(
  input: unknown
): ReportKitFilterPresetConfig {
  if (!isRecord(input) || !isRecord(input.charts)) {
    throw new Error(PRESET_ERROR_MESSAGE);
  }

  const charts: ReportKitFilterPresetConfig["charts"] = {};

  for (const [chartId, value] of Object.entries(input.charts)) {
    if (!isReportKitChartId(chartId) || !isRecord(value)) {
      throw new Error(PRESET_ERROR_MESSAGE);
    }

    const keys = Object.keys(value);
    if (keys.some((key) => key !== "filters")) {
      throw new Error(PRESET_ERROR_MESSAGE);
    }

    try {
      charts[chartId] = {
        filters: parseReportKitAnalyticsQuery({
          charts: [chartId],
          filters: value.filters ?? {},
        }).filters,
      };
    } catch {
      throw new Error(PRESET_ERROR_MESSAGE);
    }
  }

  return { charts };
}

/** Quyền lưu preset báo cáo mặc định của tổ chức: chỉ Admin. */
export function canSaveReportKitFilterPreset(actor: AnalyticsActor): boolean {
  return actor.role === "admin";
}

/** Merge preset đã lưu lên default bounded filters cho từng chart báo cáo. */
export function mergeReportKitDefaultFilters(
  defaultFilters: AnalyticsFilters,
  preset: ReportKitFilterPresetConfig | null | undefined
): Record<ReportKitAnalyticsChartId, AnalyticsFilters> {
  return Object.fromEntries(
    REPORT_KIT_ANALYTICS_CHART_IDS.map((chartId) => [
      chartId,
      {
        ...defaultFilters,
        ...(preset?.charts[chartId]?.filters ?? {}),
      },
    ])
  ) as Record<ReportKitAnalyticsChartId, AnalyticsFilters>;
}

/** Tạo audit payload chỉ chứa tên field, không chứa raw customer text. */
export function buildReportKitPresetAuditPayload(
  config: ReportKitFilterPresetConfig
) {
  return {
    chartIds: Object.keys(config.charts).sort(),
    filterKeysByChart: Object.fromEntries(
      Object.entries(config.charts).map(([chartId, chart]) => [
        chartId,
        Object.keys(chart?.filters ?? {}).sort(),
      ])
    ),
    scope: REPORT_KIT_FILTER_PRESET_SCOPE,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReportKitChartId(value: string): value is ReportKitAnalyticsChartId {
  return chartIds.has(value);
}
