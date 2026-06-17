import type { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { UpdateSampleInput } from "./schemas";

/** Dòng bảng nối nhóm chỉ tiêu đã gắn với một mẫu. */
export type SampleResultGroupRow = {
  result_group_id: string;
};

/** Đồng bộ bảng nối sample_result_groups theo danh sách nhóm đã chọn. */
export async function syncSampleResultGroups(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  input: UpdateSampleInput & { organizationId: string }
) {
  const { data, error } = await supabase
    .from("sample_result_groups")
    .select("result_group_id")
    .eq("sample_id", input.sampleId)
    .eq("organization_id", input.organizationId)
    .returns<SampleResultGroupRow[]>();

  if (error) throw new Error("Không thể cập nhật nhóm chỉ tiêu của mẫu.");

  const selectedIds = [...new Set(input.resultGroupIds)];
  const existingIds = (data ?? []).map((row) => row.result_group_id);
  const selectedSet = new Set(selectedIds);
  const existingSet = new Set(existingIds);
  const idsToRemove = existingIds.filter((id) => !selectedSet.has(id));
  const idsToInsert = selectedIds.filter((id) => !existingSet.has(id));

  if (idsToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from("sample_result_groups")
      .delete()
      .eq("sample_id", input.sampleId)
      .eq("organization_id", input.organizationId)
      .in("result_group_id", idsToRemove);

    if (deleteError) {
      throw new Error("Không thể cập nhật nhóm chỉ tiêu của mẫu.");
    }
  }

  if (idsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("sample_result_groups")
      .insert(
        idsToInsert.map((resultGroupId) => ({
          sample_id: input.sampleId,
          result_group_id: resultGroupId,
          organization_id: input.organizationId,
        }))
      );

    if (insertError) {
      throw new Error("Không thể cập nhật nhóm chỉ tiêu của mẫu.");
    }
  }
}
