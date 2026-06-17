import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  DEFAULT_SAMPLE_GRID_PAGE_SIZE,
  MAX_SAMPLE_GRID_PAGE_SIZE,
  parseSampleGridQuery,
} from "./query";

const querySource = readFileSync(
  join(process.cwd(), "lib/sample-grid/query.ts"),
  "utf8"
);

describe("sample grid query parser", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("uses stable defaults for an empty search param set", () => {
    const query = parseSampleGridQuery({});

    expect(query).toEqual({
      filters: {
        receivedFrom: "2026-05-30",
        receivedTo: "2026-06-08",
      },
      limit: DEFAULT_SAMPLE_GRID_PAGE_SIZE,
      offset: 0,
      page: 1,
      pageSize: DEFAULT_SAMPLE_GRID_PAGE_SIZE,
      resultColumnKeys: [],
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

  test("normalizes filter contract and keeps newest-first sort fixed", () => {
    const resultGroupId = "11111111-1111-4111-8111-111111111111";
    const query = parseSampleGridQuery({
      billingStatus: "paid",
      companyId: "company-1",
      companyName: "  Công ty   Minh Phú  ",
      customerId: "customer-1",
      customerName: "  Nguyễn   Văn A  ",
      kitBatchId: "batch-1",
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
      resultGroupIds: [resultGroupId],
      sampleTypeId: "type-1",
      sort: "customerName",
      status: "in_progress",
      unsafe: "organization_id:other-org",
    });

    expect(query.filters).toEqual({
      billingStatus: "paid",
      companyId: "company-1",
      companyName: "Công ty Minh Phú",
      customerId: "customer-1",
      customerName: "Nguyễn Văn A",
      kitBatchId: "batch-1",
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
      resultGroupIds: [resultGroupId],
      sampleTypeId: "type-1",
      status: "in_progress",
    });
    expect(query.sort).toEqual({ direction: "desc", key: "receivedAt" });
  });

  test("falls back safely for invalid page, filter, and sort input", () => {
    const query = parseSampleGridQuery({
      billingStatus: "late",
      dir: "sideways",
      receivedFrom: "2026-02-31",
      receivedTo: "2026-13-45",
      page: "-10",
      pageSize: "0",
      sort: "organization_id",
      status: "deleted",
    });

    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(DEFAULT_SAMPLE_GRID_PAGE_SIZE);
    expect(query.filters).toEqual({
      receivedFrom: "2026-05-30",
      receivedTo: "2026-06-08",
    });
    expect(query.sort).toEqual({ direction: "desc", key: "receivedAt" });
  });

  test("fills a missing date boundary from the default received range", () => {
    const query = parseSampleGridQuery({
      receivedFrom: "2026-06-01",
    });

    expect(query.filters).toMatchObject({
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-08",
    });
  });

  test("whitelists bounded result group and metric column keys", () => {
    const query = parseSampleGridQuery({
      resultColumns: [
        "metric:metric-1,group:group-1",
        "metric:bad/value",
        "group:group-2",
        "metric:metric-3",
      ],
    });

    expect(query.resultColumnKeys).toEqual([
      "metric:metric-1",
      "group:group-1",
      "group:group-2",
    ]);
  });

  test("whitelists deduped result group filters from repeated params", () => {
    const firstGroupId = "11111111-1111-4111-8111-111111111111";
    const secondGroupId = "22222222-2222-4222-8222-222222222222";
    const ignoredGroupId = "not-a-uuid";

    const query = parseSampleGridQuery({
      resultGroupIds: [
        firstGroupId,
        ignoredGroupId,
        secondGroupId,
        firstGroupId,
      ],
    });

    expect(query.filters.resultGroupIds).toEqual([firstGroupId, secondGroupId]);
  });

  test("uses a set for result column de-duplication inside the parser loop", () => {
    const parserBody = querySource.slice(
      querySource.indexOf("function parseResultColumnKeys"),
      querySource.indexOf("function normalizeSearch")
    );

    expect(parserBody).toContain("new Set");
    expect(parserBody).not.toContain("keys.includes");
  });
});
