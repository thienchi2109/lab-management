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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <div key={item.key} className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <item.icon className="size-4" />
            {item.label}
          </div>
          <div className="mt-2 text-2xl font-semibold">{summary[item.key]}</div>
        </div>
      ))}
    </div>
  );
}
