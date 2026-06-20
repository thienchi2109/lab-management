import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { SampleResultsPort } from "./operations";
import { parseSampleResultEntryPayload } from "./read-rpc-payload";

/** Create the Supabase-backed sample-results port for route/page boundaries. */
export function createSupabaseSampleResultsPort(): SampleResultsPort {
  const supabase = getSupabaseAdminClient();

  return {
    async getTemplateForSample(input) {
      const { data, error } = await supabase.rpc(
        "get_sample_result_entry_payload",
        {
          p_organization_id: input.organizationId,
          p_sample_id: input.sampleId,
        }
      );

      if (error) throw new Error("Không thể tải kết quả mẫu.");
      return parseSampleResultEntryPayload(data);
    },
    async saveResultsTransaction(input) {
      const { error } = await supabase.rpc("save_sample_results_with_audit", {
        p_organization_id: input.organizationId,
        p_actor_id: input.actorId,
        p_sample_id: input.sampleId,
        p_results: input.results,
        p_conclusions: input.conclusions,
        p_audit_event: input.auditEvent,
      });

      if (error) {
        throw new Error("Không thể lưu kết quả xét nghiệm.");
      }
    },
  };
}
