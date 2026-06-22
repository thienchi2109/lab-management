import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { KitInventory } from "@/lib/kit-inventory/inventory";

import { KitInventoryClient } from "./kit-inventory-client";

const action = async () => ({ status: "idle" as const, message: "" });

const emptyInventory: KitInventory = {
  summary: {
    totalKits: 0,
    inStockKits: 0,
    nearExpiryKits: 0,
    lowStockTypes: 0,
  },
  kitTypes: [],
  batches: [],
  kits: [],
};

function renderKitInventory(inventory: KitInventory) {
  return renderToStaticMarkup(
    <KitInventoryClient
      inventory={inventory}
      actions={{
        createKitType: action,
        createKitBatch: action,
        createKitUnits: action,
        updateKitStatus: action,
      }}
    />
  );
}

describe("KitInventoryClient polish", () => {
  test("renders inventory overview as the focal panel before the command band", () => {
    const html = renderKitInventory({
      summary: {
        totalKits: 1,
        inStockKits: 1,
        nearExpiryKits: 0,
        lowStockTypes: 1,
      },
      kitTypes: [
        {
          id: "type-1",
          code: "PCR",
          name: "PCR Demo Kit",
          manufacturer: null,
          isActive: true,
        },
      ],
      batches: [
        {
          id: "batch-1",
          kitTypeId: "type-1",
          kitTypeName: "PCR Demo Kit",
          lotNumber: "LOT-DEMO-001",
          receivedQuantity: 1,
          remainingQuantity: 1,
          expiresOn: "2027-06-04",
          receivedAt: "2026-06-04",
        },
      ],
      kits: [],
    });

    const overviewIndex = html.indexOf('data-kit-inventory-overview="true"');
    const commandBandIndex = html.indexOf(
      'data-kit-inventory-command-band="true"'
    );

    expect(overviewIndex).toBeGreaterThan(-1);
    expect(commandBandIndex).toBeGreaterThan(overviewIndex);
    expect(html).toContain("bg-card");
    expect(html).toContain("1 KIT còn tồn");
  });

  test("orders command band before cost summary on mobile while preserving desktop hierarchy", () => {
    const html = renderKitInventory(emptyInventory);

    expect(html).toContain("order-2 md:order-3");
    expect(html).toContain("order-3 md:order-2");
  });

  test("adds table scan affordance for kit code and expiry date", () => {
    const html = renderKitInventory({
      ...emptyInventory,
      summary: {
        totalKits: 1,
        inStockKits: 1,
        nearExpiryKits: 0,
        lowStockTypes: 0,
      },
      kits: [
        {
          id: "kit-1",
          kitCode: "US005-AGENT-001",
          status: "in_stock",
          batchId: "batch-1",
          lotNumber: "LOT-DEMO-001",
          kitTypeName: "PCR Demo Kit",
          expiresOn: "2027-06-04",
          updatedAt: "2026-06-05T00:00:00.000Z",
        },
      ],
    });

    expect(html).toContain("font-mono");
    expect(html).toContain("tabular-nums");
    expect(html).toContain("bg-card");
  });

  test("dims the global background mark only while the kit page is mounted", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./kit-inventory-client.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).toContain("--app-background-mark-opacity");
    expect(source).toContain(
      'setProperty(backgroundMarkOpacityProperty, "0.08")'
    );
    expect(source).toContain("previousBackgroundMarkOpacity");
  });
});
