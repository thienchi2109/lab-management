/** Trạng thái trả về từ các server action của dialog Kho KIT. */
export type KitInventoryDialogActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

/** Chữ ký server action dùng chung cho các biểu mẫu dialog Kho KIT. */
export type KitInventoryDialogAction = (
  previousState: KitInventoryDialogActionState,
  formData: FormData
) => Promise<KitInventoryDialogActionState>;

/** Trạng thái khởi tạo trung lập cho các dialog Kho KIT. */
export const initialDialogState: KitInventoryDialogActionState = {
  status: "idle",
  message: "",
};
