"use client";

import { Button } from "@/components/ui/button";
import type { SampleGridRow } from "@/lib/sample-grid/operations";
import { cn } from "@/lib/utils";

import { SampleGridStatusBadge } from "./sample-grid-status-badge";
import { SampleResultViewerLink } from "./sample-result-viewer-link";

type SampleGridMobileCardProps = {
  companyName: string | null;
  customerName: string | null;
  receivedAtLabel: string;
  resultSummary: SampleGridRow["resultSummary"];
  sampleId: string;
  sampleTypeName: string;
  status: string;
};

/** Render card mẫu mobile theo layout clinical grid từ Stitch. */
export function SampleGridMobileCard({
  companyName,
  customerName,
  receivedAtLabel,
  resultSummary,
  sampleId,
  sampleTypeName,
  status,
}: SampleGridMobileCardProps) {
  const group = resultSummary?.groups[0];
  const extraGroupCount = Math.max((resultSummary?.groups.length ?? 0) - 1, 0);
  const kqChung = group?.kqChung ?? "Chưa có";

  return (
    <article className="space-y-2" data-mobile-sample-card="clinical-grid">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {customerName ?? "Không có khách hàng"}
          </p>
          <p className="text-xs text-muted-foreground">
            {companyName ?? "Không có công ty"}
          </p>
        </div>
        <div className="shrink-0">
          <SampleGridStatusBadge status={status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="block font-medium text-foreground/70">
            Ngày nhận
          </span>
          <span className="tabular-nums">{receivedAtLabel}</span>
        </div>
        <div className="min-w-0 text-right">
          <span className="block font-medium text-foreground/70">Loại mẫu</span>
          <span className="truncate">{sampleTypeName}</span>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 rounded-md border border-primary/10 bg-primary/5 px-2.5 py-2 text-xs"
        data-mobile-sample-result-band="true"
      >
        <div className="min-w-0">
          <p className="font-medium text-foreground">Nhóm chỉ tiêu</p>
          <p className="truncate text-muted-foreground">
            {group ? formatGroupLabel(group.name, extraGroupCount) : "Chưa có"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-muted-foreground">KQ chung</p>
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 font-semibold",
              getKqChungClassName(kqChung)
            )}
          >
            {kqChung}
          </span>
        </div>
      </div>

      <div className="[&_[data-slot=button]]:min-h-11 [&_[data-slot=button]]:w-full">
        <Button asChild size="sm" variant="outline">
          <SampleResultViewerLink sampleId={sampleId}>
            Mở kết quả
          </SampleResultViewerLink>
        </Button>
      </div>
    </article>
  );
}

function formatGroupLabel(groupName: string, extraGroupCount: number) {
  return extraGroupCount > 0 ? `${groupName} +${extraGroupCount}` : groupName;
}

function getKqChungClassName(value: string) {
  if (value === "Chưa có") {
    return "bg-muted text-muted-foreground";
  }

  if (value.toLocaleUpperCase("vi-VN").includes("NHIỄM")) {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-primary/10 text-primary";
}
