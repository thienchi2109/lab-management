import type {
  ReportKitAnalyticsChartId,
  ReportKitAnalyticsContract,
  ReportKitAnalyticsDataset,
} from "@/lib/analytics/report-kit";
import type { ReportKitFilterPresetConfig } from "@/lib/analytics/report-kit-presets";
import type { AnalyticsFilters } from "@/lib/analytics/query";

/** Contract bootstrap chỉ giữ chart và dataset, không gộp metadata query theo chart. */
export type ReportKitChartBootstrapContract = Pick<
  ReportKitAnalyticsContract,
  "charts" | "datasets"
> &
  Partial<Pick<ReportKitAnalyticsContract, "query">>;

/** State dataset, filter và trạng thái tải riêng của một chart card. */
export type ReportKitChartDatasetState = {
  dataset: ReportKitAnalyticsDataset;
  error: string | null;
  filterSummary: string[];
  filters: AnalyticsFilters;
  isLoading: boolean;
};

/** State tập hợp chart card, được index theo `chartId` để tránh cập nhật nhầm. */
export type ReportKitChartState = {
  charts: ReportKitAnalyticsChartId[];
  datasets: Record<ReportKitAnalyticsChartId, ReportKitChartDatasetState>;
};

/** Tạo state filter riêng cho từng biểu đồ từ contract server ban đầu. */
export function createReportKitChartState(
  contract: ReportKitChartBootstrapContract,
  initialFiltersByChart?: Partial<
    Record<ReportKitAnalyticsChartId, AnalyticsFilters>
  >
): ReportKitChartState {
  return {
    charts: contract.charts,
    datasets: Object.fromEntries(
      contract.charts.map((chartId) => {
        const filters =
          initialFiltersByChart?.[chartId] ?? contract.query?.filters ?? {};

        return [
          chartId,
          {
            dataset: contract.datasets[chartId],
            error: null,
            filterSummary: formatReportKitChartFilterSummary(filters),
            filters,
            isLoading: false,
          },
        ];
      })
    ) as ReportKitChartState["datasets"],
  };
}

/** Cập nhật filter của một chartId và giữ nguyên object của chart khác. */
export function updateReportKitChartFilters(
  state: ReportKitChartState,
  chartId: ReportKitAnalyticsChartId,
  filters: AnalyticsFilters
): ReportKitChartState {
  const current = state.datasets[chartId];

  return updateChart(state, chartId, {
    ...current,
    error: null,
    filterSummary: formatReportKitChartFilterSummary(filters),
    filters,
  });
}

/** Áp contract trả về từ API vào đúng chartId trong response. */
export function applyReportKitChartContract(
  state: ReportKitChartState,
  contract: ReportKitAnalyticsContract
): ReportKitChartState {
  return contract.charts.reduce((nextState, chartId) => {
    const current = nextState.datasets[chartId];

    return updateChart(nextState, chartId, {
      ...current,
      dataset: contract.datasets[chartId],
      error: null,
      filterSummary: formatReportKitChartFilterSummary(contract.query.filters),
      filters: contract.query.filters,
      isLoading: false,
    });
  }, state);
}

/** Đánh dấu trạng thái tải riêng cho một chartId. */
export function setReportKitChartLoading(
  state: ReportKitChartState,
  chartId: ReportKitAnalyticsChartId,
  isLoading: boolean
): ReportKitChartState {
  return updateChart(state, chartId, {
    ...state.datasets[chartId],
    error: null,
    isLoading,
  });
}

/** Ghi lỗi tải dữ liệu riêng cho một chartId. */
export function setReportKitChartError(
  state: ReportKitChartState,
  chartId: ReportKitAnalyticsChartId,
  error: string
): ReportKitChartState {
  return updateChart(state, chartId, {
    ...state.datasets[chartId],
    error,
    isLoading: false,
  });
}

/** Tạo summary dễ đọc từ filter riêng của từng biểu đồ. */
export function formatReportKitChartFilterSummary(
  filters: AnalyticsFilters
): string[] {
  const summary: string[] = [];

  if (filters.receivedFrom && filters.receivedTo) {
    summary.push(
      `Từ ${formatIsoDate(filters.receivedFrom)} đến ${formatIsoDate(
        filters.receivedTo
      )}`
    );
  } else if (filters.receivedFrom) {
    summary.push(`Từ ${formatIsoDate(filters.receivedFrom)}`);
  } else if (filters.receivedTo) {
    summary.push(`Đến ${formatIsoDate(filters.receivedTo)}`);
  }

  if (filters.status) summary.push("Trạng thái đã chọn");
  if (filters.companyId) summary.push("Công ty đã chọn");
  if (filters.customerId) summary.push("Khách hàng đã chọn");
  if (filters.sampleTypeId) summary.push("Loại mẫu đã chọn");
  if (filters.kitTypeId) summary.push("Loại KIT đã chọn");

  return summary.length > 0 ? summary : ["Chưa áp dụng bộ lọc"];
}

/** Serialize state hiện tại thành preset config để lưu mặc định cho tổ chức. */
export function createReportKitFilterPresetConfig(
  state: ReportKitChartState
): ReportKitFilterPresetConfig {
  return {
    charts: Object.fromEntries(
      state.charts.map((chartId) => [
        chartId,
        { filters: state.datasets[chartId].filters },
      ])
    ),
  };
}

function updateChart(
  state: ReportKitChartState,
  chartId: ReportKitAnalyticsChartId,
  chartState: ReportKitChartDatasetState
): ReportKitChartState {
  return {
    ...state,
    datasets: {
      ...state.datasets,
      [chartId]: chartState,
    },
  };
}

function formatIsoDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}
