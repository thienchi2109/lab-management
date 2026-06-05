import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseResultConfigurationPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("createSupabaseResultConfigurationPort", () => {
  test("replaces template metrics through the atomic RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => {
      throw new Error("replaceTemplateMetrics must use the atomic RPC.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseResultConfigurationPort();

    await port.replaceTemplateMetrics({
      organizationId: "org-1",
      resultTemplateId: "template-1",
      metricIds: ["metric-1", "metric-2"],
    });

    expect(rpc).toHaveBeenCalledWith("replace_result_template_metrics", {
      p_organization_id: "org-1",
      p_result_template_id: "template-1",
      p_metric_ids: ["metric-1", "metric-2"],
    });
    expect(from).not.toHaveBeenCalled();
  });
});
