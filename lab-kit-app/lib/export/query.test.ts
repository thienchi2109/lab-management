import { describe, expect, test } from "vitest";

import {
  DEFAULT_EXPORT_ROW_LIMIT,
  EXPORT_HARD_ROW_LIMIT,
  ExportQueryValidationError,
  parseExportQuery,
} from "./query";

describe("export query contract", () => {
  test("rejects raw SQL, free table names, and unknown fields", () => {
    expect(() =>
      parseExportQuery({
        dataset: "samples",
        fields: ["sampleCode", "raw_sql"],
        format: "csv",
        rawSql: "select * from samples",
        table: "tenant_memberships",
      })
    ).toThrow(ExportQueryValidationError);
  });

  test("rejects unknown format and invalid sort or filter input", () => {
    expect(() =>
      parseExportQuery({
        dataset: "samples",
        fields: ["sampleCode"],
        filters: {
          receivedFrom: "2026-02-31",
          status: "deleted",
        },
        format: "pdf",
        sort: { direction: "sideways", key: "organization_id" },
      })
    ).toThrow(ExportQueryValidationError);
  });

  test("rejects row limits above the MVP hard cap", () => {
    expect(() =>
      parseExportQuery({
        dataset: "samples",
        fields: ["sampleCode"],
        format: "xlsx",
        rowLimit: EXPORT_HARD_ROW_LIMIT + 1,
      })
    ).toThrow("Vượt giới hạn số dòng export.");
  });

  test("normalizes a bounded sample export query", () => {
    expect(
      parseExportQuery({
        dataset: "samples",
        fields: ["sampleCode", "customerName", "status"],
        filters: {
          companyId: "company-1",
          receivedFrom: "2026-06-01",
          status: "in_progress",
        },
        format: "csv",
        search: "  T6_00012   ",
        sort: { direction: "asc", key: "customerName" },
      })
    ).toEqual({
      dataset: "samples",
      fields: ["sampleCode", "customerName", "status"],
      filters: {
        companyId: "company-1",
        receivedFrom: "2026-06-01",
        status: "in_progress",
      },
      format: "csv",
      rowLimit: DEFAULT_EXPORT_ROW_LIMIT,
      search: "T6_00012",
      sort: { direction: "asc", key: "customerName" },
    });
  });
});
