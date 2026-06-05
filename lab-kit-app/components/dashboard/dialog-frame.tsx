"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type DialogFrameProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

type DialogActionsProps = {
  pending: boolean;
  onClose: () => void;
  submitLabel: string;
};

export function DialogFrame({ title, onClose, children }: DialogFrameProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 sm:items-center">
      <section className="w-full max-w-2xl rounded-lg border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Đóng"
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
  submitLabel,
}: DialogActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Hủy
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : submitLabel}
      </Button>
    </div>
  );
}
