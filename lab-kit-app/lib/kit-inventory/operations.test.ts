import { describe, expect, test } from "vitest";

import {
  createKitBatch,
  createKitUnits,
  updateKitStatus,
  type KitInventoryActor,
  type KitInventoryPort,
} from "./operations";

const actor: KitInventoryActor = {
  profileId: "profile-1",
  organizationId: "org-1",
};

function createPort(): KitInventoryPort & {
  audits: unknown[];
  insertedKits: unknown[];
} {
  const audits: unknown[] = [];
  const insertedKits: unknown[] = [];

  return {
    audits,
    insertedKits,
    async createKitType() {
      return { kitTypeId: "kit-type-1" };
    },
    async updateKitType() {},
    async createBatch() {
      return { batchId: "batch-1" };
    },
    async updateBatch() {},
    async createKitUnits(input) {
      insertedKits.push(input);
      return { kitIds: ["kit-1", "kit-2"] };
    },
    async updateKitStatus() {},
    async insertAuditEvent(input) {
      audits.push(input);
    },
  };
}

describe("kit inventory operations", () => {
  test("does not keep unused update operation helpers before an update UI exists", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./operations.ts", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).not.toContain("export async function updateKitType");
    expect(source).not.toContain("export async function updateKitBatch");
    expect(source).not.toContain("function updateKitType");
    expect(source).not.toContain("function updateKitBatch");
  });

  test("creates a batch within the actor organization and audits the write", async () => {
    const port = createPort();

    const result = await createKitBatch(
      {
        kitTypeId: "kit-type-1",
        lotNumber: "LOT-01",
        receivedQuantity: 20,
        remainingQuantity: 20,
        expiresOn: "2026-12-31",
        receivedAt: "2026-06-05",
      },
      actor,
      port
    );

    expect(result).toEqual({ batchId: "batch-1" });
    expect(port.audits).toContainEqual(
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "profile-1",
        action: "kit_batch.created",
        entityTable: "kit_batches",
        entityId: "batch-1",
      })
    );
  });

  test("creates unique kit units and audits the generated kit ids", async () => {
    const port = createPort();

    await createKitUnits(
      {
        batchId: "batch-1",
        kitCodes: ["KIT-001", "KIT-002"],
      },
      actor,
      port
    );

    expect(port.insertedKits).toContainEqual({
      organizationId: "org-1",
      batchId: "batch-1",
      kitCodes: ["KIT-001", "KIT-002"],
    });
    expect(port.audits).toContainEqual(
      expect.objectContaining({
        action: "kit_units.created",
        entityTable: "kits",
        entityId: "kit-1",
        eventPayload: {
          batchId: "batch-1",
          kitCodes: ["KIT-001", "KIT-002"],
          kitIds: ["kit-1", "kit-2"],
        },
      })
    );
  });

  test("requires a reason when moving a kit to a terminal inventory status", async () => {
    const port = createPort();

    await updateKitStatus(
      {
        kitId: "kit-1",
        status: "lost",
        reason: "Không tìm thấy sau kiểm kê",
      },
      actor,
      port
    );

    expect(port.audits).toContainEqual(
      expect.objectContaining({
        action: "kit_status.updated",
        entityTable: "kits",
        entityId: "kit-1",
        eventPayload: {
          status: "lost",
          reason: "Không tìm thấy sau kiểm kê",
        },
      })
    );
  });
});
