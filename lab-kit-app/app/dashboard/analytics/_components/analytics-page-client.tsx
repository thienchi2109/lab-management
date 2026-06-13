"use client";

import { useMemo, useRef, useState } from "react";

import { AnalyticsFilterCard } from "./analytics-filter-card";
import { mapAnalyticsRows } from "./analytics-page-format";
import type {
  AnalyticsPageFilters,
  AnalyticsPageMeasure,
  AnalyticsPageQueryState,
  AnalyticsPivotDataset,
} from "./analytics-page-types";
import { AnalyticsPivotSection } from "./analytics-pivot-section";

type AnalyticsPageClientProps = {
  initialDataset: AnalyticsPivotDataset;
  initialFilters: AnalyticsPageFilters;
};

const defaultMeasures: AnalyticsPageMeasure[] = [
  "sampleCount",
  "positiveCount",
];

const metricToneClasses = {
  default: "border-border/70 bg-card",
  positive: "border-emerald-500/20 bg-emerald-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
};

/** Render Analytics Page & Pivot UI với bộ lọc giới hạn và bảng responsive. */
export function AnalyticsPageClient({
  initialDataset,
  initialFilters,
}: AnalyticsPageClientProps) {
  const activeRequestId = useRef(0);
  const [dataset, setDataset] = useState(initialDataset);
  const [query, setQuery] = useState<AnalyticsPageQueryState>({
    dimension: "receivedDate",
    filters: initialFilters,
    measures: defaultMeasures,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const rows = useMemo(
    () => mapAnalyticsRows(dataset, query.dimension),
    [dataset, query.dimension]
  );
  const sampleTotal = getMeasureTotal(dataset, "sampleCount");
  const positiveTotal = getMeasureTotal(dataset, "positiveCount");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requestId = activeRequestId.current + 1;
    activeRequestId.current = requestId;
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analytics/pivot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dimensions: [query.dimension],
          measures: query.measures,
          filters: cleanFilters(query.filters),
        }),
      });
      const payload = await response.json();

      applyCurrentRequest(requestId, () => {
        if (!response.ok) {
          setError(getAnalyticsErrorMessage(payload));
          return;
        }

        if (!isAnalyticsPivotDataset(payload)) {
          setError("Không thể tải dữ liệu pivot analytics.");
          return;
        }

        setDataset(payload);
      });
    } catch {
      applyCurrentRequest(requestId, () => {
        setError("Không thể tải dữ liệu pivot analytics.");
      });
    } finally {
      applyCurrentRequest(requestId, () => {
        setIsLoading(false);
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Báo cáo thống kê & Pivot
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Theo dõi mẫu xét nghiệm theo thời gian và chỉ tiêu PCR bằng dữ liệu
            analytics đã giới hạn phạm vi.
          </p>
        </div>
        <output
          aria-label="Quyền truy cập analytics"
          className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs"
        >
          <span className="size-2 rounded-full bg-primary" />
          Chỉ đọc
        </output>
      </div>

      <section className="space-y-3">
        <AnalyticsFilterCard
          dimension={query.dimension}
          filters={query.filters}
          isLoading={isLoading}
          onDimensionChange={(dimension) =>
            setQuery((current) => ({ ...current, dimension }))
          }
          onFilterChange={updateFilter}
          onSubmit={handleSubmit}
        />
        {error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </section>

      <section
        aria-label="Tóm tắt bộ lọc đã áp dụng"
        className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm text-primary"
      >
        <span className="font-semibold">Đang áp dụng</span>
        {dataset.filterSummary.map((item) => (
          <span
            key={item}
            className="rounded-full border border-primary/15 bg-background px-2.5 py-1 text-xs text-primary/80"
          >
            {item}
          </span>
        ))}
      </section>

      <section
        aria-label="Tổng quan analytics"
        className="grid gap-3 md:grid-cols-3"
      >
        <AnalyticsMetricCard
          label="Tổng mẫu"
          value={formatTotalCount(sampleTotal)}
          detail="Tổng số mẫu trong bộ lọc hiện tại"
        />
        <AnalyticsMetricCard
          label="Dương tính"
          value={formatTotalCount(positiveTotal)}
          detail="Số mẫu dương tính trong bộ lọc hiện tại"
          tone="positive"
        />
        <AnalyticsMetricCard
          label="Tỷ lệ"
          value={formatTotalPositiveRate(sampleTotal, positiveTotal)}
          detail="Dương tính / tổng mẫu"
          tone="warning"
        />
      </section>

      <AnalyticsPivotSection rows={rows} dimension={query.dimension} />
    </div>
  );

  function updateFilter(key: keyof AnalyticsPageFilters, value: string) {
    setQuery((current) => ({
      ...current,
      filters: { ...current.filters, [key]: value || undefined },
    }));
  }

  function applyCurrentRequest(requestId: number, update: () => void) {
    if (requestId === activeRequestId.current) {
      update();
    }
  }
}

function AnalyticsMetricCard({
  detail,
  label,
  tone = "default",
  value,
}: {
  detail: string;
  label: string;
  tone?: "default" | "positive" | "warning";
  value: string;
}) {
  return (
    <article
      className={`rounded-lg border p-4 shadow-xs ${metricToneClasses[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
          tổng
        </span>
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

function getMeasureTotal(
  dataset: AnalyticsPivotDataset,
  measure: AnalyticsPageMeasure
) {
  const value = dataset.totals[measure];

  return typeof value === "number" ? value : 0;
}

function formatTotalCount(value: number) {
  return `${value.toLocaleString("vi-VN")} mẫu`;
}

function formatTotalPositiveRate(sampleTotal: number, positiveTotal: number) {
  if (sampleTotal === 0) return "0.0%";

  return `${((positiveTotal / sampleTotal) * 100).toFixed(1)}%`;
}

function cleanFilters(filters: AnalyticsPageFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value)
  );
}

function getAnalyticsErrorMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return "Không thể tải dữ liệu pivot analytics.";
}

function isAnalyticsPivotDataset(
  payload: unknown
): payload is AnalyticsPivotDataset {
  if (typeof payload !== "object" || payload === null) return false;

  const value = payload as Partial<AnalyticsPivotDataset>;

  return (
    isStringArray(value.filterSummary) &&
    Array.isArray(value.rows) &&
    value.rows.every(isAnalyticsRow) &&
    isRecord(value.totals) &&
    isStringArray(value.warnings)
  );
}

function isAnalyticsRow(row: unknown) {
  if (typeof row !== "object" || row === null) return false;

  const value = row as {
    dimensionValues?: unknown;
    measureValues?: unknown;
  };

  return isRecord(value.dimensionValues) && isRecord(value.measureValues);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
