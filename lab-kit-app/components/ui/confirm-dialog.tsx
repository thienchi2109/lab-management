"use client";

import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DialogFrame } from "@/components/ui/overlay-frame";

type ConfirmDialogIntent = "neutral" | "destructive";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onOpenChange: (open: boolean) => void;
  intent?: ConfirmDialogIntent;
  confirmFormId?: string;
  onConfirm?: () => void;
};

/** Render confirm dialog dùng chung cho hành động trung tính và destructive. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onOpenChange,
  intent = "neutral",
  confirmFormId,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  function handleCancel() {
    onOpenChange(false);
  }

  function handleConfirm() {
    onConfirm?.();

    if (!confirmFormId) {
      onOpenChange(false);
    }
  }

  const confirmVariant = intent === "destructive" ? "destructive" : "default";

  return (
    <DialogFrame
      title={title}
      closeLabel={cancelLabel}
      onClose={handleCancel}
      mobileLayout="compact"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type={confirmFormId ? "submit" : "button"}
            form={confirmFormId}
            variant={confirmVariant}
            className="w-full sm:w-auto"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </DialogFrame>
  );
}
