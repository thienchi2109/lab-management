import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

import { listSampleGridResultSummaries } from "./result-summary-server";

const mapperSource = readFileSync(
  join(process.cwd(), "lib/sample-grid/result-summary-mapper.ts"),
  "utf8"
);

describe("listSampleGridResultSummaries", () => {
  test("keeps row grouping linear by appending to existing arrays", () => {
    expect(mapperSource).not.toContain("[...(groups.get(value) ?? []), row]");
    expect(mapperSource).toContain("group.push(row)");
  });

  test("loads result summaries with page-scoped sample ids", async () => {
    const { client, calls } = createSupabaseDouble({
      result_groups: [
        { id: "group-1", code: "PCR", name: "PCR", sort_order: 10 },
      ],
      result_metrics: [
        {
          id: "metric-1",
          result_group_id: "group-1",
          code: "WSSV",
          name: "WSSV",
          sort_order: 10,
        },
      ],
      result_template_metrics: [
        {
          result_template_id: "template-1",
          result_metric_id: "metric-1",
          sort_order: 10,
        },
      ],
      result_templates: [
        {
          id: "template-1",
          sample_type_id: "sample-type-1",
          created_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      sample_group_conclusions: [
        {
          sample_id: "sample-1",
          result_group_id: "group-1",
          kq_chung: "NHIỄM",
        },
      ],
      sample_results: [
        {
          sample_id: "sample-1",
          result_metric_id: "metric-1",
          value: "Dương tính",
        },
      ],
      samples: [{ id: "sample-1", sample_type_id: "sample-type-1" }],
    });

    const summaries = await listSampleGridResultSummaries(
      client as unknown as Parameters<typeof listSampleGridResultSummaries>[0],
      {
        organizationId: "org-1",
        sampleIds: ["sample-1"],
      }
    );

    expect(calls).toContainEqual({
      table: "samples",
      type: "in",
      column: "id",
      values: ["sample-1"],
    });
    expect(calls).toContainEqual({
      table: "sample_results",
      type: "in",
      column: "sample_id",
      values: ["sample-1"],
    });
    expect(summaries["sample-1"]).toEqual({
      groups: [
        {
          id: "group-1",
          code: "PCR",
          name: "PCR",
          kqChung: "NHIỄM",
          enteredMetrics: 1,
          totalMetrics: 1,
          metrics: [
            {
              id: "metric-1",
              code: "WSSV",
              name: "WSSV",
              value: "Dương tính",
            },
          ],
        },
      ],
    });
  });

  test("logs the original query error before throwing a sanitized message", async () => {
    const error = new Error("permission denied for samples");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { client } = createSupabaseDouble({}, { samples: error });

    try {
      await expect(
        listSampleGridResultSummaries(
          client as unknown as Parameters<
            typeof listSampleGridResultSummaries
          >[0],
          {
            organizationId: "org-1",
            sampleIds: ["sample-1"],
          }
        )
      ).rejects.toThrow("Không thể tải mẫu cho summary kết quả.");
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to fetch sample grid result summary rows:",
        error
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  test("starts page-scoped result reads before the template-dependent chain", async () => {
    const { client, queryStarts } = createSupabaseDouble({
      result_groups: [
        { id: "group-1", code: "PCR", name: "PCR", sort_order: 10 },
      ],
      result_metrics: [
        {
          id: "metric-1",
          result_group_id: "group-1",
          code: "WSSV",
          name: "WSSV",
          sort_order: 10,
        },
      ],
      result_template_metrics: [
        {
          result_template_id: "template-1",
          result_metric_id: "metric-1",
          sort_order: 10,
        },
      ],
      result_templates: [
        {
          id: "template-1",
          sample_type_id: "sample-type-1",
          created_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      sample_group_conclusions: [],
      sample_results: [],
      samples: [{ id: "sample-1", sample_type_id: "sample-type-1" }],
    });

    await listSampleGridResultSummaries(
      client as unknown as Parameters<typeof listSampleGridResultSummaries>[0],
      {
        organizationId: "org-1",
        sampleIds: ["sample-1"],
      }
    );

    expect(queryStarts.indexOf("sample_results")).toBeLessThan(
      queryStarts.indexOf("result_templates")
    );
    expect(queryStarts.indexOf("sample_group_conclusions")).toBeLessThan(
      queryStarts.indexOf("result_templates")
    );
  });
});

function createSupabaseDouble(
  tables: Record<string, Array<Record<string, unknown>>>,
  errors: Record<string, unknown> = {}
) {
  const calls: Array<Record<string, unknown>> = [];
  const queryStarts: string[] = [];
  const client = {
    from(table: string) {
      return {
        select() {
          return createQuery(
            table,
            tables[table] ?? [],
            calls,
            queryStarts,
            errors[table]
          );
        },
      };
    },
  };

  return { calls, client, queryStarts };
}

function createQuery(
  table: string,
  rows: Array<Record<string, unknown>>,
  calls: Array<Record<string, unknown>>,
  queryStarts: string[],
  error: unknown
) {
  const filters: Array<(row: Record<string, unknown>) => boolean> = [];
  const query = {
    eq(column: string, value: unknown) {
      calls.push({ table, type: "eq", column, value });
      filters.push(
        (row) =>
          row[column] === value ||
          column === "organization_id" ||
          column === "is_active"
      );
      return query;
    },
    in(column: string, values: string[]) {
      calls.push({ table, type: "in", column, values });
      filters.push((row) => values.includes(String(row[column])));
      return query;
    },
    order() {
      return query;
    },
    then(
      resolve: (value: { data: typeof rows | null; error: unknown }) => void
    ) {
      queryStarts.push(table);
      resolve({
        data: error
          ? null
          : rows.filter((row) => filters.every((fn) => fn(row))),
        error,
      });
    },
  };

  return query;
}
