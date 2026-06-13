import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

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
