import { describe, expect, test } from "vitest";

import {
  createSampleMetadata,
  updateSampleMetadata,
  type SampleMetadataActor,
  type SampleMetadataPort,
} from "./operations";

const actor: SampleMetadataActor = {
  profileId: "profile-1",
  organizationId: "org-1",
};

function createPort(
  overrides: Partial<SampleMetadataPort> = {}
): SampleMetadataPort & { audits: unknown[]; writes: unknown[] } {
  const audits: unknown[] = [];
  const writes: unknown[] = [];

  return {
    audits,
    writes,
    async sampleCodeExists() {
      return false;
    },
    async referencesBelongToOrganization() {
      return true;
    },
    async createSample(input) {
      writes.push(input);
      return { sampleId: "sample-1" };
    },
    async updateSample(input) {
      writes.push(input);
    },
    async insertAuditEvent(input) {
      audits.push(input);
    },
    ...overrides,
  };
}

const createInput = {
  sampleCode: "T6_00012",
  sampleTypeId: "type-1",
  customerId: "customer-1",
  companyId: "company-1",
  kitBatchId: null,
  customerName: "Nguyễn Văn A",
  collectedAt: null,
  receivedAt: "2026-06-06T08:30",
  status: "received" as const,
  billingStatus: "unpaid" as const,
  note: "Ưu tiên",
};

describe("sample metadata operations", () => {
  test("creates a tenant-scoped sample and writes safe audit evidence", async () => {
    const port = createPort();

    const result = await createSampleMetadata(createInput, actor, port);

    expect(result).toEqual({ sampleId: "sample-1" });
    expect(port.writes).toContainEqual(
      expect.objectContaining({
        organizationId: "org-1",
        createdBy: "profile-1",
        sampleCode: "T6_00012",
      })
    );
    expect(port.audits).toContainEqual(
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "profile-1",
        action: "sample.created",
        entityTable: "samples",
        entityId: "sample-1",
        eventPayload: {
          metadataPolicy: "field-names-only",
          sampleCode: "T6_00012",
          submittedFields: [
            "sampleCode",
            "sampleTypeId",
            "customerId",
            "companyId",
            "kitBatchId",
            "customerName",
            "collectedAt",
            "receivedAt",
            "status",
            "billingStatus",
            "note",
          ],
        },
      })
    );
    expect(JSON.stringify(port.audits)).not.toContain("Nguyễn Văn A");
    expect(JSON.stringify(port.audits)).not.toContain("Ưu tiên");
    expect(JSON.stringify(port.audits)).not.toContain("2026-06-06T08:30");
    expect(JSON.stringify(port.audits)).not.toContain("customer-1");
  });

  test("rejects duplicate sample codes before writing", async () => {
    const port = createPort({
      async sampleCodeExists() {
        return true;
      },
    });

    await expect(
      createSampleMetadata(createInput, actor, port)
    ).rejects.toThrow("Mã mẫu đã tồn tại.");
    expect(port.writes).toEqual([]);
    expect(port.audits).toEqual([]);
  });

  test("rejects references outside the actor organization", async () => {
    const port = createPort({
      async referencesBelongToOrganization() {
        return false;
      },
    });

    await expect(
      createSampleMetadata(createInput, actor, port)
    ).rejects.toThrow("Dữ liệu tham chiếu không thuộc tổ chức hiện tại.");
    expect(port.writes).toEqual([]);
  });

  test("starts independent save guards before waiting for either result", async () => {
    let resolveDuplicate!: (value: boolean) => void;
    let resolveReferences!: (value: boolean) => void;
    const calls: string[] = [];
    const duplicateDone = new Promise<boolean>((resolve) => {
      resolveDuplicate = resolve;
    });
    const referencesDone = new Promise<boolean>((resolve) => {
      resolveReferences = resolve;
    });
    const port = createPort({
      async sampleCodeExists() {
        calls.push("duplicate");
        return duplicateDone;
      },
      async referencesBelongToOrganization() {
        calls.push("references");
        return referencesDone;
      },
    });

    const result = createSampleMetadata(createInput, actor, port);
    await Promise.resolve();

    expect(calls).toEqual(["duplicate", "references"]);

    resolveDuplicate(false);
    resolveReferences(true);

    await expect(result).resolves.toEqual({ sampleId: "sample-1" });
  });

  test("updates only sample metadata and audits updated field names", async () => {
    const port = createPort();

    await updateSampleMetadata(
      { sampleId: "sample-1", ...createInput, status: "in_progress" },
      actor,
      port
    );

    expect(port.writes).toContainEqual(
      expect.objectContaining({
        sampleId: "sample-1",
        organizationId: "org-1",
        status: "in_progress",
      })
    );
    expect(port.audits).toContainEqual(
      expect.objectContaining({
        action: "sample.updated",
        entityTable: "samples",
        entityId: "sample-1",
        eventPayload: {
          metadataPolicy: "field-names-only",
          sampleCode: "T6_00012",
          updatedFields: [
            "sampleCode",
            "sampleTypeId",
            "customerId",
            "companyId",
            "kitBatchId",
            "customerName",
            "collectedAt",
            "receivedAt",
            "status",
            "billingStatus",
            "note",
          ],
        },
      })
    );
    expect(JSON.stringify(port.audits)).not.toContain("Nguyễn Văn A");
    expect(JSON.stringify(port.audits)).not.toContain("Ưu tiên");
    expect(JSON.stringify(port.audits)).not.toContain("2026-06-06T08:30");
    expect(JSON.stringify(port.audits)).not.toContain("customer-1");
  });
});
