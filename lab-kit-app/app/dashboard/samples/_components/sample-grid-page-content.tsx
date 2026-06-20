import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleExportControls } from "./sample-export-controls";
import { SampleGridFilterForm } from "./sample-grid-filter-form";
import { appendSampleGridFilterParams } from "./sample-grid-filter-params";
import { SampleGridMobileFilterSheet } from "./sample-grid-mobile-filter-sheet";
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

      <SampleGridMobileFilterSheet
        activeFilterCount={activeFilterCount}
        page={page}
      />

      <details
        className="hidden rounded-lg border bg-background md:block"
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
        <SampleGridFilterForm
          idPrefix="sample-grid"
          page={page}
          variant="inline"
        />
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

  appendSampleGridFilterParams(params, page);

  params.set("page", String(nextPage));
  params.set("pageSize", String(page.query.pageSize));
  for (const key of page.selectedResultColumnKeys) {
    params.append("resultColumns", key);
  }

  return `/dashboard/samples?${params.toString()}`;
}
