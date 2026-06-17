import type { SampleGridResultGroupFilterOption } from "./operations";
import type { SupabaseLike } from "./result-summary-server";

type GroupRow = {
  id: string;
  name: string;
  sort_order: number;
};

/** Đọc danh sách nhóm chỉ tiêu active để lọc Sample Grid theo tenant. */
export async function listSampleGridResultGroupOptions(
  supabase: SupabaseLike,
  input: { organizationId: string }
): Promise<SampleGridResultGroupFilterOption[]> {
  const { data, error } = await supabase
    .from<GroupRow>("result_groups")
    .select("id, name, sort_order")
    .eq("organization_id", input.organizationId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch sample grid result group rows:", error);
    throw new Error("Không thể tải nhóm chỉ tiêu lọc mẫu.");
  }

  return (data ?? []).map((group) => ({
    id: group.id,
    label: group.name,
  }));
}
