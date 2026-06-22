import type { KitInventory } from "@/lib/kit-inventory/inventory";

/** Hiển thị các chỉ số tổng quan hiện có của kho KIT. */
export function KitInventorySummaryStrip({
  inventory,
}: {
  inventory: KitInventory;
}) {
  const items = [
    ["Tổng KIT", inventory.summary.totalKits],
    ["Còn tồn", inventory.summary.inStockKits],
    ["Gần hết hạn", inventory.summary.nearExpiryKits],
    ["Loại sắp thiếu", inventory.summary.lowStockTypes],
  ];

  return (
    <div className="grid overflow-hidden rounded-lg border bg-muted/20 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="border-b p-4 sm:border-r lg:border-b-0">
          <div className="text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
