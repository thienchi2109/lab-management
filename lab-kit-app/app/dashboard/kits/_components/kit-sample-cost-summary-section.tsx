"use client";

import { useMemo, useState } from "react";

import { FilterSelect } from "@/components/dashboard/filter-select";
import type {
  SampleCostGroup,
  SampleCostSummary,
} from "@/lib/sample-metadata/sample-cost-summary";
import { cn } from "@/lib/utils";

type KitSampleCostSummarySectionProps = {
  className?: string;
  summary: SampleCostSummary;
};

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

/** Hiển thị tổng chi phí mẫu hiện tại theo contract dữ liệu đã chốt. */
export function KitSampleCostSummarySection({
  className,
  summary,
}: KitSampleCostSummarySectionProps) {
  const [selectedGroup, setSelectedGroup] = useState("all");
  const groups = useMemo(
    () => normalizeGroups(summary.groups),
    [summary.groups]
  );
  const visibleGroups =
    selectedGroup === "all"
      ? groups
      : groups.filter((group) => group.group === selectedGroup);
  const hasCost = groups.some((group) => group.totalAmountVnd > 0);

  return (
    <section
      data-kit-cost-summary="true"
      className={cn("space-y-3 rounded-xl border bg-card/80 p-4", className)}
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h2 className="text-lg font-semibold">Chi phí hiện tại</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng hợp chi phí mẫu theo tình trạng chi phí đã ghi nhận.
          </p>
        </div>
        <FilterSelect
          label="Tình trạng chi phí"
          value={selectedGroup}
          onChange={setSelectedGroup}
          options={[
            ["all", "Tất cả"],
            ...groups.map(
              (group) => [group.group, group.label] as [string, string]
            ),
          ]}
        />
      </div>

      {hasCost ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleGroups.map((group) => (
            <div
              key={group.group}
              className="rounded-lg border bg-background/70 p-4"
            >
              <div className="text-sm text-muted-foreground">{group.label}</div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {formatMoney(group.totalAmountVnd)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/20 p-4">
          <div className="text-sm font-medium">Chưa có mẫu có chi phí</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Các tổng chi phí sẽ hiển thị khi mẫu có số tiền hợp lệ.
          </p>
        </div>
      )}
    </section>
  );
}

function normalizeGroups(groups: SampleCostGroup[]) {
  return groups.map((group) => ({
    ...group,
    totalAmountVnd: normalizeAmount(group.totalAmountVnd),
  }));
}

function normalizeAmount(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function formatMoney(value: number) {
  return moneyFormatter.format(normalizeAmount(value));
}
