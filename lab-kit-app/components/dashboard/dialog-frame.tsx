"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
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
  const frameRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const focusable = frameRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      frameRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 sm:items-center">
      <section
        ref={frameRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-2xl rounded-lg border bg-background shadow-xl"
        onKeyDown={handleKeyDown}
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
      </section>
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
