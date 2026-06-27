"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportKitChartFilterForm } from "./analytics-report-kit-chart-filter-form";
import type { ReportKitChartDatasetState } from "./analytics-report-kit-chart-state";

import type {
  ReportKitAnalyticsChartId,
  ReportKitAnalyticsSegment,
} from "@/lib/analytics/report-kit";
import type { AnalyticsFilters } from "@/lib/analytics/query";

type ChartConfig = {
  description: string;
  metric: keyof ReportKitAnalyticsSegment["metrics"];
  title: string;
  unit: string;
};

type ReportKitChartCardProps = {
  chartState: ReportKitChartDatasetState;
  onOpenFilter: () => void;
  onFilterChange: (filters: AnalyticsFilters) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
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

/** Trả về tiêu đề tiếng Việt ổn định cho từng biểu đồ báo cáo kit/mẫu. */
export function getReportKitChartTitle(chartId: ReportKitAnalyticsChartId) {
  return chartConfigs[chartId].title;
}

/** Render một chart card báo cáo, compact trên mobile và đầy đủ trên desktop. */
export function ReportKitChartCard({
  chartState,
  onOpenFilter,
  onFilterChange,
  onSubmit,
}: ReportKitChartCardProps) {
  const { dataset } = chartState;
  const config = chartConfigs[dataset.chartId];
  const segments = dataset.segments.map((segment, index) => ({
    color: segmentColors[index % segmentColors.length],
    key: segment.key,
    label: segment.label,
    value: segment.metrics[config.metric] ?? 0,
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const primarySegment = segments[0];

  return (
    <section
      aria-label={config.title}
      className="rounded-lg border border-border/70 bg-card"
    >
      <details className="group" data-report-kit-chart-card>
        <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold md:text-base">
                {config.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Bộ lọc: {chartState.filterSummary.join(" · ")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-lg font-semibold tabular-nums">
                {total.toLocaleString("vi-VN")}
              </p>
              <p className="text-[11px] text-muted-foreground">{config.unit}</p>
            </div>
            <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 md:hidden" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
            <span className="h-2 flex-1 rounded-full bg-muted">
              <span
                className="block h-2 rounded-full bg-primary"
                style={{ width: primarySegment ? "72%" : "0%" }}
              />
            </span>
            <span className="max-w-[11rem] truncate">
              {primarySegment
                ? `${primarySegment.label} dẫn đầu`
                : "Chưa có dữ liệu"}
            </span>
          </div>
        </summary>
        <div
          className="hidden space-y-4 px-4 pb-4 group-open:block md:block"
          data-report-kit-chart-body
        >
          <div className="hidden md:block">
            <ReportKitChartFilterForm
              error={chartState.error}
              filterSummary={chartState.filterSummary}
              filters={chartState.filters}
              isLoading={chartState.isLoading}
              title={config.title}
              onFilterChange={onFilterChange}
              onSubmit={onSubmit}
            />
          </div>
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
                className="mx-auto aspect-square w-28 rounded-full border border-border/70 shadow-inner md:w-36"
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
            </div>
          )}
        </div>
      </details>
      <div className="border-t border-border/60 px-4 py-3 md:hidden">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full gap-2"
          onClick={onOpenFilter}
        >
          <SlidersHorizontal className="size-4" />
          Lọc biểu đồ này
        </Button>
      </div>
    </section>
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
