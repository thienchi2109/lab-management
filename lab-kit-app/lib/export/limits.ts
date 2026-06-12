/** Thông báo ổn định khi filter khớp nhiều dòng hơn giới hạn export trực tiếp. */
export const EXPORT_ROW_LIMIT_EXCEEDED_MESSAGE =
  "Số bản ghi khớp bộ lọc vượt giới hạn export. Vui lòng thu hẹp bộ lọc và thử lại.";

/** Lỗi giới hạn export có code ổn định cho route và test tích hợp. */
export class ExportLimitError extends Error {
  readonly code = "export_row_limit_exceeded";
  readonly status = 400;
  readonly totalCount: number;

  constructor(totalCount: number, message = EXPORT_ROW_LIMIT_EXCEEDED_MESSAGE) {
    super(message);
    this.name = "ExportLimitError";
    this.totalCount = totalCount;
  }
}

/** Chặn export trực tiếp khi tổng dòng khớp filter vượt giới hạn đã parse. */
export function assertExportRowCountWithinLimit(
  totalCount: number,
  rowLimit: number
) {
  if (totalCount > rowLimit) {
    throw new ExportLimitError(totalCount);
  }
}
