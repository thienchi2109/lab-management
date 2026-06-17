import type {
  SampleGridFilterOption,
  SampleGridFilterOptions,
} from "./operations";
import { listSampleGridResultGroupOptions } from "./result-group-options-server";
import type { SupabaseLike } from "./result-summary-server";

type SampleTypeRow = {
  id: string;
  name: string;
};

type SampleTypeUsageRow = {
  sample_type_id: string;
};

type NamedOptionRow = {
  id: string;
  name: string;
};

/** Đọc option server-side cho bộ lọc mẫu theo tenant hiện tại. */
export async function listSampleGridFilterOptions(
  supabase: SupabaseLike,
  input: { organizationId: string }
): Promise<SampleGridFilterOptions> {
  const [sampleTypes, customers, companies, resultGroups] = await Promise.all([
    loadUsedSampleTypes(supabase, input.organizationId),
    loadNamedOptions(supabase, "customers", input.organizationId),
    loadNamedOptions(supabase, "companies", input.organizationId),
    listSampleGridResultGroupOptions(supabase, input),
  ]);

  return {
    companies,
    customers,
    resultGroups,
    sampleTypes,
  };
}

async function loadUsedSampleTypes(
  supabase: SupabaseLike,
  organizationId: string
): Promise<SampleGridFilterOption[]> {
  const usageRows = await readRows<SampleTypeUsageRow>(
    supabase
      .from<SampleTypeUsageRow>("samples")
      .select("sample_type_id")
      .eq("organization_id", organizationId),
    "Không thể tải loại mẫu đang dùng."
  );
  const sampleTypeIds = unique(usageRows.map((row) => row.sample_type_id));

  if (sampleTypeIds.length === 0) {
    return [];
  }

  const rows = await readRows<SampleTypeRow>(
    supabase
      .from<SampleTypeRow>("sample_types")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", sampleTypeIds)
      .order("name", { ascending: true }),
    "Không thể tải option loại mẫu."
  );

  return rows.map(toFilterOption);
}

function loadNamedOptions(
  supabase: SupabaseLike,
  table: "companies" | "customers",
  organizationId: string
): Promise<SampleGridFilterOption[]> {
  return readRows<NamedOptionRow>(
    supabase
      .from<NamedOptionRow>(table)
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    `Không thể tải option ${table === "companies" ? "công ty" : "khách hàng"}.`
  ).then((rows) => rows.map(toFilterOption));
}

async function readRows<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>,
  message: string
) {
  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch sample grid filter option rows:", error);
    throw new Error(message);
  }

  return data ?? [];
}

function toFilterOption(row: NamedOptionRow): SampleGridFilterOption {
  return {
    id: row.id,
    label: row.name,
  };
}

function unique(values: string[]) {
  return [...new Set(values)];
}
