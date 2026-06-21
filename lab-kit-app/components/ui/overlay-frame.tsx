"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogFrameProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  mode?: "bottom-sheet" | "modal" | "sheet";
  mobileLayout?: "fullscreen" | "compact";
};

type SideSheetFrameProps = Omit<DialogFrameProps, "mode">;
type BottomSheetFrameProps = Omit<DialogFrameProps, "mode">;

type DialogActionsProps = {
  pending: boolean;
  onClose: () => void;
  cancelLabel: string;
  savingLabel: string;
  submitLabel: string;
  sticky?: boolean;
};

const BOTTOM_SHEET_STYLE: CSSProperties & {
  "--overlay-viewport-height": string;
} = {
  "--overlay-viewport-height": "100dvh",
};

/** Render khung overlay global cho modal giữa màn hình và side sheet. */
export function DialogFrame({
  title,
  closeLabel,
  onClose,
  children,
  footer,
  mode = "modal",
  mobileLayout = "fullscreen",
}: DialogFrameProps) {
  const titleId = useId();
  const frameRef = useRef<HTMLElement | null>(null);
  const isSheet = mode === "sheet";
  const isBottomSheet = mode === "bottom-sheet";
  const isCompactMobileModal = !isSheet && mobileLayout === "compact";
  const handleClose = useEffectEvent(onClose);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const dialogElement = frame;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.scrollbarGutter = "stable";

    let cleanupViewportHeight = () => {};

    if (isBottomSheet) {
      const visualViewport = window.visualViewport;

      function updateViewportHeight() {
        const viewportHeight = visualViewport?.height ?? window.innerHeight;
        dialogElement.style.setProperty(
          "--overlay-viewport-height",
          `${viewportHeight}px`
        );
      }

      updateViewportHeight();
      if (visualViewport) {
        visualViewport.addEventListener("resize", updateViewportHeight);
        visualViewport.addEventListener("scroll", updateViewportHeight, {
          passive: true,
        });
      }
      window.addEventListener("resize", updateViewportHeight);

      cleanupViewportHeight = () => {
        if (visualViewport) {
          visualViewport.removeEventListener("resize", updateViewportHeight);
          visualViewport.removeEventListener("scroll", updateViewportHeight);
        }
        window.removeEventListener("resize", updateViewportHeight);
      };
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
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
      cleanupViewportHeight();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
    };
  }, [isBottomSheet]);

  const frameContent = (
    <>
      {isBottomSheet ? (
        <div className="flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
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
          isCompactMobileModal
            ? "p-4"
            : "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4",
          isSheet ? "max-h-[calc(100dvh-4rem)]" : undefined
        )}
      >
        {children}
      </div>
      {footer ? (
        <div
          className={cn(
            "shrink-0 border-t bg-background px-4 py-3",
            !isCompactMobileModal && "sticky bottom-0",
            isBottomSheet && "pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
          )}
        >
          {footer}
        </div>
      ) : null}
    </>
  );

  if (isBottomSheet) {
    return (
      <div className="fixed inset-0 z-[60]">
        <button
          type="button"
          className="absolute inset-0 bg-foreground/45"
          aria-label={closeLabel}
          onClick={onClose}
        />
        <div
          ref={(node) => {
            frameRef.current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={BOTTOM_SHEET_STYLE}
          className="absolute inset-x-0 bottom-0 flex h-[calc(var(--overlay-viewport-height)-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background p-0 text-left text-foreground shadow-xl outline-none sm:left-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-2xl sm:-translate-x-1/2"
        >
          {frameContent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/45"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <dialog
        ref={(node) => {
          frameRef.current = node;
        }}
        open
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute m-0 flex flex-col overflow-hidden bg-background p-0 text-left text-foreground shadow-xl outline-none",
          isSheet
            ? "right-0 top-0 h-dvh w-full max-w-xl border border-y-0 border-r-0 border-border"
            : isCompactMobileModal
              ? "inset-x-4 top-1/2 max-h-[calc(100dvh-2rem)] w-auto max-w-none -translate-y-1/2 rounded-lg border border-border sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-2xl sm:-translate-x-1/2"
              : "inset-0 h-dvh w-full max-w-none border-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-border"
        )}
      >
        {frameContent}
      </dialog>
    </div>
  );
}

/** Render bottom sheet global từ cạnh dưới viewport cho mobile. */
export function BottomSheetFrame(props: BottomSheetFrameProps) {
  return <DialogFrame {...props} mode="bottom-sheet" />;
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
        "mt-4 flex justify-end gap-2 border-t bg-background pt-3",
        sticky && "sticky bottom-0 -mx-4 -mb-4 px-4 py-3"
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
