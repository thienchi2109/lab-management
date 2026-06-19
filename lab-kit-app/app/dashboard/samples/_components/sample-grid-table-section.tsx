"use client";

import Link from "next/link";

import {
  DashboardDataTable,
  type DashboardDataTableRow,
} from "@/components/dashboard/data-table";
import {
  requestSampleMetadataEdit,
  requestSampleMetadataView,
} from "@/components/layout/sample-create-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GROUP_CONCLUSION_DISPLAY_LABEL } from "@/lib/result-labels";
import type {
  SampleGridPage,
  SampleGridResultGroupSummary,
  SampleGridResultMetricSummary,
  SampleGridRow,
} from "@/lib/sample-grid/operations";

import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";
import { toMetadataRequestSample } from "./sample-grid-metadata-request";
import { SampleResultViewerLink } from "./sample-result-viewer-link";

type SampleGridTableSectionProps = {
  page: SampleGridPage;
};

type ResultSummaryIndex = {
  groupKqChungByKey: Map<string, string | null>;
  metricByKey: Map<string, SampleGridResultMetricSummary>;
};

const sampleDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
  timeStyle: "short",
});

const mobileHiddenColumnKeys = ["sample", "kit", "billing"] as const;

export function SampleGridTableSection({ page }: SampleGridTableSectionProps) {
  const resultColumnLabelByKey = new Map(
    page.resultColumnOptions.map((option) => [option.key, option.label])
  );

  return (
    <DashboardDataTable
      caption="Danh sách mẫu xét nghiệm"
      density="compact"
      emptyAction={
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href="/dashboard/samples"
        >
          Xóa bộ lọc
        </Link>
      }
      emptyDescription="Thử đổi từ khóa, bộ lọc hoặc quay lại trang đầu."
      emptyTitle="Không có mẫu phù hợp"
      mobileHiddenColumnKeys={mobileHiddenColumnKeys}
      rows={page.rows.map((sample) =>
        toTableRow(sample, page, resultColumnLabelByKey)
      )}
      tone="workspace"
    />
  );
}

function toTableRow(
  sample: SampleGridRow,
  page: SampleGridPage,
  resultColumnLabelByKey: Map<string, string>
): DashboardDataTableRow {
  const resultSummaryIndex = buildResultSummaryIndex(
    sample.resultSummary?.groups ?? []
  );

  return {
    id: sample.id,
    mobilePrimaryAction: (
      <Button asChild size="sm">
        <SampleResultViewerLink sampleId={sample.id}>
          Mở kết quả
        </SampleResultViewerLink>
      </Button>
    ),
    cells: [
      {
        columnKey: "sample",
        header: "Mã mẫu",
        content: sample.sampleCode,
        primary: true,
      },
      {
        columnKey: "customer",
        header: "Khách hàng",
        mobileHeader: "Khách",
        content: sample.customerName ?? "Không có",
      },
      {
        columnKey: "company",
        desktopClassName: "hidden xl:table-cell",
        header: "Công ty",
        content: sample.companyName ?? "Không có",
      },
      {
        columnKey: "sampleType",
        desktopClassName: "hidden lg:table-cell",
        header: "Loại mẫu",
        mobileHeader: "Loại",
        content: sample.sampleTypeName,
      },
      {
        columnKey: "kit",
        desktopClassName: "hidden xl:table-cell",
        header: "KIT",
        mobileClassName: "hidden sm:flex",
        content: sample.kitSummary,
      },
      {
        columnKey: "receivedAt",
        desktopClassName: "hidden lg:table-cell",
        header: "Ngày nhận",
        mobileHeader: "Ngày",
        content: sampleDateFormatter.format(new Date(sample.receivedAt)),
      },
      {
        columnKey: "status",
        header: "Trạng thái",
        content: <StatusBadge status={sample.status} />,
      },
      {
        columnKey: "billing",
        desktopClassName: "hidden lg:table-cell",
        header: "Thanh toán",
        mobileClassName: "hidden sm:flex",
        content: formatBillingStatus(sample.billingStatus),
      },
      {
        columnKey: "resultDetail",
        desktopClassName: "hidden lg:table-cell",
        header: "Nhóm kết quả",
        mobileContent: <MobileResultSummary summary={sample.resultSummary} />,
        mobileHeader: "Nhóm",
        content: (
          <ResultGroupDetail
            canWrite={page.capabilities.canEnterResults}
            sampleId={sample.id}
            summary={sample.resultSummary}
          />
        ),
      },
      ...page.selectedResultColumnKeys.map((key) =>
        toResultColumnCell(key, resultColumnLabelByKey, resultSummaryIndex)
      ),
    ],
    actions: (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            requestSampleMetadataView(toMetadataRequestSample(sample))
          }
        >
          Xem chi tiết
        </Button>
        {page.capabilities.canUpdateMetadata ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              requestSampleMetadataEdit(toMetadataRequestSample(sample))
            }
          >
            Cập nhật
          </Button>
        ) : null}
        <Button asChild size="sm" variant="outline">
          <SampleResultViewerLink sampleId={sample.id}>
            {page.capabilities.canEnterResults ||
            page.capabilities.canManageImages
              ? "Kết quả & ảnh"
              : "Xem kết quả & ảnh"}
          </SampleResultViewerLink>
        </Button>
      </div>
    ),
  };
}

function ResultGroupDetail({
  canWrite,
  sampleId,
  summary,
}: {
  canWrite: boolean;
  sampleId: string;
  summary: SampleGridRow["resultSummary"];
}) {
  if (!summary || summary.groups.length === 0) {
    return <span className="text-muted-foreground">Chưa có nhóm kết quả</span>;
  }

  return (
    <div className="space-y-2">
      {summary.groups.map((group) => (
        <details key={group.id} className="rounded-md border p-2" open>
          <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
            {group.name}: {group.enteredMetrics}/{group.totalMetrics} chỉ tiêu
          </summary>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>
              {GROUP_CONCLUSION_DISPLAY_LABEL}: {group.kqChung ?? "Chưa có"}
            </p>
            {group.metrics.map((metric) => (
              <p key={metric.id}>
                {metric.name}: {formatResultValue(metric.value)}
              </p>
            ))}
            <SampleResultViewerLink
              className="inline-flex text-foreground underline-offset-4 hover:underline"
              sampleId={sampleId}
            >
              {canWrite ? "Chỉnh sửa kết quả" : "Xem kết quả"}
            </SampleResultViewerLink>
          </div>
        </details>
      ))}
    </div>
  );
}

function MobileResultSummary({
  summary,
}: {
  summary: SampleGridRow["resultSummary"];
}) {
  const group = summary?.groups[0];

  if (!group) {
    return <span>Chưa có</span>;
  }

  const extraGroupCount = Math.max(summary.groups.length - 1, 0);
  const suffix = extraGroupCount > 0 ? ` +${extraGroupCount}` : "";

  return (
    <span>
      {group.name}
      {suffix} · KQ chung: {group.kqChung ?? "Chưa có"}
    </span>
  );
}

function toResultColumnCell(
  key: string,
  resultColumnLabelByKey: Map<string, string>,
  resultSummaryIndex: ResultSummaryIndex
) {
  return {
    columnKey: key,
    desktopClassName: "hidden lg:table-cell",
    header: resultColumnLabelByKey.get(key) ?? "Kết quả",
    mobileClassName: "hidden md:flex",
    content: formatSelectedResultValue(key, resultSummaryIndex),
  };
}

function formatSelectedResultValue(
  key: string,
  resultSummaryIndex: ResultSummaryIndex
) {
  if (key.startsWith("group:")) {
    return resultSummaryIndex.groupKqChungByKey.get(key) ?? "Chưa có";
  }

  const metric = resultSummaryIndex.metricByKey.get(key);

  return metric ? formatResultValue(metric.value) : "Chưa có";
}

function buildResultSummaryIndex(
  groups: SampleGridResultGroupSummary[]
): ResultSummaryIndex {
  const groupKqChungByKey = new Map<string, string | null>();
  const metricByKey = new Map<string, SampleGridResultMetricSummary>();

  for (const group of groups) {
    groupKqChungByKey.set(`group:${group.id}`, group.kqChung ?? null);

    for (const metric of group.metrics) {
      metricByKey.set(`metric:${metric.id}`, metric);
    }
  }

  return { groupKqChungByKey, metricByKey };
}

function formatResultValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Chưa nhập";
  }

  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatBillingStatus(status: string) {
  const labels: Record<string, string> = billingStatusLabels;

  return labels[status] ?? status;
}

function StatusBadge({ status }: { status: string }) {
  const destructive = status === "archived";

  return (
    <Badge variant={destructive ? "destructive" : "secondary"}>
      {sampleStatusLabels[status as keyof typeof sampleStatusLabels] ?? status}
    </Badge>
  );
}
