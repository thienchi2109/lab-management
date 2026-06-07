import {
  getSampleMetadata,
  SampleMetadataAccessError,
} from "@/lib/sample-metadata/server";

import { SampleMetadataPageContent } from "./_components/sample-metadata-page-content";

/** Render route quản lý metadata mẫu xét nghiệm trong dashboard. */
export default async function SampleMetadataPage() {
  const metadata = await loadSampleMetadataOrNull();

  if (metadata) {
    return <SampleMetadataPageContent metadata={metadata} />;
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
        Tài khoản hiện tại không có quyền xem hoặc quản lý metadata mẫu xét
        nghiệm trong tổ chức.
      </p>
    </div>
  );
}

async function loadSampleMetadataOrNull() {
  try {
    return await getSampleMetadata();
  } catch (error) {
    if (error instanceof SampleMetadataAccessError) {
      return null;
    }

    throw error;
  }
}
