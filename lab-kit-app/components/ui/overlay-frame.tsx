"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogFrameProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  mode?: "modal" | "sheet";
};

type SideSheetFrameProps = Omit<DialogFrameProps, "mode">;

type DialogActionsProps = {
  pending: boolean;
  onClose: () => void;
  cancelLabel: string;
  savingLabel: string;
  submitLabel: string;
  sticky?: boolean;
};

/** Render khung overlay global cho modal giữa màn hình và side sheet. */
export function DialogFrame({
  title,
  closeLabel,
  onClose,
  children,
  footer,
  mode = "modal",
}: DialogFrameProps) {
  const titleId = useId();
  const frameRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const dialogElement = frame;
    const previousBodyOverflow = document.body.style.overflow;
    const previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;

    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollbarGutter = "stable";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogElement.querySelectorAll<HTMLElement>(
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

    const focusable = dialogElement.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    dialogElement.addEventListener("keydown", handleKeyDown);

    return () => {
      dialogElement.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
    };
  }, [onClose]);

  const isSheet = mode === "sheet";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/45"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <dialog
        ref={frameRef}
        open
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute m-0 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden border border-border bg-background p-0 text-left text-foreground shadow-xl outline-none",
          isSheet
            ? "right-0 top-0 h-dvh w-full max-w-xl border-y-0 border-r-0"
            : "left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={onClose}
          >
            <X className="size-4" />
            <span className="sr-only">{closeLabel}</span>
          </Button>
        </div>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain p-5",
            isSheet ? "max-h-[calc(100dvh-4rem)]" : undefined
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className="sticky bottom-0 shrink-0 border-t bg-background px-5 py-4">
            {footer}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

/** Render side sheet global từ cạnh phải của viewport. */
export function SideSheetFrame(props: SideSheetFrameProps) {
  return <DialogFrame {...props} mode="sheet" />;
}

/** Render footer action chuẩn cho các form trong overlay. */
export function DialogActions({
  pending,
  onClose,
  cancelLabel,
  savingLabel,
  submitLabel,
  sticky = false,
}: DialogActionsProps) {
  return (
    <div
      className={cn(
        "mt-5 flex justify-end gap-2 border-t bg-background pt-4",
        sticky && "sticky bottom-0 -mx-5 -mb-5 px-5 py-4"
      )}
    >
      <Button type="button" variant="outline" onClick={onClose}>
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? savingLabel : submitLabel}
      </Button>
    </div>
  );
}
