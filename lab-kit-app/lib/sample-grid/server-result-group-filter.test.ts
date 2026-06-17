import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseSampleGridPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

vi.mock("./result-summary-server", () => ({
  createSampleGridResultSummaryClient: vi.fn((source) => source),
  listSampleGridResultSummaries: vi.fn(async () => ({})),
}));

describe("sample grid Supabase result group filter", () => {
  test("filters samples through sample_result_groups without dropping tenant scope", async () => {
    const firstGroupId = "11111111-1111-4111-8111-111111111111";
    const secondGroupId = "22222222-2222-4222-8222-222222222222";
    const { client, query } = createSupabaseClientDouble();
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const port = createSupabaseSampleGridPort();
    await port.listSamples({
      organizationId: "org-1",
      query: {
        filters: { resultGroupIds: [firstGroupId, secondGroupId] },
        limit: 10,
        offset: 0,
        page: 1,
        pageSize: 10,
        resultColumnKeys: [],
        search: null,
        sort: { direction: "desc", key: "receivedAt" },
      },
    });

    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining("sample_result_groups!inner(result_group_id)"),
      { count: "exact" }
    );
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(query.eq).toHaveBeenCalledWith(
      "sample_result_groups.organization_id",
      "org-1"
    );
    expect(query.in).toHaveBeenCalledWith(
      "sample_result_groups.result_group_id",
      [firstGroupId, secondGroupId]
    );
  });
});

function createSupabaseClientDouble() {
  const query = {
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    in: vi.fn(() => query),
    lte: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(async () => ({
      count: 0,
      data: [],
      error: null,
    })),
    select: vi.fn(() => query),
  };
  const client = {
    from: vi.fn(() => query),
  };

  return { client, query };
}
