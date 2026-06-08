/** Render trạng thái đang tải cho bảng mẫu xét nghiệm. */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Bảng mẫu xét nghiệm
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Đang tải bảng mẫu xét nghiệm...
        </p>
      </div>
      <div className="rounded-lg border bg-background p-4">
        <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="rounded-lg border bg-background p-8">
        <div className="space-y-3">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
