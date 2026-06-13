import { BarChart3 } from "lucide-react";

import {
  DashboardDataTable,
  type DashboardDataTableRow,
} from "@/components/dashboard/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import {
  formatPositiveRate,
  formatSampleCount,
  getAnalyticsDimensionLabel,
} from "./analytics-page-format";
import type {
  AnalyticsPageDimension,
  AnalyticsPivotDisplayRow,
} from "./analytics-page-types";

type AnalyticsPivotSectionProps = {
  dimension: AnalyticsPageDimension;
  rows: AnalyticsPivotDisplayRow[];
};

/** Render chart và bảng pivot analytics từ cùng danh sách row. */
export function AnalyticsPivotSection({
  dimension,
  rows,
}: AnalyticsPivotSectionProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <PivotChart rows={rows} />
      <PivotTable rows={rows} dimension={dimension} />
    </div>
  );
}

function PivotChart({ rows }: { rows: AnalyticsPivotDisplayRow[] }) {
  const maxSamples = rows.reduce(
    (currentMax, row) => Math.max(currentMax, row.sampleCount),
    1
  );

  return (
    <Card className="rounded-lg border-border/70">
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="size-4 text-primary" />
          Phân bố pivot
        </h2>
        <CardDescription>
          So sánh số mẫu theo chiều pivot đang chọn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div aria-label="Biểu đồ pivot analytics" className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có dữ liệu phù hợp với bộ lọc hiện tại.
            </p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{row.label}</span>
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
                    {formatSampleCount(row.sampleCount)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width:
                        row.sampleCount === 0
                          ? "0%"
                          : `${Math.max((row.sampleCount / maxSamples) * 100, 4)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PivotTable({
  rows,
  dimension,
}: {
  rows: AnalyticsPivotDisplayRow[];
  dimension: AnalyticsPageDimension;
}) {
  const tableRows: DashboardDataTableRow[] = rows.map((row) => ({
    id: row.id,
    cells: [
      {
        header: getAnalyticsDimensionLabel(dimension),
        content: row.label,
        primary: true,
      },
      { header: "Tổng mẫu", content: formatSampleCount(row.sampleCount) },
      { header: "Dương tính", content: formatSampleCount(row.positiveCount) },
      { header: "Tỷ lệ", content: formatPositiveRate(row) },
    ],
  }));

  return (
    <section className="rounded-lg border border-border/70 bg-card p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold">Chi tiết pivot</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Bảng dùng cùng dữ liệu với biểu đồ và tự chuyển sang card trên mobile.
        </p>
      </div>
      <DashboardDataTable
        caption="Bảng pivot analytics"
        density="compact"
        emptyTitle="Không có dữ liệu analytics"
        emptyDescription="Thử đổi khoảng ngày hoặc trạng thái mẫu."
        rows={tableRows}
        tone="workspace"
      />
    </section>
  );
}
