import type { KitInventory } from "@/lib/kit-inventory/inventory";
import type { SampleCostSummary } from "@/lib/sample-metadata/sample-cost-summary";

import {
  createKitBatchAction,
  createKitTypeAction,
  createKitUnitsAction,
  updateKitStatusAction,
} from "../actions";
import { KitInventoryClient } from "./kit-inventory-client";

type KitInventoryPageContentProps = {
  inventory: KitInventory;
  sampleCostSummary: SampleCostSummary;
};

export function KitInventoryPageContent({
  inventory,
  sampleCostSummary,
}: KitInventoryPageContentProps) {
  return (
    <KitInventoryClient
      inventory={inventory}
      sampleCostSummary={sampleCostSummary}
      actions={{
        createKitType: createKitTypeAction,
        createKitBatch: createKitBatchAction,
        createKitUnits: createKitUnitsAction,
        updateKitStatus: updateKitStatusAction,
      }}
    />
  );
}
