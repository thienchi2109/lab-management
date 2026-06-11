import type {
  SampleBillingStatus,
  SampleStatus,
} from "@/lib/sample-metadata/schemas";

/** Nhãn tiếng Việt ổn định cho trạng thái xử lý của mẫu xét nghiệm. */
export const sampleStatusLabels: Record<SampleStatus, string> = {
  draft: "Nháp",
  received: "Đã nhận",
  in_progress: "Đang xử lý",
  completed: "Hoàn tất",
  archived: "Lưu trữ",
};

/** Nhãn tiếng Việt ổn định cho trạng thái thanh toán của mẫu xét nghiệm. */
export const billingStatusLabels: Record<SampleBillingStatus, string> = {
  unpaid: "Chưa thu",
  invoiced: "Đã xuất hóa đơn",
  paid: "Đã thanh toán",
  eom_credit: "Công nợ cuối tháng",
};
