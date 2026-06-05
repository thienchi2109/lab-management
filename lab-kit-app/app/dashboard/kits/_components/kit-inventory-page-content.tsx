import type { KitInventory } from "@/lib/kit-inventory/inventory";

import {
  createKitBatchAction,
  createKitTypeAction,
  createKitUnitsAction,
  updateKitStatusAction,
} from "../actions";
import { KitInventoryClient } from "./kit-inventory-client";

type KitInventoryPageContentProps = {
  inventory: KitInventory;
};

export function KitInventoryPageContent({
  inventory,
}: KitInventoryPageContentProps) {
  return (
    <KitInventoryClient
      inventory={inventory}
      actions={{
        createKitType: createKitTypeAction,
        createKitBatch: createKitBatchAction,
        createKitUnits: createKitUnitsAction,
        updateKitStatus: updateKitStatusAction,
      }}
    />
  );
}
