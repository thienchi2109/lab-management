import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseSampleResultsPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("createSupabaseSampleResultsPort", () => {
  test("saves results through the audit transaction RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => {
      throw new Error("sample result writes must use the transaction RPC.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleResultsPort();

    await port.saveResultsTransaction({
      sampleId: "sample-1",
      organizationId: "org-1",
      actorId: "actor-1",
      results: [{ metricId: "metric-1", value: 7.8 }],
      conclusions: [
        {
          groupId: "group-1",
          kqChung: "Đạt yêu cầu",
          calculatedFrom: { rule: "manual-text" },
        },
      ],
      auditEvent: {
        action: "sample_results.updated",
        entityTable: "sample_results",
        entityId: "sample-1",
        eventPayload: { resultCount: 1 },
      },
    });

    expect(rpc).toHaveBeenCalledWith("save_sample_results_with_audit", {
      p_organization_id: "org-1",
      p_actor_id: "actor-1",
      p_sample_id: "sample-1",
      p_results: [{ metricId: "metric-1", value: 7.8 }],
      p_conclusions: [
        {
          groupId: "group-1",
          kqChung: "Đạt yêu cầu",
          calculatedFrom: { rule: "manual-text" },
        },
      ],
      p_audit_event: {
        action: "sample_results.updated",
        entityTable: "sample_results",
        entityId: "sample-1",
        eventPayload: { resultCount: 1 },
      },
    });
    expect(from).not.toHaveBeenCalled();
  });
});
