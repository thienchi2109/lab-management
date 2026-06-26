"use client";

import { useRef, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type {
  ReportKitAnalyticsChartId,
  ReportKitAnalyticsSegment,
} from "@/lib/analytics/report-kit";
import type { AnalyticsFilters } from "@/lib/analytics/query";

import {
  fetchReportKitChartContract,
  saveReportKitFilterPreset,
} from "./analytics-report-kit-chart-api";
import { ReportKitChartFilterForm } from "./analytics-report-kit-chart-filter-form";
import {
  applyReportKitChartContract,
  createReportKitFilterPresetConfig,
  createReportKitChartState,
  setReportKitChartError,
  setReportKitChartLoading,
  updateReportKitChartFilters,
  type ReportKitChartBootstrapContract,
  type ReportKitChartDatasetState,
} from "./analytics-report-kit-chart-state";

type AnalyticsReportKitChartsProps = {
  canSavePreset?: boolean;
  contract: ReportKitChartBootstrapContract;
  initialFiltersByChart?: Partial<
    Record<ReportKitAnalyticsChartId, AnalyticsFilters>
  >;
};

type ChartConfig = {
  description: string;
  metric: keyof ReportKitAnalyticsSegment["metrics"];
  title: string;
  unit: string;
};

type PresetMessage = {
  kind: "error" | "success";
  text: string;
};

const chartConfigs = {
  cleanShrimpPlByGeneralPcrConclusion: {
    description: "Tổng lượng sạch của mẫu tôm PL theo kết quả chung PCR.",
    metric: "cleanCount",
    title: "Tôm PL sạch theo kết quả chung PCR",
    unit: "mẫu sạch",
  },
  kitQuantityByKitType: {
    description: "Tổng lượng KIT đã dùng theo từng loại KIT.",
    metric: "totalKitQuantity",
    title: "Tổng lượng KIT theo loại KIT",
    unit: "KIT",
  },
  kitQuantityBySampleType: {
    description: "Tổng lượng KIT đã dùng theo từng loại mẫu.",
    metric: "totalKitQuantity",
    title: "Tổng lượng KIT theo loại mẫu",
    unit: "KIT",
  },
  sampleCountByClassification: {
    description:
      "Tổng lượng mẫu sử dụng theo phân loại khách hàng hoặc nội bộ.",
    metric: "sampleCount",
    title: "Tổng lượng mẫu theo phân loại",
    unit: "mẫu",
  },
} satisfies Record<ReportKitAnalyticsChartId, ChartConfig>;

const segmentColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

/** Render 4 biểu đồ tròn báo cáo kit/mẫu từ contract đã chuẩn hóa. */
export function AnalyticsReportKitCharts({
  canSavePreset = false,
  contract,
  initialFiltersByChart,
}: AnalyticsReportKitChartsProps) {
  const activeRequestIds = useRef<Record<string, number>>({});
  const [chartState, setChartState] = useState(() =>
    createReportKitChartState(contract, initialFiltersByChart)
  );
  const [presetMessage, setPresetMessage] = useState<PresetMessage | null>(
    null
  );
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  return (
    <section aria-label="Biểu đồ báo cáo kit và mẫu" className="space-y-3">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-base font-semibold">
            Biểu đồ báo cáo kit và mẫu
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dữ liệu lấy trực tiếp từ hợp đồng báo cáo kit/mẫu đã khóa.
          </p>
        </div>
        {canSavePreset ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSavingPreset}
            className="w-fit gap-2"
            onClick={() => void saveCurrentPreset()}
          >
            <Save className="size-4" />
            {isSavingPreset ? "Đang lưu" : "Lưu preset mặc định"}
          </Button>
        ) : null}
      </div>
      {presetMessage ? (
        <p
          aria-live={presetMessage.kind === "error" ? "assertive" : "polite"}
          className={
            presetMessage.kind === "error"
              ? "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
              : "rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-medium text-primary"
          }
          role={presetMessage.kind === "error" ? "alert" : "status"}
        >
          {presetMessage.text}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {chartState.charts.map((chartId) => (
          <ReportKitChartCard
            key={chartId}
            chartState={chartState.datasets[chartId]}
            onFilterChange={(filters) => updateChartFilters(chartId, filters)}
            onSubmit={(event) => submitChartFilters(event, chartId)}
          />
        ))}
      </div>
    </section>
  );

  function updateChartFilters(
    chartId: ReportKitAnalyticsChartId,
    filters: AnalyticsFilters
  ) {
    setChartState((current) =>
      updateReportKitChartFilters(current, chartId, filters)
    );
  }

  async function submitChartFilters(
    event: React.FormEvent<HTMLFormElement>,
    chartId: ReportKitAnalyticsChartId
  ) {
    event.preventDefault();
    const requestId = (activeRequestIds.current[chartId] ?? 0) + 1;
    activeRequestIds.current[chartId] = requestId;
    const filters = chartState.datasets[chartId].filters;
    setChartState((current) =>
      setReportKitChartLoading(current, chartId, true)
    );

    try {
      const contract = await fetchReportKitChartContract(chartId, filters);

      applyCurrentChartRequest(chartId, requestId, () => {
        setChartState((current) =>
          applyReportKitChartContract(current, contract)
        );
      });
    } catch (error) {
      applyCurrentChartRequest(chartId, requestId, () => {
        setChartState((current) =>
          setReportKitChartError(current, chartId, getErrorMessage(error))
        );
      });
    }
  }

  async function saveCurrentPreset() {
    setPresetMessage(null);
    setIsSavingPreset(true);

    try {
      await saveReportKitFilterPreset(
        createReportKitFilterPresetConfig(chartState)
      );
      setPresetMessage({ kind: "success", text: "Đã lưu preset mặc định." });
    } catch (error) {
      setPresetMessage({ kind: "error", text: getErrorMessage(error) });
    } finally {
      setIsSavingPreset(false);
    }
  }

  function applyCurrentChartRequest(
    chartId: ReportKitAnalyticsChartId,
    requestId: number,
    update: () => void
  ) {
    if (activeRequestIds.current[chartId] === requestId) {
      update();
    }
  }
}

function ReportKitChartCard({
  chartState,
  onFilterChange,
  onSubmit,
}: {
  chartState: ReportKitChartDatasetState;
  onFilterChange: (filters: AnalyticsFilters) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const { dataset } = chartState;
  const config = chartConfigs[dataset.chartId];
  const segments = dataset.segments.map((segment, index) => ({
    color: segmentColors[index % segmentColors.length],
    key: segment.key,
    label: segment.label,
    value: segment.metrics[config.metric] ?? 0,
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <Card
      aria-label={config.title}
      className="rounded-lg border-border/70"
      role="region"
    >
      <CardHeader>
        <h3 className="text-sm font-semibold md:text-base">{config.title}</h3>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReportKitChartFilterForm
          error={chartState.error}
          filterSummary={chartState.filterSummary}
          filters={chartState.filters}
          isLoading={chartState.isLoading}
          title={config.title}
          onFilterChange={onFilterChange}
          onSubmit={onSubmit}
        />
        {segments.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
            Chưa có dữ liệu cho biểu đồ này.
          </p>
        ) : (
          <div
            aria-label={`Biểu đồ báo cáo: ${config.title}`}
            className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center"
          >
            <div
              aria-hidden="true"
              className="mx-auto aspect-square w-36 rounded-full border border-border/70 shadow-inner"
              style={{ background: buildPieGradient(segments, total) }}
            />
            <ul className="space-y-2">
              {segments.map((segment) => (
                <li
                  key={segment.key}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="min-w-0 truncate font-medium">
                    {segment.label}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {segment.value.toLocaleString("vi-VN")}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {formatPercent(segment.value, total)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Tổng:{" "}
              <span className="font-mono text-foreground tabular-nums">
                {total.toLocaleString("vi-VN")}
              </span>{" "}
              {config.unit}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function buildPieGradient(
  segments: Array<{ color: string; value: number }>,
  total: number
) {
  if (total <= 0) return "conic-gradient(#e5e7eb 0deg 360deg)";

  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    cursor += (segment.value / total) * 360;

    return `${segment.color} ${start.toFixed(2)}deg ${cursor.toFixed(2)}deg`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

function formatPercent(value: number, total: number) {
  if (total <= 0) return "0.0%";

  return `${((value / total) * 100).toFixed(1)}%`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu biểu đồ báo cáo kit.";
}
