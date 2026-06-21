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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border bg-background p-4">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}
