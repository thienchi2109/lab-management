import { getResultConfiguration } from "@/lib/result-configuration/server";

import { ResultConfigurationPageContent } from "./_components/result-configuration-page-content";

export default async function ResultConfigurationPage() {
  const config = await loadConfigOrNull();

  if (config) {
    return <ResultConfigurationPageContent config={config} />;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
        Không có quyền truy cập
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Chỉ Admin mới cấu hình chỉ tiêu
      </h1>
      <p className="text-sm text-muted-foreground">
        Tài khoản hiện tại không có quyền xem hoặc thay đổi nhóm, chỉ tiêu và
        mẫu cấu hình kết quả.
      </p>
    </div>
  );
}

async function loadConfigOrNull() {
  try {
    return await getResultConfiguration();
  } catch {
    return null;
  }
}
