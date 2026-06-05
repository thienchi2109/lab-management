import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseResultConfigurationPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("createSupabaseResultConfigurationPort", () => {
  test("creates groups through the audit transaction RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: "group-1", error: null });
    const from = vi.fn(() => {
      throw new Error("createGroup must use the audit transaction RPC.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseResultConfigurationPort();

    await expect(
      port.createGroup({
        organizationId: "org-1",
        actorId: "actor-1",
        code: "PCR",
        name: "PCR",
        sortOrder: 10,
        isActive: true,
      })
    ).resolves.toEqual({ groupId: "group-1" });

    expect(rpc).toHaveBeenCalledWith("create_result_group_with_audit", {
      p_organization_id: "org-1",
      p_actor_id: "actor-1",
      p_code: "PCR",
      p_name: "PCR",
      p_sort_order: 10,
      p_is_active: true,
    });
    expect(from).not.toHaveBeenCalled();
  });

  test("updates metrics through the audit transaction RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => {
      throw new Error("updateMetric must use the audit transaction RPC.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseResultConfigurationPort();

    await port.updateMetric({
      organizationId: "org-1",
      actorId: "actor-1",
      metricId: "metric-1",
      resultGroupId: "group-1",
      code: "CT",
      name: "Ct",
      inputType: "pcr_realtime",
      unit: "Ct",
      options: [],
      metricSettings: { positive_threshold: 35 },
      sortOrder: 10,
      isRequired: true,
      isActive: true,
    });

    expect(rpc).toHaveBeenCalledWith("update_result_metric_with_audit", {
      p_organization_id: "org-1",
      p_actor_id: "actor-1",
      p_metric_id: "metric-1",
      p_result_group_id: "group-1",
      p_code: "CT",
      p_name: "Ct",
      p_input_type: "pcr_realtime",
      p_unit: "Ct",
      p_options: [],
      p_metric_settings: { positive_threshold: 35 },
      p_sort_order: 10,
      p_is_required: true,
      p_is_active: true,
    });
    expect(from).not.toHaveBeenCalled();
  });

  test("uses audit transaction RPCs for the remaining write operations", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ data: "metric-1", error: null })
      .mockResolvedValueOnce({ data: "template-1", error: null })
      .mockResolvedValueOnce({ error: null });
    const from = vi.fn(() => {
      throw new Error("Result configuration writes must use audit RPCs.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseResultConfigurationPort();

    await port.updateGroup({
      organizationId: "org-1",
      actorId: "actor-1",
      groupId: "group-1",
      code: "PCR",
      name: "PCR",
      sortOrder: 10,
      isActive: true,
    });
    await port.createMetric({
      organizationId: "org-1",
      actorId: "actor-1",
      resultGroupId: "group-1",
      code: "CT",
      name: "Ct",
      inputType: "pcr_realtime",
      unit: "Ct",
      options: [],
      metricSettings: {},
      sortOrder: 10,
      isRequired: true,
      isActive: true,
    });
    await port.createTemplate({
      organizationId: "org-1",
      actorId: "actor-1",
      sampleTypeId: "sample-type-1",
      code: "PCR",
      name: "PCR",
      isActive: true,
    });
    await port.updateTemplate({
      organizationId: "org-1",
      actorId: "actor-1",
      templateId: "template-1",
      sampleTypeId: "sample-type-1",
      code: "PCR",
      name: "PCR",
      isActive: true,
    });

    expect(rpc).toHaveBeenNthCalledWith(1, "update_result_group_with_audit", {
      p_organization_id: "org-1",
      p_actor_id: "actor-1",
      p_group_id: "group-1",
      p_code: "PCR",
      p_name: "PCR",
      p_sort_order: 10,
      p_is_active: true,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "create_result_metric_with_audit", {
      p_organization_id: "org-1",
      p_actor_id: "actor-1",
      p_result_group_id: "group-1",
      p_code: "CT",
      p_name: "Ct",
      p_input_type: "pcr_realtime",
      p_unit: "Ct",
      p_options: [],
      p_metric_settings: {},
      p_sort_order: 10,
      p_is_required: true,
      p_is_active: true,
    });
    expect(rpc).toHaveBeenNthCalledWith(
      3,
      "create_result_template_with_audit",
      {
        p_organization_id: "org-1",
        p_actor_id: "actor-1",
        p_sample_type_id: "sample-type-1",
        p_code: "PCR",
        p_name: "PCR",
        p_is_active: true,
      }
    );
    expect(rpc).toHaveBeenNthCalledWith(
      4,
      "update_result_template_with_audit",
      {
        p_organization_id: "org-1",
        p_actor_id: "actor-1",
        p_template_id: "template-1",
        p_sample_type_id: "sample-type-1",
        p_code: "PCR",
        p_name: "PCR",
        p_is_active: true,
      }
    );
    expect(from).not.toHaveBeenCalled();
  });

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
      actorId: "actor-1",
      resultTemplateId: "template-1",
      metricIds: ["metric-1", "metric-2"],
    });

    expect(rpc).toHaveBeenCalledWith(
      "replace_result_template_metrics_with_audit",
      {
        p_organization_id: "org-1",
        p_actor_id: "actor-1",
        p_result_template_id: "template-1",
        p_metric_ids: ["metric-1", "metric-2"],
      }
    );
    expect(from).not.toHaveBeenCalled();
  });
});
