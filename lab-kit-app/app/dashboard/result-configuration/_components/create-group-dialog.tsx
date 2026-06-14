"use client";

import { useActionState } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import { DialogActions, DialogFrame } from "@/components/ui/overlay-frame";
import { Field, SelectField } from "@/components/dashboard/form-fields";

import {
  createGroupAction,
  initialResultConfigurationActionState,
} from "../actions";
import type { DialogProps } from "./result-configuration-dialog-types";

export function CreateGroupDialog({ open, onClose }: DialogProps) {
  const [state, action, pending] = useActionState(
    createGroupAction,
    initialResultConfigurationActionState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Thêm nhóm chỉ tiêu" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã nhóm" name="code" required />
          <Field label="Tên nhóm" name="name" required />
          <Field
            label="Thứ tự"
            name="sortOrder"
            type="number"
            defaultValue={10}
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
