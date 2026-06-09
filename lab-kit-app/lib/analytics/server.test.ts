import { describe, expect, test, vi } from "vitest";

import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  DashboardOverviewAccessError,
  createSupabaseDashboardOverviewPort,
  getDashboardOverviewPage,
} from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("dashboard overview server data", () => {
  test("allows active viewers to load dashboard overview data", async () => {
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
    const { client } = createDashboardClientDouble();
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const page = await getDashboardOverviewPage({
      now: new Date("2026-06-09T12:00:00.000Z"),
    });

    expect(page.stats.totalSamples.value).toBe("1");
    expect(page.stats.cleanSamples.value).toBe("1 mẫu");
    expect(page.recentSamples).toEqual([
      expect.objectContaining({
        code: "T06_00124",
        customer: "Công ty Thủy sản Hùng Vương",
      }),
    ]);
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

    await expect(getDashboardOverviewPage()).rejects.toBeInstanceOf(
      DashboardOverviewAccessError
    );
    expect(from).not.toHaveBeenCalled();
  });

  test("applies tenant date bounds and limit to recent sample reads", async () => {
    const { client, query } = createDashboardClientDouble();
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const port = createSupabaseDashboardOverviewPort();
    const rows = await port.listRecentSamples({
      limit: 5,
      organizationId: "org-1",
      receivedFrom: "2026-06-03",
      receivedTo: "2026-06-09",
    });

    expect(rows).toEqual([
      expect.objectContaining({
        sampleCode: "T06_00124",
        sampleTypeName: "Tôm thẻ chân trắng",
      }),
    ]);
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(query.gte).toHaveBeenCalledWith("received_at", "2026-06-03");
    expect(query.lte).toHaveBeenCalledWith("received_at", "2026-06-09");
    expect(query.order).toHaveBeenCalledWith("received_at", {
      ascending: false,
    });
    expect(query.range).toHaveBeenCalledWith(0, 4);
  });
});

function createDashboardClientDouble() {
  const sampleRows = [
    {
      customer_name: "Công ty Thủy sản Hùng Vương",
      id: "sample-1",
      received_at: "2026-06-09T08:00:00.000Z",
      sample_code: "T06_00124",
      sample_types: { name: "Tôm thẻ chân trắng" },
      status: "completed",
    },
  ];
  const query = {
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    in: vi.fn(() => query),
    lte: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(async () => ({
      data: sampleRows,
      error: null,
    })),
    select: vi.fn(() => query),
  };
  const kitsQuery = {
    eq: vi.fn(async () => ({
      data: [{ status: "in_stock" }, { status: "used" }],
      error: null,
    })),
    select: vi.fn(() => kitsQuery),
  };
  const conclusionsQuery = {
    eq: vi.fn(() => conclusionsQuery),
    in: vi.fn(async () => ({
      data: [{ kq_chung: "sạch", sample_id: "sample-1" }],
      error: null,
    })),
    select: vi.fn(() => conclusionsQuery),
  };
  const resultsQuery = {
    eq: vi.fn(() => resultsQuery),
    in: vi.fn(async () => ({
      data: [],
      error: null,
    })),
    select: vi.fn(() => resultsQuery),
  };
  const metricsQuery = {
    eq: vi.fn(() => metricsQuery),
    in: vi.fn(async () => ({
      data: [],
      error: null,
    })),
    select: vi.fn(() => metricsQuery),
  };
  const client = {
    from: vi.fn((table: string) => {
      if (table === "kits") return kitsQuery;
      if (table === "sample_group_conclusions") return conclusionsQuery;
      if (table === "sample_results") return resultsQuery;
      if (table === "result_metrics") return metricsQuery;

      return query;
    }),
  };

  return { client, query };
}
