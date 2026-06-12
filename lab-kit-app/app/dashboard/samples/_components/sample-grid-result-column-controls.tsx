"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SampleGridPage } from "@/lib/sample-grid/operations";

/** Render tùy chọn cột kết quả desktop từ URL state hiện tại. */
export function ResultColumnModeControls({ page }: { page: SampleGridPage }) {
  if (page.resultColumnOptions.length === 0) {
    return null;
  }

  return (
    <fieldset className="rounded-lg border bg-background p-4">
      <legend className="px-1 text-sm font-medium">Cột kết quả desktop</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {page.resultColumnOptions.map((option) => {
          const selected = page.selectedResultColumnKeys.includes(option.key);

          return (
            <Button
              key={option.key}
              asChild
              size="sm"
              variant={selected ? "default" : "outline"}
            >
              <Link href={buildResultColumnHref(page, option.key, selected)}>
                {option.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}

function buildResultColumnHref(
  page: SampleGridPage,
  key: string,
  selected: boolean
) {
  const params = new URLSearchParams();
  const nextKeys = selected
    ? page.selectedResultColumnKeys.filter((item) => item !== key)
    : [...page.selectedResultColumnKeys, key].slice(0, 3);

  if (page.query.search) params.set("search", page.query.search);
  if (page.query.filters.status) {
    params.set("status", page.query.filters.status);
  }
  if (page.query.filters.billingStatus) {
    params.set("billingStatus", page.query.filters.billingStatus);
  }
  params.set("sort", page.query.sort.key);
  params.set("dir", page.query.sort.direction);
  params.set("page", "1");
  params.set("pageSize", String(page.query.pageSize));
  for (const nextKey of nextKeys) params.append("resultColumns", nextKey);

  return `/dashboard/samples?${params.toString()}`;
}
