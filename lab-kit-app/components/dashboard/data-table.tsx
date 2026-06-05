import type { ReactNode } from "react";

export type DashboardDataTableCell = {
  header: string;
  content: ReactNode;
  primary?: boolean;
};

export type DashboardDataTableRow = {
  id: string;
  cells: DashboardDataTableCell[];
  actions?: ReactNode;
};

type DashboardDataTableProps = {
  caption: string;
  emptyTitle: string;
  emptyDescription: string;
  rows: DashboardDataTableRow[];
};

export function DashboardDataTable({
  caption,
  emptyTitle,
  emptyDescription,
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

  const headers = rows[0]?.cells.map((cell) => cell.header) ?? [];

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30">
                {row.cells.map((cell) => (
                  <td
                    key={cell.header}
                    className={
                      cell.primary
                        ? "px-4 py-3 font-medium"
                        : "px-4 py-3 text-muted-foreground"
                    }
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
        {rows.map((row) => (
          <div key={row.id} className="space-y-3 p-4">
            {row.cells.map((cell) => (
              <div key={cell.header} className="flex justify-between gap-4">
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
