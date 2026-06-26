import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AnalyticsFilters } from "@/lib/analytics/query";

type ReportKitChartFilterFormProps = {
  error: string | null;
  filterSummary: string[];
  filters: AnalyticsFilters;
  isLoading: boolean;
  onFilterChange: (filters: AnalyticsFilters) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  title: string;
};

/** Render form filter ngày và summary riêng bên trong từng chart card. */
export function ReportKitChartFilterForm({
  error,
  filterSummary,
  filters,
  isLoading,
  onFilterChange,
  onSubmit,
  title,
}: ReportKitChartFilterFormProps) {
  return (
    <>
      <form
        aria-label={`Bộ lọc biểu đồ ${title}`}
        className="grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
        onSubmit={onSubmit}
      >
        <ChartDateInput
          label="Từ ngày"
          value={filters.receivedFrom ?? ""}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              receivedFrom: value || undefined,
            })
          }
        />
        <ChartDateInput
          label="Đến ngày"
          value={filters.receivedTo ?? ""}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              receivedTo: value || undefined,
            })
          }
        />
        <Button type="submit" disabled={isLoading} className="h-10 gap-2">
          <SlidersHorizontal className="size-4" />
          {isLoading ? "Đang tải" : "Áp dụng bộ lọc biểu đồ"}
        </Button>
      </form>
      <div
        aria-label="Tóm tắt bộ lọc biểu đồ"
        className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
      >
        {filterSummary.map((item) => (
          <span
            key={item}
            className="rounded-full border bg-background px-2.5 py-1"
          >
            {item}
          </span>
        ))}
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </>
  );
}

function ChartDateInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <Input
        aria-label={label}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 bg-background font-mono text-sm tabular-nums"
      />
    </label>
  );
}
