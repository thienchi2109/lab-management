import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Ô dữ liệu có metadata responsive cho shared dashboard table. */
export type DashboardDataTableCell = {
  columnKey?: string;
  header: string;
  content: ReactNode;
  primary?: boolean;
  desktopClassName?: string;
  mobileClassName?: string;
};

/** Dòng dữ liệu chung cho bảng dashboard và mobile card fallback. */
export type DashboardDataTableRow = {
  id: string;
  cells: DashboardDataTableCell[];
  actions?: ReactNode;
};

type DashboardDataTableProps = {
  caption: string;
  emptyTitle: string;
  emptyDescription: string;
  hiddenColumnKeys?: readonly string[];
  rows: DashboardDataTableRow[];
};

const emptyHiddenColumnKeys: readonly string[] = [];

/** Render bảng dashboard với desktop table và mobile card từ cùng dữ liệu. */
export function DashboardDataTable({
  caption,
  emptyTitle,
  emptyDescription,
  hiddenColumnKeys = emptyHiddenColumnKeys,
  rows,
}: DashboardDataTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-background p-8 text-center">
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  const hiddenColumnKeySet = new Set(hiddenColumnKeys);
  const visibleRows = rows.map((row) => ({
    ...row,
    cells: row.cells.filter((cell) =>
      isColumnVisible(cell, hiddenColumnKeySet)
    ),
  }));
  const headerCells = visibleRows[0]?.cells ?? [];

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              {headerCells.map((cell) => (
                <th
                  key={cell.columnKey ?? cell.header}
                  className={cn("px-4 py-3 font-medium", cell.desktopClassName)}
                  data-sample-column-key={cell.columnKey}
                >
                  {cell.header}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visibleRows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30">
                {row.cells.map((cell) => (
                  <td
                    key={cell.columnKey ?? cell.header}
                    className={cn(
                      cell.primary
                        ? "px-4 py-3 font-medium"
                        : "px-4 py-3 text-muted-foreground",
                      cell.desktopClassName
                    )}
                    data-sample-column-key={cell.columnKey}
                  >
                    {cell.content}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">{row.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y md:hidden">
        {visibleRows.map((row) => (
          <div key={row.id} className="space-y-3 p-4">
            {row.cells.map((cell) => (
              <div
                key={cell.columnKey ?? cell.header}
                className={cn(
                  "flex justify-between gap-4",
                  cell.mobileClassName
                )}
                data-sample-column-key={cell.columnKey}
              >
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {cell.header}
                </span>
                <span
                  className={
                    cell.primary
                      ? "text-right text-sm font-medium"
                      : "text-right text-sm text-muted-foreground"
                  }
                >
                  {cell.content}
                </span>
              </div>
            ))}
            {row.actions ? <div className="pt-1">{row.actions}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function isColumnVisible(
  cell: DashboardDataTableCell,
  hiddenColumnKeys: Set<string>
) {
  return !cell.columnKey || !hiddenColumnKeys.has(cell.columnKey);
}
