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
  mobileContent?: ReactNode;
  mobileHeader?: string;
};

/** Dòng dữ liệu chung cho bảng dashboard và mobile card fallback. */
export type DashboardDataTableRow = {
  id: string;
  cells: DashboardDataTableCell[];
  actions?: ReactNode;
  mobileCard?: ReactNode;
  mobilePrimaryAction?: ReactNode;
  rowTone?: "default" | "highlight";
};

type DashboardDataTableProps = {
  caption: string;
  density?: "comfortable" | "compact";
  emptyAction?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  hiddenColumnKeys?: readonly string[];
  mobileHiddenColumnKeys?: readonly string[];
  mobileRowLimit?: number;
  rows: DashboardDataTableRow[];
  tone?: "default" | "workspace";
};

const emptyHiddenColumnKeys: readonly string[] = [];

/** Render bảng dashboard với desktop table và mobile card từ cùng dữ liệu. */
export function DashboardDataTable({
  caption,
  density = "comfortable",
  emptyAction,
  emptyTitle,
  emptyDescription,
  hiddenColumnKeys = emptyHiddenColumnKeys,
  mobileHiddenColumnKeys = emptyHiddenColumnKeys,
  mobileRowLimit,
  rows,
  tone = "default",
}: DashboardDataTableProps) {
  const tableStyles = getTableStyles(density, tone);

  if (rows.length === 0) {
    return (
      <div className={tableStyles.empty}>
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
      </div>
    );
  }

  const hiddenColumnKeySet = new Set(hiddenColumnKeys);
  const mobileHiddenColumnKeySet = new Set(mobileHiddenColumnKeys);
  const visibleRows = rows.map((row) => ({
    ...row,
    cells: row.cells.filter((cell) =>
      isColumnVisible(cell, hiddenColumnKeySet)
    ),
  }));
  const mobileSourceRows =
    typeof mobileRowLimit === "number"
      ? visibleRows.slice(0, mobileRowLimit)
      : visibleRows;
  const mobileRows = mobileSourceRows.map((row) => ({
    ...row,
    cells: row.cells.filter((cell) =>
      isColumnVisible(cell, mobileHiddenColumnKeySet)
    ),
  }));
  const headerCells = visibleRows[0]?.cells ?? [];
  const hasActions = visibleRows.some((row) => row.actions);

  return (
    <div className={tableStyles.frame}>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className={tableStyles.head}>
            <tr>
              {headerCells.map((cell) => (
                <th
                  key={cell.columnKey ?? cell.header}
                  className={cn(tableStyles.headerCell, cell.desktopClassName)}
                  data-sample-column-key={cell.columnKey}
                >
                  {cell.header}
                </th>
              ))}
              {hasActions ? (
                <th className={cn(tableStyles.headerCell, "text-right")}>
                  Tác vụ
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visibleRows.map((row) => (
              <tr key={row.id} className={tableStyles.row(row.rowTone)}>
                {row.cells.map((cell) => (
                  <td
                    key={cell.columnKey ?? cell.header}
                    className={cn(
                      cell.primary
                        ? tableStyles.primaryCell
                        : tableStyles.secondaryCell,
                      cell.desktopClassName
                    )}
                    data-sample-column-key={cell.columnKey}
                  >
                    {cell.content}
                  </td>
                ))}
                {hasActions ? (
                  <td className={cn(tableStyles.actionCell, "text-right")}>
                    {row.actions}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y md:hidden">
        {mobileRows.map((row) => (
          <div key={row.id} className={tableStyles.mobileRow(row.rowTone)}>
            {row.mobileCard ?? (
              <>
                {row.cells.map((cell) => (
                  <div
                    key={cell.columnKey ?? cell.header}
                    className={cn(
                      "grid grid-cols-[minmax(4.75rem,auto)_minmax(0,1fr)] items-start gap-3",
                      cell.mobileClassName
                    )}
                    data-mobile-card-column-key={cell.columnKey}
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {cell.mobileHeader ?? cell.header}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 text-right text-sm",
                        cell.primary ? "font-medium" : "text-muted-foreground"
                      )}
                    >
                      {cell.mobileContent ?? cell.content}
                    </span>
                  </div>
                ))}
                {row.mobilePrimaryAction ? (
                  <div className="pt-1 [&_[data-slot=button]]:min-h-11 [&_[data-slot=button]]:w-full">
                    {row.mobilePrimaryAction}
                  </div>
                ) : row.actions ? (
                  <div className="pt-1 [&_[data-slot=button]]:min-h-11 [&_[data-slot=button]]:w-full">
                    {row.actions}
                  </div>
                ) : null}
              </>
            )}
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

function getTableStyles(
  density: NonNullable<DashboardDataTableProps["density"]>,
  tone: NonNullable<DashboardDataTableProps["tone"]>
) {
  const compact = density === "compact";
  const workspace = tone === "workspace";

  return {
    actionCell: compact ? "px-4 py-2.5" : "px-4 py-3",
    empty: cn(
      "rounded-lg border border-dashed p-8 text-center",
      workspace ? "border-border/50 bg-card" : "bg-background"
    ),
    frame: cn(
      "overflow-hidden rounded-lg border",
      workspace ? "border-border/50 bg-card" : "bg-background"
    ),
    head: cn(
      "border-b text-xs uppercase text-muted-foreground",
      workspace ? "bg-muted/40" : "bg-muted/50"
    ),
    headerCell: cn(compact ? "px-4 py-2.5" : "px-4 py-3", "font-medium"),
    mobileRow: (rowTone?: DashboardDataTableRow["rowTone"]) =>
      cn(
        compact ? "space-y-2 px-3 py-2.5" : "space-y-3 p-4",
        workspace && "bg-card",
        rowTone === "highlight" && "border-l-2 border-l-primary"
      ),
    primaryCell: cn(compact ? "px-4 py-2.5" : "px-4 py-3", "font-medium"),
    row: (rowTone?: DashboardDataTableRow["rowTone"]) =>
      cn(
        workspace ? "hover:bg-primary/5" : "hover:bg-muted/30",
        rowTone === "highlight" && "border-l-2 border-l-primary"
      ),
    secondaryCell: cn(
      compact ? "px-4 py-2.5" : "px-4 py-3",
      "text-muted-foreground"
    ),
  };
}
