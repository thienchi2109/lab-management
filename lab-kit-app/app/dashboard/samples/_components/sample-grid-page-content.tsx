import Link from "next/link";
import { Search } from "lucide-react";

import { SelectField } from "@/components/dashboard/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SampleGridPage } from "@/lib/sample-grid/operations";

import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";
import { SampleGridTableSection } from "./sample-grid-table-section";

type SampleGridPageContentProps = {
  page: SampleGridPage;
};

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
        {page.selectedResultColumnKeys.map((key) => (
          <input key={key} name="resultColumns" type="hidden" value={key} />
        ))}
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

      <SampleGridTableSection page={page} />

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
  for (const key of page.selectedResultColumnKeys) {
    params.append("resultColumns", key);
  }

  return `/dashboard/samples?${params.toString()}`;
}
