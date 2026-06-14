"use client";

import { useActionState } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import {
  DialogActions,
  DialogFrame,
  SideSheetFrame,
} from "@/components/ui/overlay-frame";
import {
  Field,
  SelectField,
  TextAreaField,
} from "@/components/dashboard/form-fields";
import type {
  CompanyOption,
  CustomerOption,
  KitBatchOption,
  SampleMetadataRow,
  SampleTypeOption,
} from "@/lib/sample-metadata/metadata";
import { getLocalDateTimeInputValue } from "@/lib/sample-metadata/datetime";

import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";
import {
  initialDialogState,
  type SampleMetadataDialogAction,
} from "./sample-metadata-dialog-state";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  formAction: SampleMetadataDialogAction;
  sampleTypes: SampleTypeOption[];
  customers: CustomerOption[];
  companies: CompanyOption[];
  kitBatches: KitBatchOption[];
};

/** Render the create-sample metadata dialog. */
export function CreateSampleDialog(props: DialogProps) {
  const [state, action, pending] = useActionState(
    props.formAction,
    initialDialogState
  );

  if (!props.open) return null;
  const formProps = toSampleFormProps(props);

  return (
    <DialogFrame
      title="Tạo mẫu xét nghiệm"
      closeLabel="Đóng"
      onClose={props.onClose}
    >
      <SampleForm
        action={action}
        pending={pending}
        actionState={state}
        submitLabel="Tạo mẫu"
        savingLabel="Đang tạo..."
        onClose={props.onClose}
        {...formProps}
      />
    </DialogFrame>
  );
}

/** Render the edit-sample metadata dialog. */
export function EditSampleDialog({
  sample,
  ...props
}: Omit<DialogProps, "open"> & { sample: SampleMetadataRow | null }) {
  const [state, action, pending] = useActionState(
    props.formAction,
    initialDialogState
  );

  if (!sample) return null;
  const formProps = toSampleFormProps(props);

  return (
    <SideSheetFrame
      title={`Cập nhật ${sample.sampleCode}`}
      closeLabel="Đóng"
      onClose={props.onClose}
    >
      <SampleForm
        action={action}
        pending={pending}
        actionState={state}
        sample={sample}
        submitLabel="Cập nhật"
        savingLabel="Đang lưu..."
        onClose={props.onClose}
        {...formProps}
      />
    </SideSheetFrame>
  );
}

function SampleForm({
  action,
  pending,
  actionState,
  sample,
  onClose,
  submitLabel,
  savingLabel,
  sampleTypes,
  customers,
  companies,
  kitBatches,
}: Omit<DialogProps, "open" | "formAction"> & {
  action: (formData: FormData) => void;
  pending: boolean;
  actionState: typeof initialDialogState;
  sample?: SampleMetadataRow;
  submitLabel: string;
  savingLabel: string;
}) {
  const errors = actionState.fieldErrors ?? {};
  const fieldClass = "block w-full space-y-1.5 text-sm font-medium";
  const controlClass =
    "h-10 rounded-md border-zinc-300 bg-white px-3 text-sm shadow-xs";
  const textAreaClass =
    "min-h-28 w-full rounded-md border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs";

  return (
    <form action={action} className="space-y-5 pb-1">
      {sample ? (
        <input type="hidden" name="sampleId" value={sample.id} />
      ) : null}
      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-xs sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-950">Thông tin mẫu</h3>
          <p className="text-xs text-zinc-500">
            Nhập định danh, khách hàng và trạng thái xử lý ban đầu.
          </p>
        </div>
        <Field
          className={fieldClass}
          inputClassName={controlClass}
          label="Mã mẫu"
          name="sampleCode"
          defaultValue={sample?.sampleCode}
          required
          error={errors.sampleCode}
        />
        <SelectField
          className={fieldClass}
          triggerClassName={controlClass}
          label="Loại mẫu"
          name="sampleTypeId"
          defaultValue={sample?.sampleTypeId}
          options={sampleTypes.map((type) => [type.id, type.name])}
          error={errors.sampleTypeId}
        />
        <SelectField
          className={fieldClass}
          triggerClassName={controlClass}
          label="Khách hàng"
          name="customerId"
          defaultValue={sample?.customerId ?? ""}
          options={[["", "Không chọn"], ...customers.map(optionLabel)]}
          error={errors.customerId}
        />
        <SelectField
          className={fieldClass}
          triggerClassName={controlClass}
          label="Công ty"
          name="companyId"
          defaultValue={sample?.companyId ?? ""}
          options={[["", "Không chọn"], ...companies.map(optionLabel)]}
          error={errors.companyId}
        />
        <Field
          className={fieldClass}
          inputClassName={controlClass}
          label="Tên khách hàng"
          name="customerName"
          defaultValue={sample?.customerName}
          required
          error={errors.customerName}
        />
        <SelectField
          className={fieldClass}
          triggerClassName={controlClass}
          label="Lô KIT"
          name="kitBatchId"
          defaultValue={sample?.kitBatchId ?? ""}
          options={[
            ["", "Chưa gán"],
            ...kitBatches.map(
              (batch) =>
                [batch.id, `${batch.kitTypeName} - ${batch.lotNumber}`] as [
                  string,
                  string,
                ]
            ),
          ]}
          error={errors.kitBatchId}
        />
        <Field
          className={fieldClass}
          inputClassName={controlClass}
          label="Ngày lấy mẫu"
          name="collectedAt"
          type="datetime-local"
          defaultValue={toDateTimeInput(sample?.collectedAt)}
          error={errors.collectedAt}
        />
        <Field
          className={fieldClass}
          inputClassName={controlClass}
          label="Ngày nhận"
          name="receivedAt"
          type="datetime-local"
          defaultValue={toDateTimeInput(sample?.receivedAt) ?? defaultNow()}
          required
          error={errors.receivedAt}
        />
        <SelectField
          className={fieldClass}
          triggerClassName={controlClass}
          label="Trạng thái"
          name="status"
          defaultValue={sample?.status ?? "received"}
          options={Object.entries(sampleStatusLabels)}
          error={errors.status}
        />
        <SelectField
          className={fieldClass}
          triggerClassName={controlClass}
          label="Thanh toán"
          name="billingStatus"
          defaultValue={sample?.billingStatus ?? "unpaid"}
          options={Object.entries(billingStatusLabels)}
          error={errors.billingStatus}
        />
      </div>
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-xs">
        <div className="mb-3 space-y-1">
          <h3 className="text-sm font-semibold text-zinc-950">Ghi chú xử lý</h3>
          <p className="text-xs text-zinc-500">
            Ghi lại yêu cầu nội bộ hoặc điều kiện cần chú ý khi xét nghiệm.
          </p>
        </div>
        <TextAreaField
          className={fieldClass}
          inputClassName={textAreaClass}
          label="Ghi chú"
          name="note"
          defaultValue={sample?.note}
          error={errors.note}
          hideLabel
        />
      </div>
      <ActionMessage state={actionState} />
      <DialogActions
        pending={pending}
        cancelLabel="Hủy"
        savingLabel={savingLabel}
        onClose={onClose}
        submitLabel={submitLabel}
      />
    </form>
  );
}

function optionLabel(item: { id: string; name: string }): [string, string] {
  return [item.id, item.name];
}

function toDateTimeInput(value: string | null | undefined) {
  return value ? getLocalDateTimeInputValue(new Date(value)) : undefined;
}

function defaultNow() {
  return getLocalDateTimeInputValue(new Date());
}

function toSampleFormProps(props: DialogProps | Omit<DialogProps, "open">) {
  return {
    sampleTypes: props.sampleTypes,
    customers: props.customers,
    companies: props.companies,
    kitBatches: props.kitBatches,
  };
}
