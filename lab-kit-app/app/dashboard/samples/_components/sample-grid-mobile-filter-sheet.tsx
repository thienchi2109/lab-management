"use client";

import { useId } from "react";
import Link from "next/link";

import { DashboardMobileFilterSheet } from "@/components/dashboard/mobile-filter-sheet";
import { Button } from "@/components/ui/button";
import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleGridFilterForm } from "./sample-grid-filter-form";

type SampleGridMobileFilterSheetProps = {
  activeFilterCount: number;
  page: SampleGridPage;
};

/** Render toolbar tìm kiếm/lọc mobile và bottom sheet lọc mẫu. */
export function SampleGridMobileFilterSheet({
  activeFilterCount,
  page,
}: SampleGridMobileFilterSheetProps) {
  const formId = useId();
  const searchLabel = page.query.search?.trim() || "Tìm mã mẫu, khách hàng";

  return (
    <DashboardMobileFilterSheet
      activeFilterCount={activeFilterCount}
      dataAttributes={{ "data-mobile-sample-filter-toolbar": "true" }}
      searchLabel={searchLabel}
      title="Tìm kiếm và lọc"
      triggerAriaLabel="Tìm kiếm và lọc mẫu"
      renderFooter={() => (
        <div className="flex items-center justify-between gap-2">
          <Button asChild type="button" variant="outline">
            <Link href="/dashboard/samples">Xóa lọc</Link>
          </Button>
          <Button form={formId} type="submit">
            Áp dụng
          </Button>
        </div>
      )}
    >
      <SampleGridFilterForm
        formId={formId}
        idPrefix="sample-grid-mobile"
        page={page}
        showSubmit={false}
        variant="sheet"
      />
    </DashboardMobileFilterSheet>
  );
}
