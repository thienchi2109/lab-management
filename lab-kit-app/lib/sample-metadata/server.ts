import "server-only";

import { hasAnyRole, type AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { mapSampleMetadataRows, type SampleMetadata } from "./metadata";
import type { SampleMetadataActor, SampleMetadataPort } from "./operations";
import type { SampleBillingStatus, SampleStatus } from "./schemas";

type CompanyRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type CustomerRow = {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
};

type SampleTypeRow = CompanyRow;

type KitBatchRow = {
  id: string;
  kit_type_name: string;
  lot_number: string;
};

type ResultGroupRow = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

type SampleResultGroupRow = {
  result_group_id: string;
};

type SampleRow = {
  id: string;
  sample_type_id: string;
  customer_id: string | null;
  company_id: string | null;
  kit_batch_id: string | null;
  sample_code: string;
  customer_name: string | null;
  collected_at: string | null;
  received_at: string;
  status: SampleStatus;
  billing_status: SampleBillingStatus;
  metadata: Record<string, unknown>;
  sample_result_groups?: SampleResultGroupRow[];
  updated_at: string;
};

/** Lỗi phân quyền khi người dùng không được đọc metadata mẫu. */
export class SampleMetadataAccessError extends Error {
  constructor() {
    super("Sample metadata access required.");
    this.name = "SampleMetadataAccessError";
  }
}

/** Resolve the active sample metadata actor for read or write operations. */
export function getSampleMetadataActor(
  session: CurrentSession,
  roles: AppRole[] = ["admin", "editor"]
): SampleMetadataActor | null {
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

/** Load tenant-scoped sample metadata rows and reference options. */
export async function getSampleMetadata(): Promise<SampleMetadata> {
  const actor = await requireSampleMetadataActor(["admin", "editor", "viewer"]);
  const supabase = getSupabaseAdminClient();

  const [companies, customers, sampleTypes, kitBatches, resultGroups, samples] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id, code, name, is_active")
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true })
        .returns<CompanyRow[]>(),
      supabase
        .from("customers")
        .select("id, company_id, code, name, phone, email, is_active")
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true })
        .returns<CustomerRow[]>(),
      supabase
        .from("sample_types")
        .select("id, code, name, is_active")
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true })
        .returns<SampleTypeRow[]>(),
      supabase
        .from("kit_batches")
        .select("id, lot_number, kit_types!inner(name)")
        .eq("organization_id", actor.organizationId)
        .order("received_at", { ascending: false }),
      supabase
        .from("result_groups")
        .select("id, name, sort_order, is_active")
        .eq("organization_id", actor.organizationId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .returns<ResultGroupRow[]>(),
      supabase
        .from("samples")
        .select(
          "id, sample_type_id, customer_id, company_id, kit_batch_id, sample_code, customer_name, collected_at, received_at, status, billing_status, metadata, updated_at, sample_result_groups(result_group_id)"
        )
        .eq("organization_id", actor.organizationId)
        .order("received_at", { ascending: false })
        .returns<SampleRow[]>(),
    ]);

  if (
    companies.error ||
    customers.error ||
    sampleTypes.error ||
    kitBatches.error ||
    resultGroups.error ||
    samples.error
  ) {
    throw new Error("Không thể tải danh sách mẫu xét nghiệm.");
  }

  return mapSampleMetadataRows({
    companies: companies.data ?? [],
    customers: customers.data ?? [],
    sampleTypes: sampleTypes.data ?? [],
    kitBatches: mapKitBatchRows(kitBatches.data ?? []),
    resultGroups: resultGroups.data ?? [],
    samples: samples.data ?? [],
  });
}

/** Create the Supabase-backed sample metadata port. */
export function createSupabaseSampleMetadataPort(): SampleMetadataPort {
  const supabase = getSupabaseAdminClient();

  return {
    async referencesBelongToOrganization(input) {
      const checks = await Promise.all([
        existsInOrg("sample_types", input.sampleTypeId, input.organizationId),
        existsNullableInOrg(
          "customers",
          input.customerId,
          input.organizationId
        ),
        existsNullableInOrg("companies", input.companyId, input.organizationId),
        existsNullableInOrg(
          "kit_batches",
          input.kitBatchId,
          input.organizationId
        ),
        allActiveInOrg(
          "result_groups",
          input.resultGroupIds,
          input.organizationId
        ),
      ]);

      return checks.every(Boolean);
    },
    async createSample(input) {
      const { data, error } = await supabase
        .rpc("create_sample_metadata_with_code", {
          p_actor_id: input.createdBy,
          p_audit_event_payload: input.auditEventPayload,
          p_billing_status: input.billingStatus,
          p_collected_at: input.collectedAt,
          p_company_id: input.companyId,
          p_customer_id: input.customerId,
          p_customer_name: input.customerName,
          p_kit_batch_id: input.kitBatchId,
          p_note: input.note,
          p_organization_id: input.organizationId,
          p_received_at: input.receivedAt,
          p_result_group_ids: input.resultGroupIds,
          p_sample_type_id: input.sampleTypeId,
          p_status: input.status,
        })
        .single<{ sample_id: string; sample_code: string }>();

      if (error || !data) throw new Error("Không thể tạo mẫu xét nghiệm.");
      return { sampleId: data.sample_id, sampleCode: data.sample_code };
    },
    async updateSample(input) {
      const { error } = await supabase.rpc(
        "update_sample_metadata_with_result_groups",
        {
          p_actor_id: input.updatedBy,
          p_audit_event_payload: input.auditEventPayload,
          p_billing_status: input.billingStatus,
          p_collected_at: input.collectedAt,
          p_company_id: input.companyId,
          p_customer_id: input.customerId,
          p_customer_name: input.customerName,
          p_kit_batch_id: input.kitBatchId,
          p_note: input.note,
          p_organization_id: input.organizationId,
          p_received_at: input.receivedAt,
          p_result_group_ids: input.resultGroupIds,
          p_sample_id: input.sampleId,
          p_sample_type_id: input.sampleTypeId,
          p_status: input.status,
        }
      );

      if (error) {
        throw new Error(
          `Không thể cập nhật metadata và nhóm chỉ tiêu của mẫu: ${getSupabaseErrorMessage(error)}`
        );
      }
    },
    async insertAuditEvent(input) {
      const { error } = await supabase.from("audit_events").insert({
        organization_id: input.organizationId,
        actor_id: input.actorId,
        action: input.action,
        entity_table: input.entityTable,
        entity_id: input.entityId,
        event_payload: input.eventPayload,
      });

      if (error) throw new Error("Không thể ghi audit cho mẫu xét nghiệm.");
    },
  };
}

async function requireSampleMetadataActor(roles: AppRole[]) {
  const session = await getCurrentSession();

  if (!session || !hasAnyRole(session.memberships, roles)) {
    throw new SampleMetadataAccessError();
  }

  const actor = getSampleMetadataActor(session, roles);

  if (!actor) {
    throw new SampleMetadataAccessError();
  }

  return actor;
}

async function existsInOrg(table: string, id: string, organizationId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle<{ id: string }>();

  if (error) throw new Error("Không thể kiểm tra dữ liệu tham chiếu.");
  return Boolean(data);
}

function existsNullableInOrg(
  table: string,
  id: string | null,
  organizationId: string
) {
  return id ? existsInOrg(table, id, organizationId) : Promise.resolve(true);
}

function getSupabaseErrorMessage(error: { message?: string }) {
  return error.message ?? "Lỗi Supabase không rõ.";
}

async function allActiveInOrg(
  table: string,
  ids: string[],
  organizationId: string
) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return false;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .in("id", uniqueIds)
    .returns<Array<{ id: string }>>();

  if (error) throw new Error("Không thể kiểm tra dữ liệu tham chiếu.");
  return (data ?? []).length === uniqueIds.length;
}

function mapKitBatchRows(rows: unknown[]): KitBatchRow[] {
  return rows.map((row) => {
    const value = row as {
      id: string;
      lot_number: string;
      kit_types?: { name?: string } | Array<{ name?: string }>;
    };
    const kitType = Array.isArray(value.kit_types)
      ? value.kit_types[0]
      : value.kit_types;

    return {
      id: value.id,
      lot_number: value.lot_number,
      kit_type_name: kitType?.name ?? "Không rõ loại KIT",
    };
  });
}
