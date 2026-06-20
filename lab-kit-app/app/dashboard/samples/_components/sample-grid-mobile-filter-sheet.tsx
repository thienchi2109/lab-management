"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BottomSheetFrame } from "@/components/ui/overlay-frame";
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
  const [isOpen, setIsOpen] = useState(false);
  const formId = useId();
  const searchLabel = page.query.search?.trim() || "Tìm mã mẫu, khách hàng";

  return (
    <>
      <section
        className="flex items-center gap-2 md:hidden"
        data-mobile-sample-filter-toolbar="true"
      >
        <button
          type="button"
          aria-label="Tìm kiếm và lọc mẫu"
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border bg-card px-3 text-left text-sm text-foreground shadow-xs"
          onClick={() => setIsOpen(true)}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{searchLabel}</span>
        </button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0 gap-1.5 px-3"
          onClick={() => setIsOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          <span>
            Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </span>
        </Button>
      </section>
      {isOpen ? (
        <BottomSheetFrame
          title="Tìm kiếm và lọc"
          closeLabel="Đóng"
          onClose={() => setIsOpen(false)}
          footer={
            <div className="flex items-center justify-between gap-2">
              <Button asChild type="button" variant="outline">
                <Link href="/dashboard/samples">Xóa lọc</Link>
              </Button>
              <Button form={formId} type="submit">
                Áp dụng
              </Button>
            </div>
          }
        >
          <SampleGridFilterForm
            formId={formId}
            idPrefix="sample-grid-mobile"
            page={page}
            showSubmit={false}
            variant="sheet"
          />
        </BottomSheetFrame>
      ) : null}
    </>
  );
}
