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

  test("loads only groups used by template metrics and normalizes dynamic configuration", async () => {
    const { from, queries } = createSupabaseQueryMock({
      samples: [
        {
          id: "sample-1",
          organization_id: "org-1",
          sample_type_id: "type-1",
          sample_code: "T6_00001",
        },
      ],
      result_templates: [{ id: "template-1", name: "PCR cơ bản" }],
      result_template_metrics: [
        { result_metric_id: "metric-1", sort_order: 10 },
      ],
      result_metrics: [
        {
          id: "metric-1",
          result_group_id: "group-1",
          code: "WSSV",
          name: "WSSV",
          input_type: "pcr_realtime",
          unit: "Ct",
          options: ["Âm tính", 123, "Dương tính"],
          metric_settings: {
            min: 0,
            max: "invalid",
            ct_min: 20,
            nested: { enabled: true },
            invalid: () => "bad",
          },
          sort_order: 20,
          is_required: true,
        },
      ],
      result_groups: [
        { id: "group-1", code: "PCR", name: "PCR", sort_order: 10 },
        { id: "group-empty", code: "EMPTY", name: "Trống", sort_order: 20 },
      ],
      sample_results: [],
      sample_group_conclusions: [],
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc: vi.fn(),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleResultsPort();
    const template = await port.getTemplateForSample({
      sampleId: "sample-1",
      organizationId: "org-1",
    });

    expect(queries.result_groups.in).toHaveBeenCalledWith("id", ["group-1"]);
    expect(template?.groups).toHaveLength(1);
    expect(template?.groups[0]?.metrics[0]).toMatchObject({
      id: "metric-1",
      options: ["Âm tính", "Dương tính"],
      metricSettings: {
        min: 0,
        ct_min: 20,
        nested: { enabled: true },
      },
    });
  });

});

type SupabaseRows = Record<string, unknown[]>;

type QueryDouble = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  returns: ReturnType<typeof vi.fn>;
};

function createSupabaseQueryMock(rows: SupabaseRows) {
  const queries: Record<string, QueryDouble> = {};
  const from = vi.fn((table: string) => {
    const query = createQueryDouble(rows[table] ?? []);
    queries[table] = query;
    return query;
  });

  return { from, queries };
}

function createQueryDouble(rows: unknown[]): QueryDouble {
  const query = {} as QueryDouble;
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.order = vi.fn(() => query);
  query.limit = vi.fn(() => query);
  query.in = vi.fn(() => query);
  query.maybeSingle = vi.fn(async () => ({
    data: rows[0] ?? null,
    error: null,
  }));
  query.returns = vi.fn(async () => ({ data: rows, error: null }));
  return query;
}
