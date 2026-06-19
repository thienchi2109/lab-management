import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { mapSampleMetadataRows, type SampleMetadata } from "./metadata";
import type { SampleMetadataActor } from "./operations";

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

/** Load tenant-scoped reference metadata needed by the create-sample form. */
export async function getSampleCreateMetadata(
  actor: SampleMetadataActor
): Promise<SampleMetadata> {
  const supabase = getSupabaseAdminClient();
  const [companies, customers, sampleTypes, kitBatches, resultGroups] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id, code, name, is_active")
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true }),
      supabase
        .from("customers")
        .select("id, company_id, code, name, phone, email, is_active")
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true }),
      supabase
        .from("sample_types")
        .select("id, code, name, is_active")
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true }),
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
        .order("sort_order", { ascending: true }),
    ]);

  if (
    companies.error ||
    customers.error ||
    sampleTypes.error ||
    kitBatches.error ||
    resultGroups.error
  ) {
    throw new Error("Không thể tải metadata tạo mẫu xét nghiệm.");
  }

  return mapSampleMetadataRows({
    companies: (companies.data ?? []) as CompanyRow[],
    customers: (customers.data ?? []) as CustomerRow[],
    sampleTypes: (sampleTypes.data ?? []) as SampleTypeRow[],
    kitBatches: mapKitBatchRows(kitBatches.data ?? []),
    resultGroups: (resultGroups.data ?? []) as ResultGroupRow[],
    samples: [],
  });
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
