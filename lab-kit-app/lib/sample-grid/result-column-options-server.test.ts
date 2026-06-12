import { describe, expect, test } from "vitest";

import { listSampleGridResultColumnOptions } from "./result-column-options-server";
import type { SupabaseLike } from "./result-summary-server";

describe("sample grid result column options server", () => {
  test("loads stable group and metric column options from active templates", async () => {
    const calls: unknown[] = [];
    const supabase = createSupabase(
      {
        result_templates: [
          {
            id: "template-1",
            organization_id: "org-1",
            sample_type_id: "sample-type-1",
            is_active: true,
          },
        ],
        result_template_metrics: [
          {
            result_template_id: "template-1",
            result_metric_id: "metric-2",
            organization_id: "org-1",
            sort_order: 20,
          },
          {
            result_template_id: "template-1",
            result_metric_id: "metric-1",
            organization_id: "org-1",
            sort_order: 10,
          },
        ],
        result_metrics: [
          {
            id: "metric-1",
            organization_id: "org-1",
            result_group_id: "group-1",
            name: "WSSV",
            sort_order: 10,
            is_active: true,
          },
          {
            id: "metric-2",
            organization_id: "org-1",
            result_group_id: "group-2",
            name: "Vibrio",
            sort_order: 20,
            is_active: true,
          },
        ],
        result_groups: [
          {
            id: "group-1",
            organization_id: "org-1",
            name: "PCR",
            sort_order: 10,
            is_active: true,
          },
          {
            id: "group-2",
            organization_id: "org-1",
            name: "Vi sinh",
            sort_order: 20,
            is_active: true,
          },
        ],
      },
      calls
    );

    await expect(
      listSampleGridResultColumnOptions(supabase, {
        organizationId: "org-1",
        sampleTypeId: "sample-type-1",
      })
    ).resolves.toEqual([
      { key: "group:group-1", label: "PCR" },
      { key: "metric:metric-1", label: "PCR / WSSV" },
      { key: "group:group-2", label: "Vi sinh" },
      { key: "metric:metric-2", label: "Vi sinh / Vibrio" },
    ]);
    expect(calls).toContainEqual({
      table: "result_templates",
      type: "eq",
      column: "sample_type_id",
      value: "sample-type-1",
    });
  });
});

function createSupabase(
  rowsByTable: Record<string, Array<Record<string, unknown>>>,
  calls: unknown[]
): SupabaseLike {
  return {
    from<T>(table: string) {
      return {
        select() {
          return createQuery<T>(table, rowsByTable[table] ?? [], calls);
        },
      };
    },
  };
}

function createQuery<T>(
  table: string,
  rows: Array<Record<string, unknown>>,
  calls: unknown[]
) {
  const filters: Array<(row: Record<string, unknown>) => boolean> = [];
  const query = {
    eq(column: string, value: unknown) {
      calls.push({ table, type: "eq", column, value });
      filters.push((row) => row[column] === value);
      return query;
    },
    in(column: string, values: string[]) {
      calls.push({ table, type: "in", column, values });
      filters.push((row) => values.includes(String(row[column])));
      return query;
    },
    order(column: string, options?: { ascending: boolean }) {
      calls.push({ table, type: "order", column, options });
      return query;
    },
    then<TResult1 = { data: T[]; error: null }, TResult2 = never>(
      onfulfilled?:
        | ((value: {
            data: T[];
            error: null;
          }) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null
    ) {
      return Promise.resolve({
        data: rows.filter((row) =>
          filters.every((filter) => filter(row))
        ) as T[],
        error: null,
      }).then(onfulfilled, onrejected);
    },
  };

  return query;
}
