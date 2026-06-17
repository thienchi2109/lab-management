import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseSampleMetadataPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("createSupabaseSampleMetadataPort", () => {
  test("passes selected result groups to the create RPC", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { sample_id: "sample-1", sample_code: "HP-260616-ABCDEF1" },
      error: null,
    });
    const rpc = vi.fn(() => ({ single }));
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn(),
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleMetadataPort();
    await port.createSample({
      organizationId: "org-1",
      createdBy: "actor-1",
      sampleTypeId: "type-1",
      customerId: null,
      companyId: null,
      kitBatchId: null,
      customerName: "Nguyễn Văn A",
      collectedAt: "2026-06-15",
      receivedAt: "2026-06-16",
      status: "received",
      billingStatus: "unpaid",
      note: "Ưu tiên",
      resultGroupIds: ["group-1", "group-2"],
      auditEventPayload: { submittedFields: ["resultGroupIds"] },
    });

    expect(rpc).toHaveBeenCalledWith(
      "create_sample_metadata_with_code",
      expect.objectContaining({
        p_result_group_ids: ["group-1", "group-2"],
      })
    );
  });

  test("rejects references when a selected result group is missing", async () => {
    const { from } = createSupabaseQueryMock({
      sample_types: [{ id: "type-1" }],
      result_groups: [{ id: "group-1" }],
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc: vi.fn(),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleMetadataPort();
    const ok = await port.referencesBelongToOrganization({
      organizationId: "org-1",
      sampleTypeId: "type-1",
      customerId: null,
      companyId: null,
      kitBatchId: null,
      resultGroupIds: ["group-1", "group-2"],
    });

    expect(ok).toBe(false);
  });

  test("syncs selected result groups when updating a sample", async () => {
    const sampleQuery = createChainDouble();
    const groupQuery = createChainDouble([
      { result_group_id: "group-1" },
      { result_group_id: "group-2" },
    ]);
    const from = vi.fn((table: string) => {
      if (table === "sample_result_groups") return groupQuery;
      return sampleQuery;
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc: vi.fn(),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleMetadataPort();
    await port.updateSample({
      sampleId: "sample-1",
      organizationId: "org-1",
      sampleTypeId: "type-1",
      customerId: null,
      companyId: null,
      kitBatchId: null,
      customerName: "Nguyễn Văn A",
      collectedAt: "2026-06-15",
      receivedAt: "2026-06-16",
      status: "received",
      billingStatus: "unpaid",
      note: "Ưu tiên",
      resultGroupIds: ["group-2", "group-3"],
    });

    expect(from).toHaveBeenCalledWith("sample_result_groups");
    expect(groupQuery.select).toHaveBeenCalledWith("result_group_id");
    expect(groupQuery.eq).toHaveBeenCalledWith("sample_id", "sample-1");
    expect(groupQuery.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(groupQuery.delete).toHaveBeenCalled();
    expect(groupQuery.in).toHaveBeenCalledWith("result_group_id", ["group-1"]);
    expect(groupQuery.insert).toHaveBeenCalledWith([
      {
        sample_id: "sample-1",
        result_group_id: "group-3",
        organization_id: "org-1",
      },
    ]);
  });
});

type SupabaseRows = Record<string, unknown[]>;

function createSupabaseQueryMock(rows: SupabaseRows) {
  const from = vi.fn((table: string) => createQueryDouble(rows[table] ?? []));
  return { from };
}

function createQueryDouble(rows: unknown[]) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data: rows[0] ?? null, error: null })),
    returns: vi.fn(async () => ({ data: rows, error: null })),
  };
  return query;
}

function createChainDouble(rows: unknown[] = []) {
  const query = {
    select: vi.fn(() => query),
    update: vi.fn(() => query),
    delete: vi.fn(() => query),
    insert: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    returns: vi.fn(async () => ({ data: rows, error: null })),
    then(resolve: (value: { error: null }) => void) {
      resolve({ error: null });
    },
  };
  return query;
}
