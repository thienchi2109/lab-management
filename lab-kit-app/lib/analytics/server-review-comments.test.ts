import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseDashboardOverviewPort } from "./server";
import type { AnalyticsQuery } from "./query";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("dashboard overview review comment regressions", () => {
  test("counts kits with Supabase count queries", async () => {
    const totalQuery = createCountQuery(8, [
      ...Array.from({ length: 5 }, () => ({ status: "in_stock" })),
      ...Array.from({ length: 3 }, () => ({ status: "used" })),
    ]);
    const availableQuery = createCountQuery(5);
    const client = {
      from: vi.fn(() =>
        client.from.mock.calls.length === 1 ? totalQuery : availableQuery
      ),
    };
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    await expect(
      createSupabaseDashboardOverviewPort().countKits({
        organizationId: "org-1",
      })
    ).resolves.toEqual({ available: 5, total: 8 });

    expect(client.from).toHaveBeenCalledTimes(2);
    expect(totalQuery.select).toHaveBeenCalledWith("id", {
      count: "exact",
      head: true,
    });
    expect(availableQuery.eq).toHaveBeenCalledWith("status", "in_stock");
  });

  test("counts each sample once per PCR metric title", async () => {
    const client = createAnalyticsClientDouble();
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    await expect(
      createSupabaseDashboardOverviewPort().listDataset({
        organizationId: "org-1",
        query: createAnalyticsQuery(),
      })
    ).resolves.toMatchObject({
      rows: [
        {
          dimensionValues: { pcrMetric: "WSSV" },
          measureValues: { positiveCount: 1, sampleCount: 2 },
        },
      ],
    });
  });
});

function createCountQuery(count: number, data: unknown[] = []) {
  const query = {
    eq: vi.fn(() => query),
    select: vi.fn(() => query),
    then<
      TResult1 = { count: number; data: unknown[]; error: null },
      TResult2 = never,
    >(
      resolve?: (value: {
        count: number;
        data: unknown[];
        error: null;
      }) => TResult1,
      reject?: (reason: unknown) => TResult2
    ) {
      return Promise.resolve({ count, data, error: null }).then(
        resolve,
        reject
      );
    },
  };

  return query;
}

function createAnalyticsClientDouble() {
  const samplesQuery = {
    eq: vi.fn(() => samplesQuery),
    gte: vi.fn(() => samplesQuery),
    lte: vi.fn(() => samplesQuery),
    order: vi.fn(() => samplesQuery),
    range: vi.fn(async () => ({
      data: [
        createSampleRow("sample-1", "T06_00124"),
        createSampleRow("sample-2", "T06_00125"),
      ],
      error: null,
    })),
    select: vi.fn(() => samplesQuery),
  };
  const conclusionsQuery = {
    eq: vi.fn(() => conclusionsQuery),
    in: vi.fn(async () => ({ data: [], error: null })),
    select: vi.fn(() => conclusionsQuery),
  };
  const resultsQuery = {
    eq: vi.fn(() => resultsQuery),
    in: vi.fn(async () => ({
      data: [
        {
          result_metric_id: "metric-1",
          sample_id: "sample-1",
          value: { status: "positive" },
        },
        {
          result_metric_id: "metric-1",
          sample_id: "sample-1",
          value: { status: "negative" },
        },
        {
          result_metric_id: "metric-1",
          sample_id: "sample-2",
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

  return {
    from(table: string) {
      if (table === "sample_group_conclusions") return conclusionsQuery;
      if (table === "sample_results") return resultsQuery;
      if (table === "result_metrics") return metricsQuery;

      return samplesQuery;
    },
  };
}

function createAnalyticsQuery(): AnalyticsQuery {
  return {
    dimensions: ["pcrMetric"],
    filterSummary: [],
    filters: { receivedFrom: "2026-06-03", receivedTo: "2026-06-09" },
    limit: 5,
    measures: ["sampleCount", "positiveCount"],
    offset: 0,
    page: 1,
    pageSize: 5,
  };
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
