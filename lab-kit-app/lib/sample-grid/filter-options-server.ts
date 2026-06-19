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

type SampleCustomerUsageRow = {
  customer_id: string | null;
  customer_name: string | null;
};

type SampleCompanyUsageRow = {
  company_id: string | null;
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
    loadUsedCustomers(supabase, input.organizationId),
    loadUsedCompanies(supabase, input.organizationId),
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

async function loadUsedCustomers(
  supabase: SupabaseLike,
  organizationId: string
): Promise<SampleGridFilterOption[]> {
  const rows = await readRows<SampleCustomerUsageRow>(
    supabase
      .from<SampleCustomerUsageRow>("samples")
      .select("customer_id, customer_name")
      .eq("organization_id", organizationId)
      .order("customer_name", { ascending: true }),
    "Không thể tải option khách hàng đang dùng."
  );

  return uniqueTextOptions(
    rows.map((row) => ({
      id: row.customer_id ?? "",
      label: row.customer_name?.trim() ?? "",
    }))
  );
}

async function loadUsedCompanies(
  supabase: SupabaseLike,
  organizationId: string
): Promise<SampleGridFilterOption[]> {
  const usageRows = await readRows<SampleCompanyUsageRow>(
    supabase
      .from<SampleCompanyUsageRow>("samples")
      .select("company_id")
      .eq("organization_id", organizationId),
    "Không thể tải công ty đang dùng."
  );
  const companyIds = unique(
    usageRows.flatMap((row) => (row.company_id ? [row.company_id] : []))
  );

  if (companyIds.length === 0) {
    return [];
  }

  const rows = await readRows<NamedOptionRow>(
    supabase
      .from<NamedOptionRow>("companies")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("id", companyIds)
      .order("name", { ascending: true }),
    "Không thể tải option công ty đang dùng."
  );

  return rows.map(toFilterOption);
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

function uniqueTextOptions(
  options: SampleGridFilterOption[]
): SampleGridFilterOption[] {
  const seen = new Set<string>();
  const uniqueOptions: SampleGridFilterOption[] = [];

  for (const option of options) {
    if (!option.label) continue;

    const key = `${option.id}\u0000${option.label}`;
    if (seen.has(key)) continue;

    seen.add(key);
    uniqueOptions.push(option);
  }

  return uniqueOptions.sort((a, b) => a.label.localeCompare(b.label, "vi-VN"));
}

function unique(values: string[]) {
  return [...new Set(values)];
}
