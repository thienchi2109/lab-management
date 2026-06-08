"use client";

import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  error: Error;
  reset: () => void;
};

/** Render trạng thái lỗi cục bộ khi bảng mẫu xét nghiệm không tải được. */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
        Không thể tải bảng mẫu xét nghiệm
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Vui lòng thử lại
      </h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button type="button" onClick={reset}>
        Tải lại
      </Button>
    </div>
  );
}
