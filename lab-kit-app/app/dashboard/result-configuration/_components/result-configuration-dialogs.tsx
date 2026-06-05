"use client";

import { useActionState } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import {
  DialogActions,
  DialogFrame,
} from "@/components/dashboard/dialog-frame";
import {
  Field,
  SelectField,
  TextAreaField,
} from "@/components/dashboard/form-fields";
import type {
  ResultGroup,
  SampleType,
} from "@/lib/result-configuration/configuration";
import { RESULT_INPUT_TYPES } from "@/lib/result-configuration/configuration";

import {
  createGroupAction,
  createMetricAction,
  createTemplateAction,
  initialResultConfigurationActionState,
} from "../actions";

type DialogProps = {
  open: boolean;
  onClose: () => void;
};

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

export function CreateMetricDialog({
  open,
  groups,
  onClose,
}: DialogProps & { groups: ResultGroup[] }) {
  const [state, action, pending] = useActionState(
    createMetricAction,
    initialResultConfigurationActionState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Thêm chỉ tiêu" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Nhóm"
            name="resultGroupId"
            options={groups.map((group) => [group.id, group.name])}
          />
          <SelectField
            label="Kiểu nhập"
            name="inputType"
            defaultValue="text"
            options={RESULT_INPUT_TYPES.map((type) => [type, type])}
          />
          <Field label="Mã chỉ tiêu" name="code" required />
          <Field label="Tên chỉ tiêu" name="name" required />
          <Field label="Đơn vị" name="unit" />
          <Field
            label="Thứ tự"
            name="sortOrder"
            type="number"
            defaultValue={10}
          />
          <SelectField
            label="Bắt buộc"
            name="isRequired"
            defaultValue="true"
            options={[
              ["true", "Có"],
              ["false", "Không"],
            ]}
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
        <TextAreaField
          label="Tùy chọn JSON"
          name="optionsJson"
          defaultValue="[]"
        />
        <TextAreaField
          label="Thiết lập JSON"
          name="settingsJson"
          defaultValue="{}"
        />
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

export function CreateTemplateDialog({
  open,
  sampleTypes,
  onClose,
}: DialogProps & { sampleTypes: SampleType[] }) {
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
