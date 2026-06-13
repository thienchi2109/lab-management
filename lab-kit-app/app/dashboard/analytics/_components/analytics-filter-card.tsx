import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/dashboard/app-select";
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
const emptySelectValue = "__all__";

/** Render command-bar filter controls cho Analytics Page. */
export function AnalyticsFilterCard({
  dimension,
  filters,
  isLoading,
  onDimensionChange,
  onFilterChange,
  onSubmit,
}: AnalyticsFilterCardProps) {
  return (
    <Card className="rounded-lg border-border/70 bg-card/95" size="sm">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Bộ lọc báo cáo</CardTitle>
            <CardDescription>
              Chọn khoảng dữ liệu, trạng thái và chiều pivot trước khi áp dụng.
            </CardDescription>
          </div>
          <span className="w-fit rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 font-mono text-[11px] text-primary tabular-nums">
            truy vấn giới hạn
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form
          aria-label="Bộ lọc analytics dạng command bar"
          className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.82fr)_auto] lg:items-end"
          onSubmit={onSubmit}
        >
          <div className="grid gap-2 sm:grid-cols-2">
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
          </div>
          <AnalyticsSelect
            label="Trạng thái"
            value={filters.status ?? ""}
            onChange={(value) => onFilterChange("status", value)}
            options={statusOptions}
          />
          <AnalyticsSelect
            label="Chiều pivot"
            value={dimension}
            onChange={(value) =>
              onDimensionChange(value as AnalyticsPageDimension)
            }
            options={dimensionOptions}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 gap-2 lg:self-end"
          >
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
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 bg-background font-mono text-sm tabular-nums"
      />
    </label>
  );
}

function AnalyticsSelect({
  label,
  value,
  onChange,
  options,
}: NativeFilterSelectProps) {
  const selectOptions = options.map(([optionValue, optionLabel]) => ({
    value: optionValue === "" ? emptySelectValue : optionValue,
    label: optionLabel,
  }));
  const selectedValue = value === "" ? emptySelectValue : value;

  return (
    <AppSelect
      label={label}
      value={selectedValue}
      onValueChange={(nextValue) =>
        onChange(nextValue === emptySelectValue ? "" : nextValue)
      }
      options={selectOptions}
      size="default"
      labelClassName="text-xs font-semibold text-muted-foreground"
      triggerClassName="h-10 w-full bg-background shadow-xs"
    />
  );
}
