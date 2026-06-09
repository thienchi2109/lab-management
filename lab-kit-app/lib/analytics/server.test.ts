import { describe, expect, test, vi } from "vitest";

import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  DashboardOverviewAccessError,
  createSupabaseDashboardOverviewPort,
  getDashboardOverviewPage,
} from "./server";
import type { AnalyticsQuery } from "./query";

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

  test("rejects malformed Supabase clients before building queries", () => {
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      {} as ReturnType<typeof getSupabaseAdminClient>
    );

    expect(() => createSupabaseDashboardOverviewPort()).toThrow(
      "Supabase dashboard source không hợp lệ."
    );
  });

  test("rejects non-positive read limits before applying Supabase ranges", async () => {
    const { client, query } = createDashboardClientDouble();
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const port = createSupabaseDashboardOverviewPort();
    await expect(
      port.listRecentSamples({
        limit: 0,
        organizationId: "org-1",
        receivedFrom: "2026-06-03",
        receivedTo: "2026-06-09",
      })
    ).rejects.toThrow("Giới hạn đọc dashboard phải lớn hơn 0.");

    expect(query.range).not.toHaveBeenCalled();
  });

  test("fetches PCR rows while conclusion totals are still loading", async () => {
    const conclusions = createDeferredQuery([
      { kq_chung: "sạch", sample_id: "sample-1" },
    ]);
    const results = createDeferredQuery([
      {
        result_metric_id: "metric-1",
        sample_id: "sample-1",
        value: { status: "positive", ct: 31 },
      },
    ]);
    const metrics = createDeferredQuery([
      { code: "WSSV", id: "metric-1", name: "WSSV" },
    ]);
    const { client } = createDashboardClientDouble({
      conclusionsQuery: conclusions.query,
      metricsQuery: metrics.query,
      resultsQuery: results.query,
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const promise = createSupabaseDashboardOverviewPort().listDataset({
      organizationId: "org-1",
      query: createAnalyticsQuery({ dimensions: ["pcrMetric"] }),
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(results.query.select).toHaveBeenCalledWith(
      "sample_id, result_metric_id, value"
    );

    conclusions.resolve();
    results.resolve();
    await Promise.resolve();
    metrics.resolve();
    await expect(promise).resolves.toMatchObject({
      rows: [
        {
          dimensionValues: { pcrMetric: "WSSV" },
          measureValues: { positiveCount: 1, sampleCount: 1 },
        },
      ],
    });
  });

  test("counts PCR positives from status only", async () => {
    const { client } = createDashboardClientDouble({
      resultsRows: [
        {
          result_metric_id: "metric-1",
          sample_id: "sample-1",
          value: { note: "POSITIVE label", status: "negative" },
        },
        {
          result_metric_id: "metric-1",
          sample_id: "sample-2",
          value: { status: "positive" },
        },
      ],
      sampleRows: [
        createSampleRow("sample-1", "T06_00124"),
        createSampleRow("sample-2", "T06_00125"),
      ],
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const result = await createSupabaseDashboardOverviewPort().listDataset({
      organizationId: "org-1",
      query: createAnalyticsQuery({ dimensions: ["pcrMetric"] }),
    });

    expect(result.rows).toEqual([
      {
        dimensionValues: { pcrMetric: "WSSV" },
        measureValues: { positiveCount: 1, sampleCount: 2 },
      },
    ]);
  });
});

function createDashboardClientDouble(
  options: {
    conclusionsQuery?: unknown;
    metricsQuery?: unknown;
    resultsQuery?: unknown;
    resultsRows?: Array<{
      result_metric_id: string;
      sample_id: string;
      value: unknown;
    }>;
    sampleRows?: ReturnType<typeof createSampleRow>[];
  } = {}
) {
  const sampleRows = options.sampleRows ?? [
    createSampleRow("sample-1", "T06_00124"),
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
      data: options.resultsRows ?? [
        {
          result_metric_id: "metric-1",
          sample_id: "sample-1",
          value: { status: "negative" },
        },
      ],
      error: null,
    })),
    select: vi.fn(() => resultsQuery),
  };
  const metricsQuery = {
    eq: vi.fn(() => metricsQuery),
    in: vi.fn(async () => ({
      data: [{ code: "WSSV", id: "metric-1", name: "WSSV" }],
      error: null,
    })),
    select: vi.fn(() => metricsQuery),
  };
  const client = {
    from: vi.fn((table: string) => {
      if (table === "kits") return kitsQuery;
      if (table === "sample_group_conclusions") {
        return options.conclusionsQuery ?? conclusionsQuery;
      }
      if (table === "sample_results")
        return options.resultsQuery ?? resultsQuery;
      if (table === "result_metrics")
        return options.metricsQuery ?? metricsQuery;

      return query;
    }),
  };

  return { client, query };
}

function createAnalyticsQuery(
  options: Partial<Pick<AnalyticsQuery, "dimensions" | "limit">> = {}
): AnalyticsQuery {
  return {
    dimensions: options.dimensions ?? ["receivedDate"],
    filterSummary: [],
    filters: { receivedFrom: "2026-06-03", receivedTo: "2026-06-09" },
    limit: options.limit ?? 5,
    measures: ["sampleCount", "positiveCount"],
    offset: 0,
    page: 1,
    pageSize: options.limit ?? 5,
  };
}

function createDeferredQuery<T>(data: T[]) {
  let resolve!: () => void;
  const pending = new Promise<{ data: T[]; error: null }>((done) => {
    resolve = () => done({ data, error: null });
  });
  const query = {
    eq: vi.fn(() => query),
    in: vi.fn(() => pending),
    select: vi.fn(() => query),
  };

  return { query, resolve };
}

function createSampleRow(id: string, sampleCode: string) {
  return {
    customer_name: "Công ty Thủy sản Hùng Vương",
    id,
    received_at: "2026-06-09T08:00:00.000Z",
    sample_code: sampleCode,
    sample_types: { name: "Tôm thẻ chân trắng" },
    status: "completed",
  };
}
