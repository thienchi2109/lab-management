"use client";

import { useActionState } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import { DialogActions, DialogFrame } from "@/components/ui/overlay-frame";
import {
  Field,
  SelectField,
  TextAreaField,
} from "@/components/dashboard/form-fields";
import type { KitBatch, KitType, KitUnit } from "@/lib/kit-inventory/inventory";

import {
  initialDialogState,
  type KitInventoryDialogAction,
} from "./kit-inventory-dialog-state";

type DialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateKitTypeDialog({
  open,
  onClose,
  formAction,
}: DialogProps & { formAction: KitInventoryDialogAction }) {
  const [state, action, pending] = useActionState(
    formAction,
    initialDialogState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Tạo loại KIT" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã loại KIT" name="code" required />
          <Field label="Tên loại KIT" name="name" required />
        </div>
        <Field label="Nhà sản xuất" name="manufacturer" />
        <input type="hidden" name="isActive" value="true" />
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

export function CreateBatchDialog({
  open,
  kitTypes,
  defaultReceivedAt,
  onClose,
  formAction,
}: DialogProps & {
  kitTypes: KitType[];
  defaultReceivedAt: string;
  formAction: KitInventoryDialogAction;
}) {
  const [state, action, pending] = useActionState(
    formAction,
    initialDialogState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Tạo lô KIT" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="space-y-4">
        <SelectField
          label="Loại KIT"
          name="kitTypeId"
          options={kitTypes.map((type) => [type.id, type.name])}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã lô" name="lotNumber" required />
          <Field
            label="Ngày nhận"
            name="receivedAt"
            type="date"
            defaultValue={defaultReceivedAt}
            required
          />
          <Field
            label="Số lượng nhận"
            name="receivedQuantity"
            type="number"
            required
          />
          <Field
            label="Số lượng còn"
            name="remainingQuantity"
            type="number"
            required
          />
          <Field label="Hạn dùng" name="expiresOn" type="date" required />
        </div>
        <ActionMessage state={state} />
        <DialogActions
          pending={pending}
          cancelLabel="Hủy"
          savingLabel="Đang lưu..."
          onClose={onClose}
          submitLabel="Tạo lô"
        />
      </form>
    </DialogFrame>
  );
}

export function CreateKitUnitsDialog({
  open,
  batches,
  onClose,
  formAction,
}: DialogProps & {
  batches: KitBatch[];
  formAction: KitInventoryDialogAction;
}) {
  const [state, action, pending] = useActionState(
    formAction,
    initialDialogState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Thêm KIT" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="space-y-4">
        <SelectField
          label="Lô KIT"
          name="batchId"
          options={batches.map((batch) => [
            batch.id,
            `${batch.kitTypeName} - ${batch.lotNumber}`,
          ])}
        />
        <TextAreaField label="Mã KIT" name="kitCodes" />
        <p className="text-xs text-muted-foreground">
          Nhập nhiều mã bằng dấu phẩy, dấu chấm phẩy hoặc xuống dòng.
        </p>
        <ActionMessage state={state} />
        <DialogActions
          pending={pending}
          cancelLabel="Hủy"
          savingLabel="Đang lưu..."
          onClose={onClose}
          submitLabel="Thêm"
        />
      </form>
    </DialogFrame>
  );
}

export function UpdateKitStatusDialog({
  kit,
  onClose,
  formAction,
}: {
  kit: KitUnit | null;
  onClose: () => void;
  formAction: KitInventoryDialogAction;
}) {
  const [state, action, pending] = useActionState(
    formAction,
    initialDialogState
  );

  if (!kit) return null;

  return (
    <DialogFrame
      title={`Cập nhật ${kit.kitCode}`}
      closeLabel="Đóng"
      onClose={onClose}
    >
      <form action={action} className="space-y-4">
        <input type="hidden" name="kitId" value={kit.id} />
        <SelectField
          label="Trạng thái"
          name="status"
          defaultValue={kit.status}
          options={[
            ["in_stock", "Còn tồn"],
            ["assigned", "Đã gán"],
            ["used", "Đã dùng"],
            ["void", "Hủy"],
            ["expired", "Hết hạn"],
            ["lost", "Thất lạc"],
          ]}
        />
        <TextAreaField label="Lý do" name="reason" />
        <ActionMessage state={state} />
        <DialogActions
          pending={pending}
          cancelLabel="Hủy"
          savingLabel="Đang lưu..."
          onClose={onClose}
          submitLabel="Cập nhật"
        />
      </form>
    </DialogFrame>
  );
}
