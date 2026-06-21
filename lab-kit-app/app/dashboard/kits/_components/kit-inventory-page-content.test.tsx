import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { mapKitInventoryRows } from "@/lib/kit-inventory/inventory";

import { KitInventoryClient } from "./kit-inventory-client";
import { CreateBatchDialog } from "./kit-inventory-dialogs";

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

  test("renders the customer-requested three sections in order", () => {
    const html = renderToStaticMarkup(
      <KitInventoryClient
        inventory={{
          summary: {
            totalKits: 0,
            inStockKits: 0,
            nearExpiryKits: 0,
            lowStockTypes: 0,
          },
          kitTypes: [],
          batches: [],
          kits: [],
        }}
        actions={{
          createKitType: action,
          createKitBatch: action,
          createKitUnits: action,
          updateKitStatus: action,
        }}
      />
    );

    const stockSectionIndex = html.indexOf("Số lượng kit tồn kho");
    const costSectionIndex = html.indexOf("Chi phí hiện tại");
    const actionsSectionIndex = html.indexOf(
      "Tạo loại KIT, lô KIT và thêm KIT"
    );

    expect(stockSectionIndex).toBeGreaterThan(-1);
    expect(costSectionIndex).toBeGreaterThan(stockSectionIndex);
    expect(actionsSectionIndex).toBeGreaterThan(costSectionIndex);
    expect(html).toContain("Tạo loại KIT");
    expect(html).toContain("Tạo lô KIT");
    expect(html).toContain("Thêm KIT");
  });

  test("renders stock by kit type from mapped in-stock kit counts", () => {
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
          lot_number: "LOT-PCR-A",
          received_quantity: 10,
          remaining_quantity: 10,
          expires_on: "2026-12-31",
          received_at: "2026-06-01",
        },
        {
          id: "batch-2",
          kit_type_id: "type-1",
          lot_number: "LOT-PCR-B",
          received_quantity: 10,
          remaining_quantity: 10,
          expires_on: "2026-12-31",
          received_at: "2026-06-02",
        },
        {
          id: "batch-3",
          kit_type_id: "type-2",
          lot_number: "LOT-AG",
          received_quantity: 5,
          remaining_quantity: 5,
          expires_on: "2026-12-31",
          received_at: "2026-06-03",
        },
      ],
      kits: [
        {
          id: "kit-1",
          kit_batch_id: "batch-1",
          kit_code: "KIT-PCR-001",
          status: "in_stock",
          updated_at: "2026-06-05T00:00:00.000Z",
        },
        {
          id: "kit-2",
          kit_batch_id: "batch-1",
          kit_code: "KIT-PCR-002",
          status: "used",
          updated_at: "2026-06-05T00:00:00.000Z",
        },
        {
          id: "kit-3",
          kit_batch_id: "batch-2",
          kit_code: "KIT-PCR-003",
          status: "in_stock",
          updated_at: "2026-06-05T00:00:00.000Z",
        },
        {
          id: "kit-4",
          kit_batch_id: "batch-3",
          kit_code: "KIT-AG-001",
          status: "in_stock",
          updated_at: "2026-06-05T00:00:00.000Z",
        },
      ],
    });
    const html = renderToStaticMarkup(
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

    expect(html).toContain('aria-label="Biểu đồ tồn kho KIT theo loại"');
    expect(html).toContain("PCR Realtime");
    expect(html).toContain("2 KIT còn tồn");
    expect(html).toContain("Kháng nguyên");
    expect(html).toContain("1 KIT còn tồn");
    expect(html).not.toContain("20 KIT còn tồn");
  });

  test("associates the search label with its input", () => {
    const html = renderToStaticMarkup(
      <KitInventoryClient
        inventory={{
          summary: {
            totalKits: 0,
            inStockKits: 0,
            nearExpiryKits: 0,
            lowStockTypes: 0,
          },
          kitTypes: [],
          batches: [],
          kits: [],
        }}
        actions={{
          createKitType: action,
          createKitBatch: action,
          createKitUnits: action,
          updateKitStatus: action,
        }}
      />
    );

    expect(html).toContain('for="kit-inventory-search"');
    expect(html).toContain('id="kit-inventory-search"');
  });

  test("keeps kit search and dropdown filters aligned on desktop", () => {
    const html = renderToStaticMarkup(
      <KitInventoryClient
        inventory={{
          summary: {
            totalKits: 0,
            inStockKits: 0,
            nearExpiryKits: 0,
            lowStockTypes: 0,
          },
          kitTypes: [],
          batches: [],
          kits: [],
        }}
        actions={{
          createKitType: action,
          createKitBatch: action,
          createKitUnits: action,
          updateKitStatus: action,
        }}
      />
    );

    expect(html).toContain("items-end");
    expect(html).toContain(
      "lg:grid-cols-[minmax(280px,1fr)_180px_minmax(220px,260px)]"
    );
  });

  test("uses the client-provided received date when rendering the batch dialog", () => {
    const html = renderToStaticMarkup(
      <CreateBatchDialog
        open
        kitTypes={[
          {
            id: "type-1",
            code: "PCR_RT",
            name: "PCR Realtime",
            manufacturer: "BioLab",
            isActive: true,
          },
        ]}
        defaultReceivedAt="2030-01-02"
        formAction={action}
        onClose={() => {}}
      />
    );

    expect(html).toContain('value="2030-01-02"');
  });

  test("does not calculate the default received date in the server page", async () => {
    const [pageSource, pageContentSource] = await Promise.all([
      import("node:fs/promises").then((fs) =>
        fs.readFile(new URL("../page.tsx", import.meta.url), {
          encoding: "utf8",
        })
      ),
      import("node:fs/promises").then((fs) =>
        fs.readFile(
          new URL("./kit-inventory-page-content.tsx", import.meta.url),
          {
            encoding: "utf8",
          }
        )
      ),
    ]);

    expect(pageSource).not.toContain("new Date()");
    expect(pageSource).not.toContain("getTodayDateInputValue");
    expect(pageContentSource).not.toContain("defaultReceivedAt");
  });

  test("keeps time calculation outside KitInventoryClient JSX", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./kit-inventory-client.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).not.toContain(
      "receivedAt: getLocalDateInputValue(new Date())"
    );
    expect(source).toContain("todayDateInputValueRef.current");
  });

  test("keeps dialog action state outside the component module", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./kit-inventory-dialogs.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).not.toContain("export const initialDialogState");
    expect(source).not.toContain("export type KitInventoryDialogActionState");
  });
});
