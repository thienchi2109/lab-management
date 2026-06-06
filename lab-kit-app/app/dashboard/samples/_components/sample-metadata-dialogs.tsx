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
    <DialogFrame
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
    </DialogFrame>
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

  return (
    <form action={action} className="space-y-4">
      {sample ? (
        <input type="hidden" name="sampleId" value={sample.id} />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Mã mẫu"
          name="sampleCode"
          defaultValue={sample?.sampleCode}
          required
          error={errors.sampleCode}
        />
        <SelectField
          label="Loại mẫu"
          name="sampleTypeId"
          defaultValue={sample?.sampleTypeId}
          options={sampleTypes.map((type) => [type.id, type.name])}
          error={errors.sampleTypeId}
        />
        <SelectField
          label="Khách hàng"
          name="customerId"
          defaultValue={sample?.customerId ?? ""}
          options={[["", "Không chọn"], ...customers.map(optionLabel)]}
          error={errors.customerId}
        />
        <SelectField
          label="Công ty"
          name="companyId"
          defaultValue={sample?.companyId ?? ""}
          options={[["", "Không chọn"], ...companies.map(optionLabel)]}
          error={errors.companyId}
        />
        <Field
          label="Tên khách hàng snapshot"
          name="customerName"
          defaultValue={sample?.customerName}
          required
          error={errors.customerName}
        />
        <SelectField
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
          label="Ngày lấy mẫu"
          name="collectedAt"
          type="datetime-local"
          defaultValue={toDateTimeInput(sample?.collectedAt)}
          error={errors.collectedAt}
        />
        <Field
          label="Ngày nhận"
          name="receivedAt"
          type="datetime-local"
          defaultValue={toDateTimeInput(sample?.receivedAt) ?? defaultNow()}
          required
          error={errors.receivedAt}
        />
        <SelectField
          label="Trạng thái"
          name="status"
          defaultValue={sample?.status ?? "received"}
          options={Object.entries(sampleStatusLabels)}
          error={errors.status}
        />
        <SelectField
          label="Thanh toán"
          name="billingStatus"
          defaultValue={sample?.billingStatus ?? "unpaid"}
          options={Object.entries(billingStatusLabels)}
          error={errors.billingStatus}
        />
      </div>
      <TextAreaField
        label="Ghi chú"
        name="note"
        defaultValue={sample?.note}
        error={errors.note}
      />
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
