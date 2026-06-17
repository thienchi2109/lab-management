import type { CreateSampleInput, UpdateSampleInput } from "./schemas";

/** Người thao tác metadata mẫu đã được xác thực và gắn tổ chức. */
export type SampleMetadataActor = {
  profileId: string;
  organizationId: string;
};

/** Payload audit an toàn cho thao tác tạo hoặc cập nhật metadata mẫu. */
export type SampleMetadataAuditInput = {
  organizationId: string;
  actorId: string;
  action: "sample.created" | "sample.updated";
  entityTable: "samples";
  entityId: string;
  eventPayload: Record<string, unknown>;
};

/** Cổng hạ tầng cần thiết để lưu metadata mẫu và audit theo tenant. */
export type SampleMetadataPort = {
  referencesBelongToOrganization(input: {
    organizationId: string;
    sampleTypeId: string;
    customerId: string | null;
    companyId: string | null;
    kitBatchId: string | null;
    resultGroupIds: string[];
  }): Promise<boolean>;
  createSample(
    input: CreateSampleInput & {
      organizationId: string;
      createdBy: string;
      auditEventPayload: Record<string, unknown>;
    }
  ): Promise<{ sampleId: string; sampleCode: string }>;
  updateSample(
    input: UpdateSampleInput & {
      organizationId: string;
      updatedBy: string;
      auditEventPayload: Record<string, unknown>;
    }
  ): Promise<void>;
  insertAuditEvent(input: SampleMetadataAuditInput): Promise<void>;
};

const submittedFields = [
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
];
const SAMPLE_METADATA_AUDIT_POLICY = "field-names-only";

/** Create sample metadata after reference ownership checks. */
export async function createSampleMetadata(
  input: CreateSampleInput,
  actor: SampleMetadataActor,
  port: SampleMetadataPort
) {
  await ensureSampleCanBeSaved(input, actor, port);
  const result = await port.createSample({
    ...input,
    organizationId: actor.organizationId,
    createdBy: actor.profileId,
    auditEventPayload: createSampleAuditPayload("submittedFields"),
  });

  return result;
}

/** Update editable sample metadata without touching result-entry tables. */
export async function updateSampleMetadata(
  input: UpdateSampleInput,
  actor: SampleMetadataActor,
  port: SampleMetadataPort
) {
  // react-doctor-disable-next-line react-doctor/async-parallel -- Phải xác thực trước khi cập nhật mẫu.
  await ensureSampleCanBeSaved(input, actor, port);
  await port.updateSample({
    ...input,
    organizationId: actor.organizationId,
    updatedBy: actor.profileId,
    auditEventPayload: createSampleAuditPayload("updatedFields"),
  });
}

async function ensureSampleCanBeSaved(
  input: CreateSampleInput,
  actor: SampleMetadataActor,
  port: SampleMetadataPort
) {
  const referencesOk = await port.referencesBelongToOrganization({
    organizationId: actor.organizationId,
    sampleTypeId: input.sampleTypeId,
    customerId: input.customerId,
    companyId: input.companyId,
    kitBatchId: input.kitBatchId,
    resultGroupIds: input.resultGroupIds,
  });

  if (!referencesOk) {
    throw new Error("Dữ liệu tham chiếu không thuộc tổ chức hiện tại.");
  }
}

function createSampleAuditPayload(
  fieldListName: "submittedFields" | "updatedFields"
) {
  return {
    metadataPolicy: SAMPLE_METADATA_AUDIT_POLICY,
    [fieldListName]: submittedFields,
  };
}
