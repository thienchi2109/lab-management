import "server-only";

import type { AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  listSampleGridPage,
  type SampleGridActor,
  type SampleGridPort,
  type SampleGridRow,
} from "./operations";
import type {
  SampleGridQuery,
  SampleGridSearchParams,
  SampleGridSortKey,
} from "./query";

type SampleGridDbRow = {
  billing_status: string;
  company_id: string | null;
  companies?: RelationName | RelationName[] | null;
  customer_id: string | null;
  customer_name: string | null;
  id: string;
  kit_batch_id: string | null;
  kit_batches?: KitBatchRelation | KitBatchRelation[] | null;
  received_at: string;
  sample_code: string;
  sample_type_id: string;
  sample_types?: RelationName | RelationName[] | null;
  status: string;
  updated_at: string;
};

type RelationName = {
  name?: string | null;
};

type KitBatchRelation = {
  lot_number?: string | null;
  kit_types?: RelationName | RelationName[] | null;
};

type SampleGridQueryBuilder = {
  eq(column: string, value: string): SampleGridQueryBuilder;
  gte(column: string, value: string): SampleGridQueryBuilder;
  lte(column: string, value: string): SampleGridQueryBuilder;
  or(filter: string): SampleGridQueryBuilder;
  order(
    column: string,
    options: { ascending: boolean }
  ): SampleGridQueryBuilder;
  range(
    from: number,
    to: number
  ): Promise<{
    count: number | null;
    data: SampleGridDbRow[] | null;
    error: unknown;
  }>;
  select(columns: string, options: { count: "exact" }): SampleGridQueryBuilder;
};

const SAMPLE_GRID_SELECT =
  "id, sample_type_id, customer_id, company_id, kit_batch_id, sample_code, customer_name, received_at, status, billing_status, updated_at, sample_types(name), companies(name), kit_batches(lot_number, kit_types(name))";
const SAMPLE_GRID_READ_ROLES = ["admin", "editor", "viewer"] as const;
const MISSING_KIT_LABEL = "Chưa gán KIT";
const UNKNOWN_SAMPLE_TYPE_LABEL = "Không rõ loại mẫu";
const sortColumnByKey: Record<SampleGridSortKey, string> = {
  billingStatus: "billing_status",
  customerName: "customer_name",
  receivedAt: "received_at",
  sampleCode: "sample_code",
  status: "status",
  updatedAt: "updated_at",
};

/** Lỗi phân quyền khi người dùng không được đọc data grid mẫu. */
export class SampleGridAccessError extends Error {
  constructor() {
    super("Sample grid read access required.");
    this.name = "SampleGridAccessError";
  }
}

/** Load one tenant-scoped sample grid page for the current session. */
export async function getSampleGridPage(searchParams: SampleGridSearchParams) {
  const actor = await requireSampleGridActor();

  return listSampleGridPage(
    searchParams,
    actor,
    createSupabaseSampleGridPort()
  );
}

/** Create the Supabase-backed read port for sample grid pages. */
export function createSupabaseSampleGridPort(): SampleGridPort {
  const supabase = getSupabaseAdminClient();

  return {
    async listSamples(input) {
      const samples = supabase.from("samples") as unknown as {
        select(
          columns: string,
          options: { count: "exact" }
        ): SampleGridQueryBuilder;
      };
      let query = samples
        .select(SAMPLE_GRID_SELECT, { count: "exact" })
        .eq("organization_id", input.organizationId);

      query = applyFilters(query, input.query);
      query = applySearch(query, input.query);
      query = query.order(sortColumnByKey[input.query.sort.key], {
        ascending: input.query.sort.direction === "asc",
      });

      const { count, data, error } = await query.range(
        input.query.offset,
        input.query.offset + input.query.limit - 1
      );

      if (error) {
        throw new Error("Không thể tải trang dữ liệu mẫu xét nghiệm.");
      }

      return {
        rows: (data ?? []).map(mapSampleGridRow),
        totalCount: count ?? 0,
      };
    },
  };
}

async function requireSampleGridActor(): Promise<SampleGridActor> {
  const session = await getCurrentSession();

  if (!session) {
    throw new SampleGridAccessError();
  }

  const actor = getActiveSampleGridActor(session);

  if (!actor) {
    throw new SampleGridAccessError();
  }

  return actor;
}

function applyFilters(
  query: SampleGridQueryBuilder,
  gridQuery: SampleGridQuery
) {
  const { filters } = gridQuery;

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.billingStatus) {
    query = query.eq("billing_status", filters.billingStatus);
  }
  if (filters.companyId) query = query.eq("company_id", filters.companyId);
  if (filters.kitBatchId) query = query.eq("kit_batch_id", filters.kitBatchId);
  if (filters.sampleTypeId) {
    query = query.eq("sample_type_id", filters.sampleTypeId);
  }
  if (filters.receivedFrom)
    query = query.gte("received_at", filters.receivedFrom);
  if (filters.receivedTo) query = query.lte("received_at", filters.receivedTo);

  return query;
}

function applySearch(
  query: SampleGridQueryBuilder,
  gridQuery: SampleGridQuery
) {
  if (!gridQuery.search) {
    return query;
  }

  const pattern = `%${escapeSearchToken(gridQuery.search)}%`;

  return query.or(
    `sample_code.ilike.${pattern},customer_name.ilike.${pattern}`
  );
}

function escapeSearchToken(value: string) {
  return value.replace(/[\\%_(),]/g, "\\$&");
}

function mapSampleGridRow(row: SampleGridDbRow): SampleGridRow {
  const sampleType = firstRelation(row.sample_types);
  const company = firstRelation(row.companies);
  const kitBatch = firstRelation(row.kit_batches);
  const kitType = firstRelation(kitBatch?.kit_types);

  return {
    billingStatus: row.billing_status,
    companyId: row.company_id,
    companyName: company?.name ?? null,
    customerId: row.customer_id,
    customerName: row.customer_name,
    id: row.id,
    kitBatchId: row.kit_batch_id,
    kitSummary:
      kitBatch?.lot_number && kitType?.name
        ? `${kitType.name} - ${kitBatch.lot_number}`
        : MISSING_KIT_LABEL,
    receivedAt: row.received_at,
    sampleCode: row.sample_code,
    sampleTypeId: row.sample_type_id,
    sampleTypeName: sampleType?.name ?? UNKNOWN_SAMPLE_TYPE_LABEL,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function getActiveSampleGridActor(
  session: CurrentSession
): SampleGridActor | null {
  const membership = session.memberships.find((item) => {
    return (
      item.isActive && SAMPLE_GRID_READ_ROLES.includes(item.role as AppRole)
    );
  });

  if (!membership) {
    return null;
  }

  return {
    organizationId: membership.organizationId,
    profileId: session.profile.id,
    role: membership.role,
  };
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}
