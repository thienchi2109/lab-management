import type {
  KitBatchInput,
  KitStatus,
  KitStatusInput,
  KitTypeInput,
  KitUnitInput,
} from "./schemas";

export type KitInventoryActor = {
  profileId: string;
  organizationId: string;
};

export type KitInventoryAuditInput = {
  organizationId: string;
  actorId: string;
  action:
    | "kit_type.created"
    | "kit_type.updated"
    | "kit_batch.created"
    | "kit_batch.updated"
    | "kit_units.created"
    | "kit_status.updated";
  entityTable: "kit_types" | "kit_batches" | "kits";
  entityId: string;
  eventPayload: Record<string, unknown>;
};

export type KitInventoryPort = {
  createKitType(
    input: KitTypeInput & { organizationId: string }
  ): Promise<{ kitTypeId: string }>;
  updateKitType(
    input: KitTypeInput & { kitTypeId: string; organizationId: string }
  ): Promise<void>;
  createBatch(
    input: KitBatchInput & { organizationId: string }
  ): Promise<{ batchId: string }>;
  updateBatch(
    input: KitBatchInput & { batchId: string; organizationId: string }
  ): Promise<void>;
  createKitUnits(input: {
    organizationId: string;
    batchId: string;
    kitCodes: string[];
  }): Promise<{ kitIds: string[] }>;
  updateKitStatus(input: {
    organizationId: string;
    kitId: string;
    status: KitStatus;
    reason: string;
  }): Promise<void>;
  insertAuditEvent(input: KitInventoryAuditInput): Promise<void>;
};

export async function createKitType(
  input: KitTypeInput,
  actor: KitInventoryActor,
  port: KitInventoryPort
) {
  const result = await port.createKitType({
    ...input,
    organizationId: actor.organizationId,
  });

  await audit(port, actor, {
    action: "kit_type.created",
    entityTable: "kit_types",
    entityId: result.kitTypeId,
    eventPayload: input,
  });

  return result;
}

export async function createKitBatch(
  input: KitBatchInput,
  actor: KitInventoryActor,
  port: KitInventoryPort
) {
  const result = await port.createBatch({
    ...input,
    organizationId: actor.organizationId,
  });

  await audit(port, actor, {
    action: "kit_batch.created",
    entityTable: "kit_batches",
    entityId: result.batchId,
    eventPayload: input,
  });

  return result;
}

export async function createKitUnits(
  input: KitUnitInput,
  actor: KitInventoryActor,
  port: KitInventoryPort
) {
  const result = await port.createKitUnits({
    organizationId: actor.organizationId,
    batchId: input.batchId,
    kitCodes: input.kitCodes,
  });

  await audit(port, actor, {
    action: "kit_units.created",
    entityTable: "kits",
    entityId: result.kitIds[0],
    eventPayload: { ...input, kitIds: result.kitIds },
  });

  return result;
}

export async function updateKitStatus(
  input: KitStatusInput,
  actor: KitInventoryActor,
  port: KitInventoryPort
) {
  await port.updateKitStatus({
    organizationId: actor.organizationId,
    kitId: input.kitId,
    status: input.status,
    reason: input.reason,
  });

  await audit(port, actor, {
    action: "kit_status.updated",
    entityTable: "kits",
    entityId: input.kitId,
    eventPayload: { status: input.status, reason: input.reason },
  });
}

function audit(
  port: KitInventoryPort,
  actor: KitInventoryActor,
  input: Omit<KitInventoryAuditInput, "organizationId" | "actorId">
) {
  return port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    ...input,
  });
}
