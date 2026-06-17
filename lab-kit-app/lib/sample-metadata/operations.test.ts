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
    async referencesBelongToOrganization() {
      return true;
    },
    async createSample(input) {
      writes.push(input);
      return { sampleId: "sample-1", sampleCode: "HP-260615-7K3QM2XH" };
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
  resultGroupIds: ["group-1", "group-2"],
};

describe("sample metadata operations", () => {
  test("creates a tenant-scoped sample with generated code and writes safe audit evidence", async () => {
    const port = createPort();

    const result = await createSampleMetadata(createInput, actor, port);

    expect(result).toEqual({
      sampleId: "sample-1",
      sampleCode: "HP-260615-7K3QM2XH",
    });
    expect(port.writes).toContainEqual(
      expect.objectContaining({
        organizationId: "org-1",
        createdBy: "profile-1",
        auditEventPayload: {
          metadataPolicy: "field-names-only",
          submittedFields: [
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
            "resultGroupIds",
          ],
        },
      })
    );
    expect(port.writes).not.toContainEqual(
      expect.objectContaining({ sampleCode: expect.any(String) })
    );
    expect(port.audits).toEqual([]);
    expect(JSON.stringify(port.writes[0])).toContain("auditEventPayload");
    expect(JSON.stringify(port.writes[0])).not.toContain(
      '"auditEventPayload":{"metadataPolicy":"field-names-only","sampleCode"'
    );
    expect(
      JSON.stringify(
        (port.writes[0] as { auditEventPayload: unknown }).auditEventPayload
      )
    ).not.toContain("Nguyễn Văn A");
    expect(
      JSON.stringify(
        (port.writes[0] as { auditEventPayload: unknown }).auditEventPayload
      )
    ).not.toContain("Ưu tiên");
    expect(
      JSON.stringify(
        (port.writes[0] as { auditEventPayload: unknown }).auditEventPayload
      )
    ).not.toContain("customer-1");
  });

  test("does not preflight duplicate sample codes before database generation", async () => {
    const port = createPort();

    await expect(
      createSampleMetadata(createInput, actor, port)
    ).resolves.toEqual({
      sampleId: "sample-1",
      sampleCode: "HP-260615-7K3QM2XH",
    });
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
    expect(port.audits).toEqual([]);
  });

  test("validates result groups before creating the sample", async () => {
    const port = createPort({
      async referencesBelongToOrganization(input) {
        expect(input).toMatchObject({
          organizationId: "org-1",
          resultGroupIds: ["group-1", "group-2"],
        });
        return true;
      },
    });

    await createSampleMetadata(createInput, actor, port);

    expect(port.writes).toContainEqual(
      expect.objectContaining({ resultGroupIds: ["group-1", "group-2"] })
    );
  });

  test("validates references before creating the database-generated sample", async () => {
    let resolveReferences!: (value: boolean) => void;
    const calls: string[] = [];
    const referencesDone = new Promise<boolean>((resolve) => {
      resolveReferences = resolve;
    });
    const port = createPort({
      async referencesBelongToOrganization() {
        calls.push("references");
        return referencesDone;
      },
    });

    const result = createSampleMetadata(createInput, actor, port);
    await Promise.resolve();

    expect(calls).toEqual(["references"]);

    resolveReferences(true);

    await expect(result).resolves.toEqual({
      sampleId: "sample-1",
      sampleCode: "HP-260615-7K3QM2XH",
    });
  });

  test("updates sample metadata with audit payload in the same write command", async () => {
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
        updatedBy: "profile-1",
        auditEventPayload: {
          metadataPolicy: "field-names-only",
          updatedFields: [
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
            "resultGroupIds",
          ],
        },
      })
    );
    expect(port.audits).toEqual([]);
    const auditPayload = (port.writes[0] as { auditEventPayload: unknown })
      .auditEventPayload;
    expect(JSON.stringify(auditPayload)).not.toContain("Nguyễn Văn A");
    expect(JSON.stringify(auditPayload)).not.toContain("Ưu tiên");
    expect(JSON.stringify(auditPayload)).not.toContain("2026-06-06T08:30");
    expect(JSON.stringify(auditPayload)).not.toContain("customer-1");
  });
});
