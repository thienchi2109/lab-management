"use client";

import { useActionState, useState } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import { DialogActions, DialogFrame } from "@/components/ui/overlay-frame";
import {
  Field,
  SelectField,
  TextAreaField,
} from "@/components/dashboard/form-fields";
import type { ResultGroup } from "@/lib/result-configuration/configuration";
import { RESULT_INPUT_TYPES } from "@/lib/result-configuration/configuration";

import { initialResultConfigurationActionState } from "../action-state";
import { createMetricAction } from "../actions";
import type { DialogProps } from "./result-configuration-dialog-types";

type CreateMetricDialogProps = DialogProps & {
  groups: ResultGroup[];
};

type MetricDialogTab = "basic" | "advanced";

export function CreateMetricDialog({
  open,
  groups,
  onClose,
}: CreateMetricDialogProps) {
  const [activeTab, setActiveTab] = useState<MetricDialogTab>("basic");
  const [state, action, pending] = useActionState(
    createMetricAction,
    initialResultConfigurationActionState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Thêm chỉ tiêu" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="space-y-3">
        <div
          role="tablist"
          aria-label="Nhóm trường chỉ tiêu"
          className="grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1"
        >
          {[
            ["basic", "Cơ bản"],
            ["advanced", "Nâng cao"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={
                activeTab === tab
                  ? "rounded-md bg-background px-3 py-1.5 text-sm font-semibold text-foreground shadow-xs"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground"
              }
              onClick={() => setActiveTab(tab as MetricDialogTab)}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          hidden={activeTab !== "basic"}
          className="grid gap-2 sm:grid-cols-2"
        >
          <SelectField
            label="Nhóm"
            name="resultGroupId"
            className="gap-1"
            triggerClassName="h-9 px-2.5 shadow-none"
            options={groups.map((group) => [group.id, group.name])}
          />
          <SelectField
            label="Kiểu nhập"
            name="inputType"
            defaultValue="text"
            className="gap-1"
            triggerClassName="h-9 px-2.5 shadow-none"
            options={RESULT_INPUT_TYPES.map((type) => [type, type])}
          />
          <Field
            label="Mã chỉ tiêu"
            name="code"
            required
            className="block w-full space-y-1 text-sm font-medium"
          />
          <Field
            label="Tên chỉ tiêu"
            name="name"
            required
            className="block w-full space-y-1 text-sm font-medium"
          />
          <Field
            label="Đơn vị"
            name="unit"
            className="block w-full space-y-1 text-sm font-medium"
          />
          <Field
            label="Thứ tự"
            name="sortOrder"
            type="number"
            defaultValue={10}
            className="block w-full space-y-1 text-sm font-medium"
          />
          <SelectField
            label="Bắt buộc"
            name="isRequired"
            defaultValue="true"
            className="gap-1"
            triggerClassName="h-9 px-2.5 shadow-none"
            options={[
              ["true", "Có"],
              ["false", "Không"],
            ]}
          />
          <SelectField
            label="Trạng thái"
            name="isActive"
            defaultValue="true"
            className="gap-1"
            triggerClassName="h-9 px-2.5 shadow-none"
            options={[
              ["true", "Hoạt động"],
              ["false", "Tạm khóa"],
            ]}
          />
        </div>
        <div hidden={activeTab !== "advanced"} className="space-y-2">
          <TextAreaField
            label="Tùy chọn JSON"
            name="optionsJson"
            defaultValue="[]"
            className="block w-full space-y-1 text-sm font-medium"
            inputClassName="min-h-16 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <TextAreaField
            label="Thiết lập JSON"
            name="settingsJson"
            defaultValue="{}"
            className="block w-full space-y-1 text-sm font-medium"
            inputClassName="min-h-16 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <ActionMessage state={state} />
        <DialogActions
          pending={pending}
          cancelLabel="Hủy"
          savingLabel="Đang lưu..."
          onClose={onClose}
          submitLabel="Tạo"
          sticky
        />
      </form>
    </DialogFrame>
  );
}
