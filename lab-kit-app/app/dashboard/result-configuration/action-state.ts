/** Trạng thái chung cho form cấu hình chỉ tiêu. */
export type ResultConfigurationActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

/** Trạng thái ban đầu dùng cho useActionState trong các hộp thoại. */
export const initialResultConfigurationActionState: ResultConfigurationActionState =
  {
    status: "idle",
    message: "",
  };
