import Link from "next/link";
import { Search } from "lucide-react";

import { SelectField } from "@/components/dashboard/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleExportControls } from "./sample-export-controls";
import { SampleFilterCombobox } from "./sample-filter-combobox";
import { SampleGridTableSection } from "./sample-grid-table-section";
import { SampleResultViewer } from "./sample-result-viewer";

type SampleGridPageContentProps = {
  page: SampleGridPage;
};

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
  const activeFilterCount = getActiveSampleFilterCount(page);
  const filterSummary =
    activeFilterCount > 0
      ? `Đang áp dụng ${activeFilterCount} bộ lọc`
      : "Chưa áp dụng bộ lọc";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            DANH SÁCH MẪU
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tra cứu mẫu theo ngày, loại mẫu, khách hàng, tên công ty và nhóm chỉ
            tiêu trong phạm vi dữ liệu đã phân quyền.
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

      <details
        className="rounded-lg border bg-background"
        open={activeFilterCount > 0}
      >
        <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold">
                Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </h2>
              <p className="text-xs text-muted-foreground">{filterSummary}</p>
            </div>
          </div>
        </summary>
        <form action="/dashboard/samples" className="border-t p-4" method="get">
          <input name="page" type="hidden" value="1" />
          {page.selectedResultColumnKeys.map((key) => (
            <input key={key} name="resultColumns" type="hidden" value={key} />
          ))}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_150px_150px_170px_190px_190px_auto] xl:items-end">
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
            <label
              className="space-y-1.5 text-sm font-medium"
              htmlFor="sample-grid-received-from"
            >
              <span>Từ ngày nhận</span>
              <Input
                defaultValue={page.query.filters.receivedFrom ?? ""}
                id="sample-grid-received-from"
                name="receivedFrom"
                type="date"
              />
            </label>
            <label
              className="space-y-1.5 text-sm font-medium"
              htmlFor="sample-grid-received-to"
            >
              <span>Đến ngày nhận</span>
              <Input
                defaultValue={page.query.filters.receivedTo ?? ""}
                id="sample-grid-received-to"
                name="receivedTo"
                type="date"
              />
            </label>
            <SelectField
              defaultValue={page.query.filters.sampleTypeId ?? ""}
              label="Loại mẫu"
              name="sampleTypeId"
              options={[
                ["", "Tất cả"],
                ...page.filterOptions.sampleTypes.map(
                  (option) => [option.id, option.label] as [string, string]
                ),
              ]}
            />
            <SampleFilterCombobox
              defaultIdValue={page.query.filters.customerId}
              defaultTextValue={page.query.filters.customerName}
              idName="customerId"
              inputId="sample-grid-customer"
              label="Khách hàng"
              listId="sample-grid-customer-options"
              options={page.filterOptions.customers}
              placeholder="Tất cả khách hàng"
              textName="customerName"
            />
            <SampleFilterCombobox
              defaultIdValue={page.query.filters.companyId}
              defaultTextValue={page.query.filters.companyName}
              idName="companyId"
              inputId="sample-grid-company"
              label="Công ty"
              listId="sample-grid-company-options"
              options={page.filterOptions.companies}
              placeholder="Tất cả công ty"
              textName="companyName"
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
                      defaultChecked={selectedResultGroupIds.includes(
                        option.id
                      )}
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
      </details>

      <SampleGridTableSection page={page} />
      <SampleResultViewer />

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

function getActiveSampleFilterCount(page: SampleGridPage) {
  const { filters, search } = page.query;
  let count = 0;

  if (search?.trim()) count += 1;
  if (filters.receivedFrom) count += 1;
  if (filters.receivedTo) count += 1;
  if (filters.sampleTypeId) count += 1;
  if (filters.customerId || filters.customerName?.trim()) count += 1;
  if (filters.companyId || filters.companyName?.trim()) count += 1;
  if (filters.resultGroupIds && filters.resultGroupIds.length > 0) count += 1;

  return count;
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

  appendFilterParams(params, page);

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

  appendFilterParams(params, page, removedGroupId);
  params.set("page", "1");
  params.set("pageSize", String(page.query.pageSize));
  for (const key of page.selectedResultColumnKeys) {
    params.append("resultColumns", key);
  }

  return `/dashboard/samples?${params.toString()}`;
}

function appendFilterParams(
  params: URLSearchParams,
  page: SampleGridPage,
  removedGroupId?: string
) {
  if (page.query.search) params.set("search", page.query.search);
  appendOptionalParam(params, "receivedFrom", page.query.filters.receivedFrom);
  appendOptionalParam(params, "receivedTo", page.query.filters.receivedTo);
  appendOptionalParam(params, "sampleTypeId", page.query.filters.sampleTypeId);
  appendOptionalParam(params, "customerId", page.query.filters.customerId);
  appendOptionalParam(params, "customerName", page.query.filters.customerName);
  appendOptionalParam(params, "companyId", page.query.filters.companyId);
  appendOptionalParam(params, "companyName", page.query.filters.companyName);
  for (const groupId of page.query.filters.resultGroupIds ?? []) {
    if (groupId !== removedGroupId) {
      params.append("resultGroupIds", groupId);
    }
  }
}

function appendOptionalParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined
) {
  if (value) {
    params.set(key, value);
  }
}
