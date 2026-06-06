import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { mapKitInventoryRows } from "./inventory";

describe("kit inventory mapping", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-06T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("summarizes total, in-stock, near-expiry, and low-stock inventory", () => {
    const inventory = mapKitInventoryRows({
      kitTypes: [
        {
          id: "type-1",
          code: "PCR",
          name: "PCR Realtime",
          manufacturer: null,
          is_active: true,
        },
        {
          id: "type-2",
          code: "AG",
          name: "Kháng nguyên",
          manufacturer: null,
          is_active: true,
        },
      ],
      batches: [
        {
          id: "batch-1",
          kit_type_id: "type-1",
          lot_number: "LOT-NEAR",
          received_quantity: 10,
          remaining_quantity: 5,
          expires_on: "2026-06-20",
          received_at: "2026-06-01",
        },
        {
          id: "batch-2",
          kit_type_id: "type-2",
          lot_number: "LOT-FAR",
          received_quantity: 10,
          remaining_quantity: 8,
          expires_on: "2026-12-31",
          received_at: "2026-06-01",
        },
      ],
      kits: [
        {
          id: "kit-1",
          kit_batch_id: "batch-1",
          kit_code: "KIT-001",
          status: "in_stock",
          updated_at: "2026-06-06T00:00:00.000Z",
        },
        {
          id: "kit-2",
          kit_batch_id: "batch-1",
          kit_code: "KIT-002",
          status: "assigned",
          updated_at: "2026-06-06T00:00:00.000Z",
        },
        {
          id: "kit-3",
          kit_batch_id: "batch-2",
          kit_code: "KIT-003",
          status: "used",
          updated_at: "2026-06-06T00:00:00.000Z",
        },
      ],
    });

    expect(inventory.summary).toEqual({
      totalKits: 3,
      inStockKits: 1,
      nearExpiryKits: 2,
      lowStockTypes: 1,
    });
  });

  test("keeps the summary helper internal to the mapper module", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./inventory.ts", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).not.toContain("export function summarizeInventory");
    expect(source).toContain("function summarizeInventory");
  });
});
