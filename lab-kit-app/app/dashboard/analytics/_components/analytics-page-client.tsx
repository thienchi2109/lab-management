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

/** Render Analytics Page & Pivot UI MVP với filter bounded và table responsive. */
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
      </div>

      <div>
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
          <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
        ) : null}
      </div>

      <section className="rounded-lg border bg-background p-4">
        <h2 className="text-sm font-medium">Tóm tắt bộ lọc</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {dataset.filterSummary.map((item) => (
            <span
              key={item}
              className="rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
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
