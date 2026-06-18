"use client";

import { useActionState, useCallback } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import { ComboboxField } from "@/components/dashboard/combobox-field";
import {
  DialogActions,
  DialogFrame,
  SideSheetFrame,
} from "@/components/ui/overlay-frame";
import { useToast } from "@/components/ui/toast";
import {
  Field,
  SelectField,
  TextAreaField,
} from "@/components/dashboard/form-fields";
import type {
  CompanyOption,
  CustomerOption,
  KitBatchOption,
  ResultGroupOption,
  SampleMetadataRow,
  SampleTypeOption,
} from "@/lib/sample-metadata/metadata";
import { getLocalDateInputValue } from "@/lib/sample-metadata/datetime";

import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";
import {
  initialDialogState,
  type SampleMetadataDialogAction,
} from "./sample-metadata-dialog-state";
import { SampleResultGroupField } from "./sample-result-group-field";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  formAction: SampleMetadataDialogAction;
  sampleTypes: SampleTypeOption[];
  customers: CustomerOption[];
  companies: CompanyOption[];
  kitBatches: KitBatchOption[];
  resultGroupOptions: ResultGroupOption[];
};

/** Render the create-sample metadata dialog. */
export function CreateSampleDialog(props: DialogProps) {
  const actionWithToast = useSampleMetadataActionWithToast(props.formAction);
  const [state, action, pending] = useActionState(
    actionWithToast,
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
  const actionWithToast = useSampleMetadataActionWithToast(props.formAction);
  const [state, action, pending] = useActionState(
    actionWithToast,
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
        stickyActions
        {...formProps}
      />
    </SideSheetFrame>
  );
}

function useSampleMetadataActionWithToast(action: SampleMetadataDialogAction) {
  const { toast } = useToast();

  return useCallback(
    async (previousState: typeof initialDialogState, formData: FormData) => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success" && nextState.message) {
        toast({
          title: "Thao tác mẫu xét nghiệm",
          description: nextState.message,
        });
      }

      return nextState;
    },
    [action, toast]
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
  resultGroupOptions,
  stickyActions,
}: Omit<DialogProps, "open" | "formAction"> & {
  action: (formData: FormData) => void;
  pending: boolean;
  actionState: typeof initialDialogState;
  sample?: SampleMetadataRow;
  submitLabel: string;
  savingLabel: string;
  stickyActions?: boolean;
}) {
  const errors = actionState.fieldErrors ?? {};
  const fieldClass = "block w-full space-y-1.5 text-sm font-medium";
  const controlClass =
    "min-h-11 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs";
  const textAreaClass =
    "min-h-28 w-full rounded-md border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs";

  return (
    <form action={action} className="space-y-5 pb-1">
      {sample ? (
        <input type="hidden" name="sampleId" value={sample.id} />
      ) : null}
      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <h3 className="text-sm font-semibold text-card-foreground">
            Thông tin mẫu
          </h3>
          <p className="text-xs text-muted-foreground">
            Nhập khách hàng và trạng thái xử lý ban đầu.
          </p>
        </div>
        {!sample ? (
          <div className="space-y-1 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Mã mẫu</p>
            <p className="font-mono text-sm text-foreground">
              HP-YYMMDD-••••••••
            </p>
          </div>
        ) : null}
        <SelectField
          className={fieldClass}
          triggerClassName={controlClass}
          label="Loại mẫu"
          name="sampleTypeId"
          defaultValue={sample?.sampleTypeId}
          options={sampleTypes.map((type) => [type.id, type.name])}
          error={errors.sampleTypeId}
        />
        <ComboboxField
          className={fieldClass}
          inputClassName={controlClass}
          label="Khách hàng"
          idName="customerId"
          inputId="sample-customer-combobox"
          listId="sample-customer-options"
          defaultIdValue={sample?.customerId ?? ""}
          options={customers.map(toComboboxOption)}
          placeholder="Không chọn"
          error={errors.customerId}
        />
        <ComboboxField
          className={fieldClass}
          inputClassName={controlClass}
          label="Công ty"
          idName="companyId"
          inputId="sample-company-combobox"
          listId="sample-company-options"
          defaultIdValue={sample?.companyId ?? ""}
          options={companies.map(toComboboxOption)}
          placeholder="Không chọn"
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
        <SampleResultGroupField
          className="space-y-1.5 sm:col-span-2"
          options={resultGroupOptions}
          selectedIds={sample?.resultGroupIds ?? []}
          error={errors.resultGroupIds}
        />
        <Field
          className={fieldClass}
          inputClassName={controlClass}
          label="Ngày lấy mẫu"
          name="collectedAt"
          type="date"
          defaultValue={toDateInput(sample?.collectedAt)}
          error={errors.collectedAt}
        />
        <Field
          className={fieldClass}
          inputClassName={controlClass}
          label="Ngày nhận"
          name="receivedAt"
          type="date"
          defaultValue={toDateInput(sample?.receivedAt) ?? defaultToday()}
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
      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs">
        <div className="mb-3 space-y-1">
          <h3 className="text-sm font-semibold text-card-foreground">
            Ghi chú xử lý
          </h3>
          <p className="text-xs text-muted-foreground">
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
        sticky={stickyActions}
      />
    </form>
  );
}

function optionLabel(item: { id: string; name: string }): [string, string] {
  return [item.id, item.name];
}

function toComboboxOption(item: { id: string; name: string }) {
  return { id: item.id, label: item.name };
}

function toDateInput(value: string | null | undefined) {
  return value ? getLocalDateInputValue(new Date(value)) : undefined;
}

function defaultToday() {
  return getLocalDateInputValue(new Date());
}

function toSampleFormProps(props: DialogProps | Omit<DialogProps, "open">) {
  return {
    sampleTypes: props.sampleTypes,
    customers: props.customers,
    companies: props.companies,
    kitBatches: props.kitBatches,
    resultGroupOptions: props.resultGroupOptions,
  };
}
