import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { requireSampleMetadataActor } from "./server";
import {
  mapSampleCostSummaryRows,
  type SampleCostSummary,
  type SampleCostSummaryRow,
} from "./sample-cost-summary";

/** Load tenant-scoped sample cost totals for the contracted payment groups. */
export async function getSampleCostSummary(): Promise<SampleCostSummary> {
  const actor = await requireSampleMetadataActor(["admin", "editor", "viewer"]);
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("samples")
    .select(
      "billing_status, sample_cost_amount_vnd, sample_cost_payment_method"
    )
    .eq("organization_id", actor.organizationId)
    .returns<SampleCostSummaryRow[]>();

  if (error) {
    throw new Error("Không thể tải tổng hợp chi phí mẫu.");
  }

  return mapSampleCostSummaryRows(data ?? []);
}
