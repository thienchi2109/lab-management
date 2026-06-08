import { describe, expect, test } from "vitest";

import {
  DEFAULT_SAMPLE_GRID_PAGE_SIZE,
  MAX_SAMPLE_GRID_PAGE_SIZE,
  parseSampleGridQuery,
} from "./query";

describe("sample grid query parser", () => {
  test("uses stable defaults for an empty search param set", () => {
    const query = parseSampleGridQuery({});

    expect(query).toEqual({
      filters: {},
      limit: DEFAULT_SAMPLE_GRID_PAGE_SIZE,
      offset: 0,
      page: 1,
      pageSize: DEFAULT_SAMPLE_GRID_PAGE_SIZE,
      search: null,
      sort: { direction: "desc", key: "receivedAt" },
    });
  });

  test("caps pagination and trims bounded search text", () => {
    const query = parseSampleGridQuery({
      page: "3",
      pageSize: String(MAX_SAMPLE_GRID_PAGE_SIZE + 500),
      search: `  ${"T6_00012 ".repeat(20)}  `,
    });

    expect(query.page).toBe(3);
    expect(query.pageSize).toBe(MAX_SAMPLE_GRID_PAGE_SIZE);
    expect(query.limit).toBe(MAX_SAMPLE_GRID_PAGE_SIZE);
    expect(query.offset).toBe(MAX_SAMPLE_GRID_PAGE_SIZE * 2);
    expect(query.search?.length).toBeLessThanOrEqual(100);
    expect(query.search?.startsWith("T6_00012")).toBe(true);
  });

  test("keeps only whitelisted filters and sort keys", () => {
    const query = parseSampleGridQuery({
      billingStatus: "paid",
      companyId: "company-1",
      kitBatchId: "batch-1",
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
      sampleTypeId: "type-1",
      sort: "customerName",
      status: "in_progress",
      unsafe: "organization_id:other-org",
    });

    expect(query.filters).toEqual({
      billingStatus: "paid",
      companyId: "company-1",
      kitBatchId: "batch-1",
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
      sampleTypeId: "type-1",
      status: "in_progress",
    });
    expect(query.sort).toEqual({ direction: "asc", key: "customerName" });
  });

  test("falls back safely for invalid page, filter, and sort input", () => {
    const query = parseSampleGridQuery({
      billingStatus: "late",
      dir: "sideways",
      page: "-10",
      pageSize: "0",
      sort: "organization_id",
      status: "deleted",
    });

    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(DEFAULT_SAMPLE_GRID_PAGE_SIZE);
    expect(query.filters).toEqual({});
    expect(query.sort).toEqual({ direction: "desc", key: "receivedAt" });
  });
});
