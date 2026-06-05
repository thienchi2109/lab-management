import type { KitStatus } from "./schemas";

export type KitType = {
  id: string;
  code: string;
  name: string;
  manufacturer: string | null;
  isActive: boolean;
};

export type KitBatch = {
  id: string;
  kitTypeId: string;
  kitTypeName: string;
  lotNumber: string;
  receivedQuantity: number;
  remainingQuantity: number;
  expiresOn: string | null;
  receivedAt: string;
};

export type KitUnit = {
  id: string;
  kitCode: string;
  status: KitStatus;
  batchId: string;
  lotNumber: string;
  kitTypeName: string;
  expiresOn: string | null;
  updatedAt: string;
};

export type KitInventorySummary = {
  totalKits: number;
  inStockKits: number;
  nearExpiryKits: number;
  lowStockTypes: number;
};

export type KitInventory = {
  summary: KitInventorySummary;
  kitTypes: KitType[];
  batches: KitBatch[];
  kits: KitUnit[];
};

type KitTypeRow = {
  id: string;
  code: string;
  name: string;
  manufacturer: string | null;
  is_active: boolean;
};

type KitBatchRow = {
  id: string;
  kit_type_id: string;
  lot_number: string;
  received_quantity: number;
  remaining_quantity: number;
  expires_on: string | null;
  received_at: string;
};

type KitRow = {
  id: string;
  kit_batch_id: string;
  kit_code: string;
  status: KitStatus;
  updated_at: string;
};

export function mapKitInventoryRows(input: {
  kitTypes: KitTypeRow[];
  batches: KitBatchRow[];
  kits: KitRow[];
}): KitInventory {
  const kitTypes = input.kitTypes.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    manufacturer: row.manufacturer,
    isActive: row.is_active,
  }));
  const typeById = new Map(kitTypes.map((type) => [type.id, type]));
  const batches = input.batches.map((row) => {
    const kitType = typeById.get(row.kit_type_id);

    return {
      id: row.id,
      kitTypeId: row.kit_type_id,
      kitTypeName: kitType?.name ?? "Không rõ loại KIT",
      lotNumber: row.lot_number,
      receivedQuantity: row.received_quantity,
      remainingQuantity: row.remaining_quantity,
      expiresOn: row.expires_on,
      receivedAt: row.received_at,
    };
  });
  const batchById = new Map(batches.map((batch) => [batch.id, batch]));
  const kits = input.kits.map((row) => {
    const batch = batchById.get(row.kit_batch_id);

    return {
      id: row.id,
      kitCode: row.kit_code,
      status: row.status,
      batchId: row.kit_batch_id,
      lotNumber: batch?.lotNumber ?? "Không rõ lô",
      kitTypeName: batch?.kitTypeName ?? "Không rõ loại KIT",
      expiresOn: batch?.expiresOn ?? null,
      updatedAt: row.updated_at,
    };
  });

  return {
    summary: summarizeInventory(kits, batches),
    kitTypes,
    batches,
    kits,
  };
}

export function summarizeInventory(
  kits: KitUnit[],
  batches: KitBatch[]
): KitInventorySummary {
  const nearExpiryBatchIds = new Set(
    batches
      .filter((batch) => batch.expiresOn && daysUntil(batch.expiresOn) <= 30)
      .map((batch) => batch.id)
  );
  const lowStockTypes = new Set(
    batches
      .filter((batch) => batch.remainingQuantity <= 5)
      .map((batch) => batch.kitTypeId)
  );

  return {
    totalKits: kits.length,
    inStockKits: kits.filter((kit) => kit.status === "in_stock").length,
    nearExpiryKits: kits.filter((kit) => nearExpiryBatchIds.has(kit.batchId))
      .length,
    lowStockTypes: lowStockTypes.size,
  };
}

function daysUntil(date: string) {
  const value = Date.parse(`${date}T00:00:00.000Z`);
  return Math.ceil((value - Date.now()) / 86_400_000);
}
