import { describe, expect, test, vi } from "vitest";

import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  SampleGridAccessError,
  createSupabaseSampleGridPort,
  getSampleGridPage,
} from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("sample grid server contract", () => {
  test("allows active viewers to read a tenant-scoped page", async () => {
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
          received_at: "2026-06-08T08:00:00.000Z",
          sample_code: "T6_00012",
          sample_type_id: "type-1",
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
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
          status: "received",
        },
        limit: 10,
        offset: 20,
        page: 3,
        pageSize: 10,
        search: "T6_00012",
        sort: { direction: "desc", key: "receivedAt" },
      },
    });

    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining("sample_code"),
      { count: "exact" }
    );
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(query.eq).toHaveBeenCalledWith("status", "received");
    expect(query.eq).toHaveBeenCalledWith("billing_status", "unpaid");
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
});

function createSupabaseClientDouble(input: {
  rows: unknown[];
  totalCount: number;
}) {
  const query = {
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    lte: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(async () => ({
      count: input.totalCount,
      data: input.rows,
      error: null,
    })),
    select: vi.fn(() => query),
  };
  const client = {
    from: vi.fn(() => query),
  };

  return { client, query };
}
