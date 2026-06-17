type TableRows = Record<string, Array<Record<string, unknown>>>;

/** Tạo Supabase test double đọc nhiều bảng option và ghi lại filter calls. */
export function createSupabaseOptionsDouble(rowsByTable: TableRows) {
  const calls: unknown[] = [];
  const client = {
    from(table: string) {
      return {
        select() {
          return createOptionsQuery(table, rowsByTable[table] ?? [], calls);
        },
      };
    },
  };

  return { calls, client };
}

function createOptionsQuery(
  table: string,
  rows: Array<Record<string, unknown>>,
  calls: unknown[]
) {
  const filters: Array<(row: Record<string, unknown>) => boolean> = [];
  const query = {
    eq(column: string, value: unknown) {
      calls.push({ column, table, type: "eq", value });
      filters.push((row) => row[column] === value);
      return query;
    },
    in(column: string, values: string[]) {
      calls.push({ column, table, type: "in", values });
      filters.push((row) => values.includes(String(row[column])));
      return query;
    },
    order(column: string, options?: { ascending: boolean }) {
      calls.push({ column, options, table, type: "order" });
      return query;
    },
    then<TResult1 = { data: Array<Record<string, unknown>>; error: null }>(
      onfulfilled?:
        | ((value: {
            data: Array<Record<string, unknown>>;
            error: null;
          }) => TResult1 | PromiseLike<TResult1>)
        | null
    ) {
      return Promise.resolve({
        data: rows.filter((row) => filters.every((filter) => filter(row))),
        error: null,
      }).then(onfulfilled);
    },
  };

  return query;
}
