/** Trạng thái trả về từ server action của dialog mẫu xét nghiệm. */
export type SampleMetadataDialogActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

/** Chữ ký server action dùng chung cho biểu mẫu mẫu xét nghiệm. */
export type SampleMetadataDialogAction = (
  previousState: SampleMetadataDialogActionState,
  formData: FormData
) => Promise<SampleMetadataDialogActionState>;

/** Trạng thái khởi tạo trung lập cho dialog mẫu xét nghiệm. */
export const initialDialogState: SampleMetadataDialogActionState = {
  status: "idle",
  message: "",
};
