import { Activity, FileStack, ListChecks, Sigma } from "lucide-react";

import type { ResultConfigurationSummary } from "@/lib/result-configuration/configuration";

type ResultConfigurationSummaryStripProps = {
  summary: ResultConfigurationSummary;
};

const summaryItems = [
  { key: "groups", label: "Nhóm hoạt động", icon: Activity },
  { key: "metrics", label: "Chỉ tiêu hoạt động", icon: ListChecks },
  { key: "templates", label: "Mẫu cấu hình", icon: FileStack },
  { key: "requiredMetrics", label: "Bắt buộc", icon: Sigma },
] as const;

export function ResultConfigurationSummaryStrip({
  summary,
}: ResultConfigurationSummaryStripProps) {
  return (
    <section
      aria-label="Tổng quan cấu hình"
      className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4"
    >
      {summaryItems.map((item) => (
        <div
          key={item.key}
          className="rounded-lg border bg-background/80 px-3 py-2.5 md:p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:text-xs">
                <item.icon className="size-3.5 shrink-0 md:size-4" />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="mt-1 text-xl font-semibold leading-none md:mt-2 md:text-2xl">
                {summary[item.key]}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
