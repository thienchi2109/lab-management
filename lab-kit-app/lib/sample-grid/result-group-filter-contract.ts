/** Số nhóm chỉ tiêu tối đa được phép lọc cùng lúc trên Sample Grid. */
export const MAX_RESULT_GROUP_FILTERS = 10;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Kiểm tra id nhóm chỉ tiêu theo UUID để tránh đưa input lạ xuống adapter. */
export function isResultGroupId(value: string) {
  return UUID_PATTERN.test(value);
}

/** Chuẩn hóa danh sách nhóm chỉ tiêu: chỉ UUID, dedupe, giới hạn số lượng. */
export function normalizeResultGroupIds(values: string[]) {
  const resultGroupIds: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const normalized = value.trim();

    if (
      isResultGroupId(normalized) &&
      !seen.has(normalized) &&
      resultGroupIds.length < MAX_RESULT_GROUP_FILTERS
    ) {
      seen.add(normalized);
      resultGroupIds.push(normalized);
    }
  }

  return resultGroupIds;
}
