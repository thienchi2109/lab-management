import { getKitInventory } from "@/lib/kit-inventory/server";

import { KitInventoryPageContent } from "./_components/kit-inventory-page-content";

export default async function KitInventoryPage() {
  const inventory = await loadInventoryOrNull();

  if (inventory) {
    return <KitInventoryPageContent inventory={inventory} />;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
        Không có quyền truy cập
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Bạn chưa có quyền xem kho KIT
      </h1>
      <p className="text-sm text-muted-foreground">
        Tài khoản hiện tại không có quyền xem hoặc quản lý loại KIT, lô KIT và
        mã KIT trong kho.
      </p>
    </div>
  );
}

async function loadInventoryOrNull() {
  try {
    return await getKitInventory();
  } catch {
    return null;
  }
}
