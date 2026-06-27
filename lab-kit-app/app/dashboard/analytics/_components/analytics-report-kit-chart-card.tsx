"use client";

import {
  BadgeCheck,
  ChevronDown,
  Layers,
  Package,
  SlidersHorizontal,
  Tags,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReportKitChartFilterForm } from "./analytics-report-kit-chart-filter-form";
import type { ReportKitChartDatasetState } from "./analytics-report-kit-chart-state";

import type {
  ReportKitAnalyticsChartId,
  ReportKitAnalyticsSegment,
} from "@/lib/analytics/report-kit";
import type { AnalyticsFilters } from "@/lib/analytics/query";

type ChartConfig = {
  accentClassName: string;
  description: string;
  icon: LucideIcon;
  marker: string;
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
    accentClassName:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-300",
    description: "Tổng lượng sạch của mẫu tôm PL theo kết quả chung PCR.",
    icon: BadgeCheck,
    marker: "Tôm PL sạch",
    metric: "cleanCount",
    title: "Tôm PL sạch theo kết quả chung PCR",
    unit: "mẫu sạch",
  },
  kitQuantityByKitType: {
    accentClassName:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300",
    description: "Tổng lượng KIT đã dùng theo từng loại KIT.",
    icon: Package,
    marker: "Theo loại KIT",
    metric: "totalKitQuantity",
    title: "Tổng lượng KIT theo loại KIT",
    unit: "KIT",
  },
  kitQuantityBySampleType: {
    accentClassName:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300",
    description: "Tổng lượng KIT đã dùng theo từng loại mẫu.",
    icon: Layers,
    marker: "Theo loại mẫu",
    metric: "totalKitQuantity",
    title: "Tổng lượng KIT theo loại mẫu",
    unit: "KIT",
  },
  sampleCountByClassification: {
    accentClassName:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
    description:
      "Tổng lượng mẫu sử dụng theo phân loại khách hàng hoặc nội bộ.",
    icon: Tags,
    marker: "Theo phân loại",
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
  const Icon = config.icon;
  const segments = dataset.segments.map((segment, index) => ({
    color: segmentColors[index % segmentColors.length],
    key: segment.key,
    label: segment.label,
    value: segment.metrics[config.metric] ?? 0,
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const primarySegment = segments[0];
  const filterSummary = chartState.filterSummary.join(" · ");

  return (
    <section
      aria-label={config.title}
      className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm"
    >
      <details className="group" data-report-kit-chart-card>
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
            <div className="flex items-start gap-3">
              <span
                aria-label={`Dấu hiệu nhận diện biểu đồ: ${config.marker}`}
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border",
                  config.accentClassName
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {config.marker}
                </p>
                <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-foreground md:text-base">
                  {config.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  Bộ lọc: {filterSummary}
                </p>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                <div className="rounded-md bg-background/80 px-2.5 py-1 text-right ring-1 ring-border/60">
                  <p className="font-mono text-lg font-semibold leading-none tabular-nums">
                    {total.toLocaleString("vi-VN")}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {config.unit}
                  </p>
                </div>
                <span className="mt-0.5 inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2.5 text-xs font-medium text-muted-foreground">
                  <span className="hidden md:inline">Xem biểu đồ</span>
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </span>
              </div>
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
          </div>
        </summary>
        <div
          className="hidden space-y-4 px-4 py-4 group-open:block"
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
