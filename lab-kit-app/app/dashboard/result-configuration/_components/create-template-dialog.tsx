"use client";

import { useActionState } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import {
  DialogActions,
  DialogFrame,
} from "@/components/dashboard/dialog-frame";
import { Field, SelectField } from "@/components/dashboard/form-fields";
import type { SampleType } from "@/lib/result-configuration/configuration";

import {
  createTemplateAction,
  initialResultConfigurationActionState,
} from "../actions";
import type { DialogProps } from "./result-configuration-dialog-types";

type CreateTemplateDialogProps = DialogProps & {
  sampleTypes: SampleType[];
};

export function CreateTemplateDialog({
  open,
  sampleTypes,
  onClose,
}: CreateTemplateDialogProps) {
  const [state, action, pending] = useActionState(
    createTemplateAction,
    initialResultConfigurationActionState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Thêm mẫu cấu hình" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Loại mẫu"
            name="sampleTypeId"
            options={sampleTypes.map((sampleType) => [
              sampleType.id,
              sampleType.name,
            ])}
          />
          <SelectField
            label="Trạng thái"
            name="isActive"
            defaultValue="true"
            options={[
              ["true", "Hoạt động"],
              ["false", "Tạm khóa"],
            ]}
          />
          <Field label="Mã mẫu cấu hình" name="code" required />
          <Field label="Tên mẫu cấu hình" name="name" required />
        </div>
        <ActionMessage state={state} />
        <DialogActions
          pending={pending}
          cancelLabel="Hủy"
          savingLabel="Đang lưu..."
          onClose={onClose}
          submitLabel="Tạo"
        />
      </form>
    </DialogFrame>
  );
}
