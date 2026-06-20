import { PageContainer } from "@/components/layout/page-container";

type DashboardPageLoadingProps = {
  title: string;
  description: string;
};

/** Render skeleton tải trang dashboard dùng chung cho các ranh giới tải route. */
export function DashboardPageLoading({
  title,
  description,
}: DashboardPageLoadingProps) {
  return (
    <PageContainer className="gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
    </PageContainer>
  );
}
