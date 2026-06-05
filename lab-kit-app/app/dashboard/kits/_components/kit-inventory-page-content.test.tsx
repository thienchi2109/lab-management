import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { KitInventoryClient } from "./kit-inventory-client";

const action = async () => ({ status: "idle" as const, message: "" });

describe("KitInventoryClient", () => {
  test("renders kit inventory summary, filters, and shared data table content", () => {
    const html = renderToStaticMarkup(
      <KitInventoryClient
        inventory={{
          summary: {
            totalKits: 2,
            inStockKits: 1,
            nearExpiryKits: 1,
            lowStockTypes: 1,
          },
          kitTypes: [
            {
              id: "type-1",
              code: "PCR_RT",
              name: "PCR Realtime",
              manufacturer: "BioLab",
              isActive: true,
            },
          ],
          batches: [
            {
              id: "batch-1",
              kitTypeId: "type-1",
              kitTypeName: "PCR Realtime",
              lotNumber: "LOT-01",
              receivedQuantity: 2,
              remainingQuantity: 1,
              expiresOn: "2026-12-31",
              receivedAt: "2026-06-05",
            },
          ],
          kits: [
            {
              id: "kit-1",
              kitCode: "KIT-001",
              status: "in_stock",
              batchId: "batch-1",
              lotNumber: "LOT-01",
              kitTypeName: "PCR Realtime",
              expiresOn: "2026-12-31",
              updatedAt: "2026-06-05T00:00:00.000Z",
            },
          ],
        }}
        actions={{
          createKitType: action,
          createKitBatch: action,
          createKitUnits: action,
          updateKitStatus: action,
        }}
      />
    );

    expect(html).toContain("Kho KIT");
    expect(html).toContain("PCR Realtime");
    expect(html).toContain("KIT-001");
    expect(html).toContain("Tạo lô KIT");
    expect(html).toContain("Thêm KIT");
  });
});
