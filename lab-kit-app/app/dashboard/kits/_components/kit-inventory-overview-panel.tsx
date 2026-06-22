import type { KitInventory } from "@/lib/kit-inventory/inventory";

import { KitInventorySummaryStrip } from "./kit-inventory-summary-strip";
import { KitStockByTypeChart } from "./kit-stock-by-type-chart";

type KitInventoryOverviewPanelProps = {
  inventory: KitInventory;
};

/** Nhấn mạnh trạng thái tồn kho KIT chính trước các thao tác quản trị. */
export function KitInventoryOverviewPanel({
  inventory,
}: KitInventoryOverviewPanelProps) {
  return (
    <section
      data-kit-inventory-overview="true"
      className="order-1 rounded-xl border border-primary/15 bg-card p-4 shadow-[0_18px_45px_-38px_rgb(22_102_59/0.45)] md:p-5"
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Số lượng kit tồn kho
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tổng hợp theo loại KIT từ số KIT đang còn tồn.
          </p>
        </div>
        <div className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
          {inventory.summary.inStockKits} KIT còn tồn
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.9fr)] lg:items-stretch">
        <KitStockByTypeChart inventory={inventory} />
        <KitInventorySummaryStrip inventory={inventory} />
      </div>
    </section>
  );
}
