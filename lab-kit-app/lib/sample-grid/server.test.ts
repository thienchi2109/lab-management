import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  createSampleGridResultSummaryClient,
  listSampleGridResultSummaries,
} from "./result-summary-server";
import {
  SampleGridAccessError,
  createSupabaseSampleGridPort,
  getSampleGridPage,
} from "./server";
import { createSupabaseOptionsDouble } from "./server-test-doubles";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

vi.mock("./result-summary-server", () => ({
  createSampleGridResultSummaryClient: vi.fn((source) => source),
  listSampleGridResultSummaries: vi.fn(async () => ({})),
}));

const serverSource = readFileSync(
  join(process.cwd(), "lib/sample-grid/server.ts"),
  "utf8"
);

describe("sample grid server contract", () => {
  test("keeps the result-summary adapter typed without disabling checks", () => {
    expect(serverSource).not.toContain("as never");
    expect(serverSource).not.toContain(
      "as unknown as SupabaseResultSummarySource"
    );
    expect(serverSource).not.toContain("as { from(table: string): unknown }");
    expect(serverSource).not.toContain(
      "select(columns: string): QueryBuilder<T>"
    );
    expect(serverSource).toContain("createSampleGridResultSummaryClient(");
    expect(serverSource).toContain("SupabaseResultSummarySource");
  });

  test("allows active viewers to read a tenant-scoped page", async () => {
    vi.mocked(listSampleGridResultSummaries).mockResolvedValue({});
    vi.mocked(getCurrentSession).mockResolvedValue({
      memberships: [
        { isActive: true, organizationId: "org-1", role: "viewer" },
      ],
      profile: {
        displayName: "Viewer",
        email: "viewer@example.com",
        id: "profile-1",
        username: "viewer",
      },
    });
    const { client } = createSupabaseClientDouble({
      rows: [
        {
          billing_status: "paid",
          company_id: null,
          customer_id: null,
          customer_name: "Nguyễn Văn A",
          id: "sample-1",
          kit_batch_id: null,
          kit_batches: null,
          received_at: "2026-06-08T08:00:00.000Z",
          sample_code: "T6_00012",
          sample_type_id: "type-1",
          sample_types: { name: "Mẫu PCR" },
          status: "received",
          updated_at: "2026-06-08T09:00:00.000Z",
        },
      ],
      totalCount: 1,
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const page = await getSampleGridPage({ pageSize: "10" });

    expect(page.rows).toHaveLength(1);
    expect(page.capabilities).toEqual({
      canEnterResults: false,
      canExport: false,
      canManageImages: false,
      canUpdateMetadata: false,
    });
    expect(page.rows[0]).toEqual(
      expect.objectContaining({
        companyName: null,
        kitSummary: "Chưa gán KIT",
        sampleTypeName: "Mẫu PCR",
      })
    );
    expect(page.pageInfo.totalCount).toBe(1);
    expect(page.query.limit).toBe(10);
  });

  test("rejects inactive viewers before querying Supabase", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      memberships: [
        { isActive: false, organizationId: "org-1", role: "viewer" },
      ],
      profile: {
        displayName: "Viewer",
        email: "viewer@example.com",
        id: "profile-1",
        username: "viewer",
      },
    });
    const from = vi.fn();
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    await expect(getSampleGridPage({})).rejects.toBeInstanceOf(
      SampleGridAccessError
    );
    expect(from).not.toHaveBeenCalled();
  });

  test("rejects malformed Supabase result-summary clients before querying", () => {
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      {} as ReturnType<typeof getSupabaseAdminClient>
    );

    expect(() => createSupabaseSampleGridPort()).toThrow(
      "Supabase client không hỗ trợ đọc summary kết quả."
    );
  });

  test("rejects malformed Supabase result-summary table clients", () => {
    const client = {
      from: vi.fn(() => ({})),
    };
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    createSupabaseSampleGridPort();
    const source = vi.mocked(createSampleGridResultSummaryClient).mock
      .lastCall?.[0];

    if (!source) {
      throw new Error("Expected result-summary source adapter.");
    }

    expect(() => source.from("samples").select("id")).toThrow(
      "Supabase table client không hỗ trợ đọc summary kết quả."
    );
  });

  test("applies tenant, filter, sort, count, and range to Supabase reads", async () => {
    const { client, query } = createSupabaseClientDouble({
      rows: [],
      totalCount: 12,
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const port = createSupabaseSampleGridPort();
    await port.listSamples({
      organizationId: "org-1",
      query: {
        filters: {
          billingStatus: "unpaid",
          companyId: "company-1",
          companyName: "Công ty A",
          customerId: "customer-1",
          customerName: "Nguyễn Văn A",
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
          status: "received",
        },
        limit: 10,
        offset: 20,
        page: 3,
        pageSize: 10,
        resultColumnKeys: [],
        search: "T6_00012",
        sort: { direction: "desc", key: "receivedAt" },
      },
    });

    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining("sample_code"),
      { count: "exact" }
    );
    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining("sample_types(name)"),
      { count: "exact" }
    );
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(query.eq).toHaveBeenCalledWith("status", "received");
    expect(query.eq).toHaveBeenCalledWith("billing_status", "unpaid");
    expect(query.eq).toHaveBeenCalledWith("company_id", "company-1");
    expect(query.eq).toHaveBeenCalledWith("customer_id", "customer-1");
    expect(query.ilike).toHaveBeenCalledWith("companies.name", "%Công ty A%");
    expect(query.ilike).toHaveBeenCalledWith("customer_name", "%Nguyễn Văn A%");
    expect(query.gte).toHaveBeenCalledWith("received_at", "2026-06-01");
    expect(query.lte).toHaveBeenCalledWith("received_at", "2026-06-08");
    expect(query.or).toHaveBeenCalledWith(
      "sample_code.ilike.%T6\\_00012%,customer_name.ilike.%T6\\_00012%"
    );
    expect(query.order).toHaveBeenCalledWith("received_at", {
      ascending: false,
    });
    expect(query.range).toHaveBeenCalledWith(20, 29);
  });

  test("loads server-side filter options from tenant-scoped sources", async () => {
    const { client, calls } = createSupabaseOptionsDouble({
      companies: [
        {
          id: "company-1",
          is_active: true,
          name: "Công ty A",
          organization_id: "org-1",
        },
      ],
      customers: [
        {
          id: "customer-1",
          is_active: true,
          name: "Khách hàng A",
          organization_id: "org-1",
        },
      ],
      result_groups: [
        {
          id: "group-1",
          is_active: true,
          name: "PCR",
          organization_id: "org-1",
          sort_order: 10,
        },
      ],
      sample_types: [
        {
          id: "type-1",
          is_active: true,
          name: "Mẫu PCR",
          organization_id: "org-1",
        },
      ],
      samples: [
        {
          company_id: "company-1",
          customer_id: "customer-1",
          customer_name: "Khách hàng A",
          id: "sample-1",
          organization_id: "org-1",
          sample_type_id: "type-1",
        },
        {
          company_id: "company-1",
          customer_id: "customer-1",
          customer_name: "Khách hàng A",
          id: "sample-2",
          organization_id: "org-1",
          sample_type_id: "type-1",
        },
      ],
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const port = createSupabaseSampleGridPort();

    await expect(
      port.listFilterOptions!({ organizationId: "org-1" })
    ).resolves.toEqual({
      companies: [{ id: "company-1", label: "Công ty A" }],
      customers: [{ id: "customer-1", label: "Khách hàng A" }],
      resultGroups: [{ id: "group-1", label: "PCR" }],
      sampleTypes: [{ id: "type-1", label: "Mẫu PCR" }],
    });
    expect(calls).toContainEqual({
      column: "organization_id",
      table: "samples",
      type: "eq",
      value: "org-1",
    });
    expect(calls).toContainEqual({
      column: "id",
      table: "sample_types",
      type: "in",
      values: ["type-1"],
    });
  });
});

function createSupabaseClientDouble(input: {
  rows: unknown[];
  totalCount: number;
}) {
  const query = {
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    ilike: vi.fn(() => query),
    in: vi.fn(() => query),
    lte: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(async () => ({
      count: input.totalCount,
      data: input.rows,
      error: null,
    })),
    select: vi.fn(() => query),
    then<TResult1 = { data: unknown[]; error: null }>(
      onfulfilled?:
        | ((value: { data: unknown[]; error: null }) => TResult1)
        | null
    ) {
      return Promise.resolve({ data: [], error: null }).then(onfulfilled);
    },
  };
  const client = {
    from: vi.fn(() => query),
  };

  return { client, query };
}
