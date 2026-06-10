import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SampleStatus } from "@/lib/sample-metadata/schemas";

import type {
  AnalyticsPageDimension,
  AnalyticsPageFilters,
} from "./analytics-page-types";

type AnalyticsFilterCardProps = {
  dimension: AnalyticsPageDimension;
  filters: AnalyticsPageFilters;
  isLoading: boolean;
  onDimensionChange: (value: AnalyticsPageDimension) => void;
  onFilterChange: (key: keyof AnalyticsPageFilters, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

type NativeFilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
};

const dimensionOptions: Array<[AnalyticsPageDimension, string]> = [
  ["receivedDate", "Ngày nhận mẫu"],
  ["pcrMetric", "Chỉ tiêu PCR"],
];
const statusOptions: Array<["", string] | [SampleStatus, string]> = [
  ["", "Tất cả trạng thái"],
  ["received", "Đã nhận"],
  ["in_progress", "Đang xử lý"],
  ["completed", "Hoàn tất"],
  ["draft", "Bản nháp"],
  ["archived", "Đã lưu trữ"],
];

/** Render filter controls cho Analytics Page MVP. */
export function AnalyticsFilterCard({
  dimension,
  filters,
  isLoading,
  onDimensionChange,
  onFilterChange,
  onSubmit,
}: AnalyticsFilterCardProps) {
  return (
    <Card className="rounded-lg" size="sm">
      <CardHeader>
        <CardTitle>Bộ lọc</CardTitle>
        <CardDescription>
          Khoảng ngày là bắt buộc để giữ truy vấn pivot có giới hạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
          onSubmit={onSubmit}
        >
          <FilterDateInput
            label="Từ ngày"
            value={filters.receivedFrom ?? ""}
            onChange={(value) => onFilterChange("receivedFrom", value)}
          />
          <FilterDateInput
            label="Đến ngày"
            value={filters.receivedTo ?? ""}
            onChange={(value) => onFilterChange("receivedTo", value)}
          />
          <NativeFilterSelect
            label="Trạng thái"
            value={filters.status ?? ""}
            onChange={(value) => onFilterChange("status", value)}
            options={statusOptions}
          />
          <NativeFilterSelect
            label="Chiều pivot"
            value={dimension}
            onChange={(value) =>
              onDimensionChange(value as AnalyticsPageDimension)
            }
            options={dimensionOptions}
          />
          <Button type="submit" disabled={isLoading} className="md:self-end">
            <SlidersHorizontal className="size-4" />
            {isLoading ? "Đang tải" : "Áp dụng"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FilterDateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9"
      />
    </label>
  );
}

function NativeFilterSelect({
  label,
  value,
  onChange,
  options,
}: NativeFilterSelectProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || "all"} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
