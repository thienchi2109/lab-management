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
import { SampleExportControls } from "./sample-export-controls";
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
  const resultGroupLabelById = new Map(
    page.resultGroupOptions.map((option) => [option.id, option.label])
  );
  const selectedResultGroupIds = page.query.filters.resultGroupIds ?? [];

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
        <div className="flex flex-col gap-3 md:items-end">
          <div className="text-sm text-muted-foreground">
            Hiển thị {visibleFrom}-{visibleTo} / {page.pageInfo.totalCount} mẫu
          </div>
          <SampleExportControls
            canExport={page.capabilities.canExport}
            query={page.query}
          />
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
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_190px_150px_150px_auto] lg:items-end">
          <label
            className="space-y-1.5 text-sm font-medium"
            htmlFor="sample-grid-search"
          >
            <span>Tìm kiếm</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                defaultValue={page.query.search ?? ""}
                id="sample-grid-search"
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
        {page.resultGroupOptions.length > 0 ? (
          <fieldset className="mt-4 space-y-2">
            <legend className="text-xs font-semibold text-foreground">
              Nhóm chỉ tiêu
            </legend>
            <div className="flex flex-wrap gap-2">
              {page.resultGroupOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex min-h-9 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <input
                    className="size-4 accent-primary"
                    defaultChecked={selectedResultGroupIds.includes(option.id)}
                    name="resultGroupIds"
                    type="checkbox"
                    value={option.id}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {selectedResultGroupIds.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedResultGroupIds.map((groupId) => {
                  const label = resultGroupLabelById.get(groupId) ?? groupId;

                  return (
                    <Link
                      key={groupId}
                      aria-label={`Xóa ${label}`}
                      className="rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-background"
                      href={buildResultGroupRemovalHref(page, groupId)}
                    >
                      Đang lọc: {label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </fieldset>
        ) : null}
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
  for (const groupId of page.query.filters.resultGroupIds ?? []) {
    params.append("resultGroupIds", groupId);
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

function buildResultGroupRemovalHref(
  page: SampleGridPage,
  removedGroupId: string
) {
  const params = new URLSearchParams();

  if (page.query.search) params.set("search", page.query.search);
  if (page.query.filters.status)
    params.set("status", page.query.filters.status);
  if (page.query.filters.billingStatus) {
    params.set("billingStatus", page.query.filters.billingStatus);
  }
  for (const groupId of page.query.filters.resultGroupIds ?? []) {
    if (groupId !== removedGroupId) {
      params.append("resultGroupIds", groupId);
    }
  }
  params.set("sort", page.query.sort.key);
  params.set("dir", page.query.sort.direction);
  params.set("page", "1");
  params.set("pageSize", String(page.query.pageSize));
  for (const key of page.selectedResultColumnKeys) {
    params.append("resultColumns", key);
  }

  return `/dashboard/samples?${params.toString()}`;
}
