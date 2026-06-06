"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type DialogFrameProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

type DialogActionsProps = {
  pending: boolean;
  onClose: () => void;
  cancelLabel: string;
  savingLabel: string;
  submitLabel: string;
};

export function DialogFrame({
  title,
  closeLabel,
  onClose,
  children,
}: DialogFrameProps) {
  const titleId = useId();
  const frameRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const dialog = frame;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const focusable = dialog.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    dialog.addEventListener("keydown", handleKeyDown);

    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 sm:items-center">
      <dialog
        ref={frameRef}
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-2xl rounded-lg border bg-background shadow-xl"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-5">{children}</div>
      </dialog>
    </div>
  );
}

export function DialogActions({
  pending,
  onClose,
  cancelLabel,
  savingLabel,
  submitLabel,
}: DialogActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onClose}>
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? savingLabel : submitLabel}
      </Button>
    </div>
  );
}
