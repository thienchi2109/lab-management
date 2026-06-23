import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseReportKitAnalyticsPort } from "./server-report-kit";
import type { ReportKitAnalyticsQuery } from "./report-kit";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("report kit analytics Supabase adapter", () => {
  test("reads bounded organization-scoped report rows", async () => {
    const { client, conclusionsQuery, samplesQuery } = createClientDouble();
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const rows = await createSupabaseReportKitAnalyticsPort().listReportRows({
      organizationId: "org-1",
      query: createAnalyticsQuery(),
    });

    expect(rows).toEqual([
      {
        companyId: "company-1",
        customerId: null,
        customerName: "Công ty A",
        generalPcrConclusion: "SẠCH",
        kitBatchId: "batch-1",
        kitTypeName: "KIT PCR A",
        sampleId: "sample-1",
        sampleTypeName: "tôm PL",
      },
    ]);
    expect(samplesQuery.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(samplesQuery.gte).toHaveBeenCalledWith("received_at", "2026-06-01");
    expect(samplesQuery.lte).toHaveBeenCalledWith("received_at", "2026-06-08");
    expect(samplesQuery.range).toHaveBeenCalledWith(0, 49);
    expect(conclusionsQuery.eq).toHaveBeenCalledWith(
      "organization_id",
      "org-1"
    );
    expect(conclusionsQuery.in).toHaveBeenCalledWith("sample_id", ["sample-1"]);
  });
});

function createClientDouble() {
  const samplesQuery = {
    eq: vi.fn(() => samplesQuery),
    gte: vi.fn(() => samplesQuery),
    lte: vi.fn(() => samplesQuery),
    order: vi.fn(() => samplesQuery),
    range: vi.fn(async () => ({
      data: [
        {
          company_id: "company-1",
          customer_id: null,
          customer_name: "Công ty A",
          id: "sample-1",
          kit_batch_id: "batch-1",
          kit_batches: { kit_types: { name: "KIT PCR A" } },
          sample_types: { name: "tôm PL" },
        },
      ],
      error: null,
    })),
    select: vi.fn(() => samplesQuery),
  };
  const conclusionsQuery = {
    eq: vi.fn(() => conclusionsQuery),
    in: vi.fn(async () => ({
      data: [{ kq_chung: "SẠCH", sample_id: "sample-1" }],
      error: null,
    })),
    select: vi.fn(() => conclusionsQuery),
  };
  const client = {
    from: vi.fn((table: string) => {
      if (table === "sample_group_conclusions") return conclusionsQuery;

      return samplesQuery;
    }),
  };

  return { client, conclusionsQuery, samplesQuery };
}

function createAnalyticsQuery(): ReportKitAnalyticsQuery {
  return {
    charts: ["kitQuantityBySampleType"],
    dimensions: ["sampleType"],
    filterSummary: [],
    filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
    limit: 50,
    measures: ["sampleCount"],
    offset: 0,
    page: 1,
    pageSize: 50,
  };
}
