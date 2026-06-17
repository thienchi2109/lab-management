/** Số ngày mặc định cho bộ lọc ngày nhận mẫu khi URL chưa có ngày. */
export const DEFAULT_SAMPLE_RECEIVED_RANGE_DAYS = 10;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_FILTER_TEXT_LENGTH = 100;

/** Khoảng ngày nhận mẫu đã normalize theo định dạng ISO date-only. */
export type SampleReceivedDateRange = {
  receivedFrom: string;
  receivedTo: string;
};

/** Kiểm tra chuỗi ISO date-only hợp lệ cho filter mẫu. */
export function isValidSampleFilterDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Chuẩn hóa text filter nhập tự do trước khi đưa xuống server boundary. */
export function normalizeSampleFilterText(value: string | undefined) {
  const text = value?.trim().replace(/\s+/g, " ") ?? "";

  return text.length > 0 ? text.slice(0, MAX_FILTER_TEXT_LENGTH) : undefined;
}

/** Tạo date range mặc định 10 ngày gần nhất, tính cả ngày hiện tại theo UTC. */
export function defaultSampleReceivedDateRange(
  now = new Date()
): SampleReceivedDateRange {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (DEFAULT_SAMPLE_RECEIVED_RANGE_DAYS - 1));

  return {
    receivedFrom: toIsoDate(start),
    receivedTo: toIsoDate(end),
  };
}

/** Điền date range mặc định khi query chưa có filter ngày hợp lệ. */
export function withDefaultSampleReceivedDateRange<
  TFilters extends { receivedFrom?: string; receivedTo?: string },
>(filters: TFilters): TFilters & SampleReceivedDateRange {
  if (filters.receivedFrom || filters.receivedTo) {
    return filters as TFilters & SampleReceivedDateRange;
  }

  return {
    ...filters,
    ...defaultSampleReceivedDateRange(),
  };
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
