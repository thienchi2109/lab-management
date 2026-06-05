import "server-only";

import { hasAnyRole, type AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { mapKitInventoryRows, type KitInventory } from "./inventory";
import type {
  KitInventoryActor,
  KitInventoryAuditInput,
  KitInventoryPort,
} from "./operations";
import type { KitStatus } from "./schemas";

type KitTypeRow = {
  id: string;
  code: string;
  name: string;
  manufacturer: string | null;
  is_active: boolean;
};

type KitBatchRow = {
  id: string;
  kit_type_id: string;
  lot_number: string;
  received_quantity: number;
  remaining_quantity: number;
  expires_on: string | null;
  received_at: string;
};

type KitRow = {
  id: string;
  kit_batch_id: string;
  kit_code: string;
  status: KitStatus;
  updated_at: string;
};

export function getKitInventoryActor(
  session: CurrentSession,
  roles: AppRole[] = ["admin", "editor"]
): KitInventoryActor | null {
  const membership = session.memberships.find((item) => {
    return item.isActive && roles.includes(item.role);
  });

  if (!membership) {
    return null;
  }

  return {
    profileId: session.profile.id,
    organizationId: membership.organizationId,
  };
}

async function requireKitInventoryActor(
  roles: AppRole[] = ["admin", "editor"]
) {
  const session = await getCurrentSession();

  if (!session || !hasAnyRole(session.memberships, roles)) {
    throw new Error("Kit inventory access required.");
  }

  const actor = getKitInventoryActor(session, roles);

  if (!actor) {
    throw new Error("Kit inventory access required.");
  }

  return actor;
}

export async function getKitInventory(): Promise<KitInventory> {
  const actor = await requireKitInventoryActor(["admin", "editor", "viewer"]);
  const supabase = getSupabaseAdminClient();

  const [kitTypes, batches, kits] = await Promise.all([
    supabase
      .from("kit_types")
      .select("id, code, name, manufacturer, is_active")
      .eq("organization_id", actor.organizationId)
      .order("name", { ascending: true })
      .returns<KitTypeRow[]>(),
    supabase
      .from("kit_batches")
      .select(
        "id, kit_type_id, lot_number, received_quantity, remaining_quantity, expires_on, received_at"
      )
      .eq("organization_id", actor.organizationId)
      .order("received_at", { ascending: false })
      .returns<KitBatchRow[]>(),
    supabase
      .from("kits")
      .select("id, kit_batch_id, kit_code, status, updated_at")
      .eq("organization_id", actor.organizationId)
      .order("updated_at", { ascending: false })
      .returns<KitRow[]>(),
  ]);

  if (kitTypes.error || batches.error || kits.error) {
    throw new Error("Could not load kit inventory.");
  }

  return mapKitInventoryRows({
    kitTypes: kitTypes.data ?? [],
    batches: batches.data ?? [],
    kits: kits.data ?? [],
  });
}

export function createSupabaseKitInventoryPort(): KitInventoryPort {
  const supabase = getSupabaseAdminClient();

  return {
    async createKitType(input) {
      const { data, error } = await supabase
        .from("kit_types")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          manufacturer: input.manufacturer,
          is_active: input.isActive,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !data) throw new Error("Could not create kit type.");
      return { kitTypeId: data.id };
    },
    async updateKitType(input) {
      const { error } = await supabase
        .from("kit_types")
        .update({
          code: input.code,
          name: input.name,
          manufacturer: input.manufacturer,
          is_active: input.isActive,
        })
        .eq("id", input.kitTypeId)
        .eq("organization_id", input.organizationId);

      if (error) throw new Error("Could not update kit type.");
    },
    async createBatch(input) {
      const { data, error } = await supabase
        .from("kit_batches")
        .insert({
          organization_id: input.organizationId,
          kit_type_id: input.kitTypeId,
          lot_number: input.lotNumber,
          received_quantity: input.receivedQuantity,
          remaining_quantity: input.remainingQuantity,
          expires_on: input.expiresOn,
          received_at: input.receivedAt,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !data) throw new Error("Could not create kit batch.");
      return { batchId: data.id };
    },
    async updateBatch(input) {
      const { error } = await supabase
        .from("kit_batches")
        .update({
          kit_type_id: input.kitTypeId,
          lot_number: input.lotNumber,
          received_quantity: input.receivedQuantity,
          remaining_quantity: input.remainingQuantity,
          expires_on: input.expiresOn,
          received_at: input.receivedAt,
        })
        .eq("id", input.batchId)
        .eq("organization_id", input.organizationId);

      if (error) throw new Error("Could not update kit batch.");
    },
    async createKitUnits(input) {
      const rows = input.kitCodes.map((kitCode) => ({
        organization_id: input.organizationId,
        kit_batch_id: input.batchId,
        kit_code: kitCode,
        status: "in_stock" as KitStatus,
      }));
      const { data, error } = await supabase
        .from("kits")
        .insert(rows)
        .select("id")
        .returns<Array<{ id: string }>>();

      if (error || !data) throw new Error("Could not create kit units.");
      return { kitIds: data.map((row) => row.id) };
    },
    async updateKitStatus(input) {
      const { error } = await supabase
        .from("kits")
        .update({ status: input.status, status_note: input.reason })
        .eq("id", input.kitId)
        .eq("organization_id", input.organizationId);

      if (error) throw new Error("Could not update kit status.");
    },
    async insertAuditEvent(input: KitInventoryAuditInput) {
      const { error } = await supabase.from("audit_events").insert({
        organization_id: input.organizationId,
        actor_id: input.actorId,
        action: input.action,
        entity_table: input.entityTable,
        entity_id: input.entityId,
        event_payload: input.eventPayload,
      });

      if (error) throw new Error("Could not write kit inventory audit event.");
    },
  };
}
