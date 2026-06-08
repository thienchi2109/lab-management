import {
  getSampleGridPage,
  SampleGridAccessError,
} from "@/lib/sample-grid/server";

import { SampleGridPageContent } from "./_components/sample-grid-page-content";

type SampleGridPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Render route bảng mẫu xét nghiệm từ contract data grid server-side. */
export default async function SampleGridPage({
  searchParams,
}: SampleGridPageProps) {
  const params = (await searchParams) ?? {};
  const page = await loadSampleGridOrNull(params);

  if (page) {
    return <SampleGridPageContent page={page} />;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
        Không có quyền truy cập
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Bạn chưa có quyền xem mẫu xét nghiệm
      </h1>
      <p className="text-sm text-muted-foreground">
        Tài khoản hiện tại không có quyền xem bảng mẫu xét nghiệm trong tổ chức.
      </p>
    </div>
  );
}

async function loadSampleGridOrNull(
  searchParams: Record<string, string | string[] | undefined>
) {
  try {
    return await getSampleGridPage(searchParams);
  } catch (error) {
    if (error instanceof SampleGridAccessError) {
      return null;
    }

    throw error;
  }
}
