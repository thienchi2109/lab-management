import type { DashboardQuery, DashboardSource } from "./server-types";

/** Đọc rows từ Supabase query và chuẩn hóa lỗi dashboard. */
export async function readRows<T>(query: DashboardQuery<T>, message: string) {
  const { data, error } = await query;

  if (error) throw new Error(message);

  return data ?? [];
}

/** Đọc count từ Supabase query và chuẩn hóa lỗi dashboard. */
export async function readCount<T>(query: DashboardQuery<T>, message: string) {
  const { count, error } = await query;

  if (error) throw new Error(message);

  return count ?? 0;
}

/** Chuyển Supabase client thật/mock thành source tối thiểu cho dashboard. */
export function createDashboardSource(value: unknown): DashboardSource {
  if (!isRecord(value) || typeof value.from !== "function") {
    throw new Error("Supabase dashboard source không hợp lệ.");
  }

  return value as DashboardSource;
}

/** Chặn query dashboard tạo range không hợp lệ. */
export function assertPositiveLimit(limit: number) {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("Giới hạn đọc dashboard phải lớn hơn 0.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
