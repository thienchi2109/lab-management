"use client";

import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BottomSheetFrame } from "@/components/ui/overlay-frame";

type DashboardMobileFilterFooterProps = {
  close: () => void;
};

type DashboardMobileFilterSheetProps<TFooterProps extends object> = {
  activeFilterCount: number;
  children: ReactNode;
  dataAttributes?: Record<`data-${string}`, string>;
  FooterComponent: ComponentType<
    TFooterProps & DashboardMobileFilterFooterProps
  >;
  footerProps: TFooterProps;
  searchLabel: string;
  title: string;
  triggerAriaLabel: string;
};

/** Render toolbar mobile và bottom sheet filter dùng chung cho dashboard. */
export function DashboardMobileFilterSheet<TFooterProps extends object>({
  activeFilterCount,
  children,
  dataAttributes,
  FooterComponent,
  footerProps,
  searchLabel,
  title,
  triggerAriaLabel,
}: DashboardMobileFilterSheetProps<TFooterProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <>
      <section
        className="flex items-center gap-2 md:hidden"
        data-mobile-filter-toolbar="true"
        {...dataAttributes}
      >
        <button
          type="button"
          aria-label={triggerAriaLabel}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border bg-card px-3 text-left text-sm text-foreground shadow-xs"
          onClick={open}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{searchLabel}</span>
        </button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0 gap-1.5 px-3"
          onClick={open}
        >
          <SlidersHorizontal className="size-4" />
          <span>
            Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </span>
        </Button>
      </section>
      {isOpen ? (
        <BottomSheetFrame
          title={title}
          closeLabel="Đóng"
          onClose={close}
          footer={<FooterComponent {...footerProps} close={close} />}
        >
          {children}
        </BottomSheetFrame>
      ) : null}
    </>
  );
}
