import Link from "next/link";
import { Search } from "lucide-react";

import { DashboardDataTable } from "@/components/dashboard/data-table";
import { SelectField } from "@/components/dashboard/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  SampleGridPage,
  SampleGridRow,
} from "@/lib/sample-grid/operations";

import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";
import { SampleGridColumnPreferences } from "./sample-grid-column-preferences";

type SampleGridPageContentProps = {
  page: SampleGridPage;
};

const sampleDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

const statusOptions: Array<[string, string]> = [
  ["all", "Tất cả trạng thái"],
  ...Object.entries(sampleStatusLabels),
];
const billingOptions: Array<[string, string]> = [
  ["all", "Tất cả thanh toán"],
  ...Object.entries(billingStatusLabels),
];
const sortOptions: Array<[string, string]> = [
  ["receivedAt", "Ngày nhận"],
  ["sampleCode", "Mã mẫu"],
  ["customerName", "Khách hàng"],
  ["status", "Trạng thái"],
  ["billingStatus", "Thanh toán"],
];
const directionOptions: Array<[string, string]> = [
  ["desc", "Giảm dần"],
  ["asc", "Tăng dần"],
];
const sampleGridColumnPreferences = [
  { key: "sample", label: "Mã mẫu", locked: true },
  { key: "customer", label: "Khách hàng", locked: true },
  { key: "company", label: "Công ty" },
  { key: "sampleType", label: "Loại mẫu" },
  { key: "kit", label: "KIT" },
  { key: "receivedAt", label: "Ngày nhận" },
  { key: "status", label: "Trạng thái", locked: true },
  { key: "billing", label: "Thanh toán" },
];

/** Render bảng mẫu MVP bằng shared DashboardDataTable và URL state. */
export function SampleGridPageContent({ page }: SampleGridPageContentProps) {
  const visibleFrom =
    page.pageInfo.totalCount === 0 ? 0 : page.query.offset + 1;
  const visibleTo = Math.min(
    page.query.offset + page.rows.length,
    page.pageInfo.totalCount
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Bảng mẫu xét nghiệm
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tra cứu mẫu theo mã, khách hàng, trạng thái và trang dữ liệu đã phân
            quyền theo tổ chức.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Hiển thị {visibleFrom}-{visibleTo} / {page.pageInfo.totalCount} mẫu
        </div>
      </div>

      <form
        action="/dashboard/samples"
        className="rounded-lg border bg-background p-4"
        method="get"
      >
        <input name="page" type="hidden" value="1" />
        <div className="grid gap-3 md:grid-cols-[1fr_180px_190px_150px_150px_auto] md:items-end">
          <label className="space-y-1.5 text-sm font-medium">
            <span>Tìm kiếm</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                defaultValue={page.query.search ?? ""}
                name="search"
                placeholder="Mã mẫu hoặc khách hàng"
              />
            </div>
          </label>
          <SelectField
            defaultValue={page.query.filters.status ?? "all"}
            label="Trạng thái"
            name="status"
            options={statusOptions}
          />
          <SelectField
            defaultValue={page.query.filters.billingStatus ?? "all"}
            label="Thanh toán"
            name="billingStatus"
            options={billingOptions}
          />
          <SelectField
            defaultValue={page.query.sort.key}
            label="Sắp xếp"
            name="sort"
            options={sortOptions}
          />
          <SelectField
            defaultValue={page.query.sort.direction}
            label="Hướng"
            name="dir"
            options={directionOptions}
          />
          <Button type="submit">Áp dụng</Button>
        </div>
      </form>

      <SampleGridColumnPreferences columns={sampleGridColumnPreferences} />

      <DashboardDataTable
        caption="Danh sách mẫu xét nghiệm"
        emptyDescription="Thử đổi từ khóa, bộ lọc hoặc quay lại trang đầu."
        emptyTitle="Không có mẫu phù hợp"
        rows={page.rows.map((sample) => toTableRow(sample, page))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Trang {page.pageInfo.totalPages === 0 ? 0 : page.pageInfo.page} /{" "}
          {page.pageInfo.totalPages}
        </span>
        <div className="flex gap-2">
          <PaginationButton
            enabled={page.pageInfo.hasPreviousPage}
            href={buildPageHref(page, page.pageInfo.page - 1)}
            label="Trang trước"
          />
          <PaginationButton
            enabled={page.pageInfo.hasNextPage}
            href={buildPageHref(page, page.pageInfo.page + 1)}
            label="Trang tiếp"
          />
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  enabled,
  href,
  label,
}: {
  enabled: boolean;
  href: string;
  label: string;
}) {
  if (!enabled) {
    return (
      <Button disabled size="sm" type="button" variant="outline">
        {label}
      </Button>
    );
  }

  return (
    <Button asChild size="sm" variant="outline">
      <Link href={href}>{label}</Link>
    </Button>
  );
}

function toTableRow(sample: SampleGridRow, page: SampleGridPage) {
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
        content: formatDate(sample.receivedAt),
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

function StatusBadge({ status }: { status: string }) {
  const destructive = status === "archived";

  return (
    <Badge variant={destructive ? "destructive" : "secondary"}>
      {sampleStatusLabels[status as keyof typeof sampleStatusLabels] ?? status}
    </Badge>
  );
}

function formatBillingStatus(status: string) {
  const labels: Record<string, string> = billingStatusLabels;

  return labels[status] ?? status;
}

function formatDate(value: string) {
  return sampleDateFormatter.format(new Date(value));
}

function buildPageHref(page: SampleGridPage, nextPage: number) {
  const params = new URLSearchParams();

  if (page.query.search) params.set("search", page.query.search);
  if (page.query.filters.status)
    params.set("status", page.query.filters.status);
  if (page.query.filters.billingStatus) {
    params.set("billingStatus", page.query.filters.billingStatus);
  }

  params.set("sort", page.query.sort.key);
  params.set("dir", page.query.sort.direction);
  params.set("page", String(nextPage));
  params.set("pageSize", String(page.query.pageSize));

  return `/dashboard/samples?${params.toString()}`;
}
