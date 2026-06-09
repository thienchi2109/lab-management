/** Dòng mẫu tối thiểu cho dashboard overview adapter. */
export type DashboardSampleRow = {
  customer_name: string | null;
  id: string;
  received_at: string;
  sample_code: string;
  sample_types?: RelationName | RelationName[] | null;
  status: string;
};

/** Relation Supabase chỉ cần trường name. */
export type RelationName = {
  name?: string | null;
};

/** Dòng KQ_CHUNG tối thiểu cho dashboard overview. */
export type DashboardConclusionRow = {
  kq_chung: string;
  sample_id: string;
};

/** Dòng result tối thiểu cho thống kê PCR. */
export type DashboardResultRow = {
  result_metric_id: string;
  sample_id: string;
  value: unknown;
};

/** Dòng metric tối thiểu cho thống kê PCR. */
export type DashboardMetricRow = {
  code: string;
  id: string;
  name: string;
};

/** Query builder Supabase tối thiểu cho dashboard overview. */
export type DashboardQuery<T> = PromiseLike<{
  count?: number | null;
  data: T[] | null;
  error: unknown;
}> & {
  eq(column: string, value: unknown): DashboardQuery<T>;
  gte(column: string, value: unknown): DashboardQuery<T>;
  in(column: string, values: string[]): DashboardQuery<T>;
  lte(column: string, value: unknown): DashboardQuery<T>;
  order(column: string, options?: { ascending: boolean }): DashboardQuery<T>;
  range(from: number, to: number): DashboardQuery<T>;
  select(
    columns: string,
    options?: { count: "exact"; head?: boolean }
  ): DashboardQuery<T>;
};

/** Supabase source tối thiểu cho dashboard overview adapter. */
export type DashboardSource = {
  from<T>(table: string): DashboardQuery<T>;
};
