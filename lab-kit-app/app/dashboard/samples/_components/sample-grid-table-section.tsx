"use client";

import Link from "next/link";

import {
  DashboardDataTable,
  type DashboardDataTableRow,
} from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  SampleGridPage,
  SampleGridRow,
} from "@/lib/sample-grid/operations";

import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";
import {
  SampleGridColumnPreferences,
  useSampleGridHiddenColumnKeys,
  type SampleGridColumnPreference,
} from "./sample-grid-column-preferences";

type SampleGridTableSectionProps = {
  page: SampleGridPage;
};

const sampleDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

const sampleGridColumnPreferences = [
  { key: "sample", label: "Mã mẫu", locked: true },
  { key: "customer", label: "Khách hàng", locked: true },
  { key: "company", label: "Công ty" },
  { key: "sampleType", label: "Loại mẫu" },
  { key: "kit", label: "KIT" },
  { key: "receivedAt", label: "Ngày nhận" },
  { key: "status", label: "Trạng thái", locked: true },
  { key: "billing", label: "Thanh toán" },
] as const satisfies readonly SampleGridColumnPreference[];

/** Render phần bảng mẫu có tùy chọn ẩn/hiện cột lưu trong browser. */
export function SampleGridTableSection({ page }: SampleGridTableSectionProps) {
  const hiddenColumnKeys = useSampleGridHiddenColumnKeys(
    sampleGridColumnPreferences
  );

  return (
    <>
      <SampleGridColumnPreferences columns={sampleGridColumnPreferences} />

      <DashboardDataTable
        caption="Danh sách mẫu xét nghiệm"
        emptyDescription="Thử đổi từ khóa, bộ lọc hoặc quay lại trang đầu."
        emptyTitle="Không có mẫu phù hợp"
        hiddenColumnKeys={hiddenColumnKeys}
        rows={page.rows.map((sample) => toTableRow(sample, page))}
      />
    </>
  );
}

function toTableRow(
  sample: SampleGridRow,
  page: SampleGridPage
): DashboardDataTableRow {
  const actionLabel =
    page.capabilities.canEnterResults || page.capabilities.canManageImages
      ? "Kết quả & ảnh"
      : "Xem kết quả & ảnh";

  return {
    id: sample.id,
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
        content: sample.customerName ?? "Không có",
      },
      {
        columnKey: "company",
        desktopClassName: "hidden xl:table-cell",
        header: "Công ty",
        mobileClassName: "hidden sm:flex",
        content: sample.companyName ?? "Không có",
      },
      {
        columnKey: "sampleType",
        desktopClassName: "hidden lg:table-cell",
        header: "Loại mẫu",
        mobileClassName: "hidden sm:flex",
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
        mobileClassName: "hidden sm:flex",
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
    ],
    actions: (
      <Button asChild size="sm" variant="outline">
        <Link href={`/dashboard/samples/${sample.id}/results`}>
          {actionLabel}
        </Link>
      </Button>
    ),
  };
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
