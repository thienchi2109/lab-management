import type { KitInventory } from "@/lib/kit-inventory/inventory";

type KitStockByTypeChartProps = {
  inventory: KitInventory;
};

type KitStockRow = {
  kitTypeId: string;
  kitTypeName: string;
  quantity: number;
};

/** Hiển thị biểu đồ cột ngang tồn kho KIT theo loại KIT. */
export function KitStockByTypeChart({ inventory }: KitStockByTypeChartProps) {
  const rows = getStockRowsByType(inventory);
  const maxQuantity = Math.max(...rows.map((row) => row.quantity), 0);
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);

  if (inventory.kitTypes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
        Chưa có loại KIT để hiển thị tồn kho.
      </div>
    );
  }

  if (totalQuantity === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
        Chưa có KIT còn tồn kho theo loại.
      </div>
    );
  }

  return (
    <div
      aria-label="Biểu đồ tồn kho KIT theo loại"
      className="flex h-full flex-col justify-center gap-3 rounded-lg border bg-background/60 p-3"
    >
      {rows.map((row) => (
        <div
          key={row.kitTypeId}
          className="grid gap-2 md:grid-cols-[minmax(10rem,14rem)_1fr_auto] md:items-center"
        >
          <div className="min-w-0 text-sm font-medium">{row.kitTypeName}</div>
          <div className="h-3 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width:
                  row.quantity === 0
                    ? "0%"
                    : `${Math.max((row.quantity / maxQuantity) * 100, 8)}%`,
              }}
            />
          </div>
          <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {row.quantity} KIT còn tồn
          </div>
        </div>
      ))}
    </div>
  );
}

function getStockRowsByType(inventory: KitInventory): KitStockRow[] {
  const rowsByTypeId = new Map<string, KitStockRow>();

  for (const kitType of inventory.kitTypes) {
    rowsByTypeId.set(kitType.id, {
      kitTypeId: kitType.id,
      kitTypeName: kitType.name,
      quantity: 0,
    });
  }

  for (const batch of inventory.batches) {
    const row = rowsByTypeId.get(batch.kitTypeId) ?? {
      kitTypeId: batch.kitTypeId,
      kitTypeName: batch.kitTypeName,
      quantity: 0,
    };

    row.quantity += batch.remainingQuantity;
    rowsByTypeId.set(batch.kitTypeId, row);
  }

  return [...rowsByTypeId.values()];
}
