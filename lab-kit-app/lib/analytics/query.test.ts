import { describe, expect, test } from "vitest";

import {
  AnalyticsQueryValidationError,
  DEFAULT_ANALYTICS_PAGE_SIZE,
  MAX_ANALYTICS_PAGE_SIZE,
  parseAnalyticsQuery,
} from "./query";

describe("analytics query contract", () => {
  test("uses stable defaults for the minimum analytics query", () => {
    const query = parseAnalyticsQuery({});

    expect(query).toEqual({
      dimensions: ["receivedDate"],
      filterSummary: ["Chưa áp dụng bộ lọc"],
      filters: {},
      limit: DEFAULT_ANALYTICS_PAGE_SIZE,
      measures: ["sampleCount"],
      offset: 0,
      page: 1,
      pageSize: DEFAULT_ANALYTICS_PAGE_SIZE,
    });
  });

  test("parses whitelisted dimensions, measures, filters, and pagination", () => {
    const query = parseAnalyticsQuery({
      dimensions: ["receivedDate", "company", "resultGroup"],
      filters: {
        companyId: "company-1",
        receivedFrom: "2026-06-01",
        receivedTo: "2026-06-08",
        status: "received",
      },
      measures: ["sampleCount", "positiveCount"],
      page: 3,
      pageSize: MAX_ANALYTICS_PAGE_SIZE + 500,
    });

    expect(query).toEqual({
      dimensions: ["receivedDate", "company", "resultGroup"],
      filters: {
        companyId: "company-1",
        receivedFrom: "2026-06-01",
        receivedTo: "2026-06-08",
        status: "received",
      },
      filterSummary: [
        "Từ 01/06/2026 đến 08/06/2026",
        "Công ty đã chọn",
        "Trạng thái: Đã nhận",
      ],
      limit: MAX_ANALYTICS_PAGE_SIZE,
      measures: ["sampleCount", "positiveCount"],
      offset: MAX_ANALYTICS_PAGE_SIZE * 2,
      page: 3,
      pageSize: MAX_ANALYTICS_PAGE_SIZE,
    });
  });

  test("rejects dimensions, measures, and filter keys outside the whitelist", () => {
    expect(() =>
      parseAnalyticsQuery({
        dimensions: ["rawSql"],
        filters: { rawSql: "select * from samples" },
        measures: ["sampleCount"],
      })
    ).toThrow(AnalyticsQueryValidationError);

    expect(() =>
      parseAnalyticsQuery({
        dimensions: ["receivedDate"],
        measures: ["dropTable"],
      })
    ).toThrow(AnalyticsQueryValidationError);
  });

  test("rejects invalid date, id, status, and pagination input", () => {
    expect(() =>
      parseAnalyticsQuery({
        filters: {
          companyId: "company/1",
          receivedFrom: "2026-02-31",
          status: "deleted",
        },
        page: 0,
      })
    ).toThrow(AnalyticsQueryValidationError);
  });

  test("formats a received-to-only filter summary without undefined date parts", () => {
    const query = parseAnalyticsQuery({
      filters: { receivedTo: "2026-06-08" },
    });

    expect(query.filterSummary).toEqual(["Đến 08/06/2026"]);
  });

  test("rejects extremely large page offsets", () => {
    expect(() =>
      parseAnalyticsQuery({
        filters: { receivedFrom: "2026-06-01" },
        page: 1_000_001,
      })
    ).toThrow(AnalyticsQueryValidationError);
  });
});
