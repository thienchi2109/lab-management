"use client";

import { useRef, useState } from "react";
import { Save, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BottomSheetFrame } from "@/components/ui/overlay-frame";
import type { ReportKitAnalyticsChartId } from "@/lib/analytics/report-kit";
import type { AnalyticsFilters } from "@/lib/analytics/query";

import {
  fetchReportKitChartContract,
  saveReportKitFilterPreset,
} from "./analytics-report-kit-chart-api";
import {
  getReportKitChartTitle,
  ReportKitChartCard,
} from "./analytics-report-kit-chart-card";
import { ReportKitChartFilterForm } from "./analytics-report-kit-chart-filter-form";
import {
  applyReportKitChartContract,
  createReportKitFilterPresetConfig,
  createReportKitChartState,
  setReportKitChartError,
  setReportKitChartLoading,
  updateReportKitChartFilters,
  type ReportKitChartBootstrapContract,
} from "./analytics-report-kit-chart-state";

type AnalyticsReportKitChartsProps = {
  canSavePreset?: boolean;
  contract: ReportKitChartBootstrapContract;
  initialFiltersByChart?: Partial<
    Record<ReportKitAnalyticsChartId, AnalyticsFilters>
  >;
};

type PresetMessage = {
  kind: "error" | "success";
  text: string;
};

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
      <div className="md:hidden" data-report-kit-mobile-filter-toolbar="true">
        <Button
          type="button"
          variant="outline"
          className="min-h-12 w-full gap-2"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Chỉnh bộ lọc biểu đồ
        </Button>
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
      {isMobileFilterOpen ? (
        <BottomSheetFrame
          title="Bộ lọc biểu đồ"
          closeLabel="Đóng"
          onClose={() => setIsMobileFilterOpen(false)}
        >
          <div className="space-y-4">
            {chartState.charts.map((chartId) => {
              const state = chartState.datasets[chartId];

              return (
                <ReportKitChartFilterForm
                  key={chartId}
                  error={state.error}
                  filterSummary={state.filterSummary}
                  filters={state.filters}
                  isLoading={state.isLoading}
                  title={getReportKitChartTitle(chartId)}
                  onFilterChange={(filters) =>
                    updateChartFilters(chartId, filters)
                  }
                  onSubmit={(event) => submitChartFilters(event, chartId)}
                />
              );
            })}
          </div>
        </BottomSheetFrame>
      ) : null}
    </section>
  );

  function updateChartFilters(
    chartId: ReportKitAnalyticsChartId,
    filters: AnalyticsFilters
  ) {
    setPresetMessage(null);
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

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu biểu đồ báo cáo kit.";
}
