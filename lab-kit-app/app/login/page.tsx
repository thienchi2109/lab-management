import type { Metadata } from "next";
import Image from "next/image";

import { AppBrandMark } from "@/components/brand/app-brand-mark";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasInvalidCredentials = params?.error === "invalid";
  const errorMessageId = hasInvalidCredentials ? "login-error" : undefined;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-[0_22px_60px_rgb(15_23_42/0.16)] ring-1 ring-slate-200/70 lg:min-h-[698px] lg:grid-cols-2 dark:bg-card dark:ring-border">
        <aside className="hidden bg-accent px-16 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-12">
            <AppBrandMark src="/logo-lab-kit-removebg.png" />

            <div className="space-y-5">
              <h1 className="max-w-[470px] text-[32px] font-bold leading-[1.28] text-foreground">
                Quản lý mẫu, KIT và kết quả xét nghiệm trong một giao diện nội
                bộ
              </h1>
              <p className="max-w-[430px] text-base leading-7 text-muted-foreground">
                Đăng nhập bằng tài khoản được cấp để theo dõi mẫu, cấu hình chỉ
                tiêu và chuẩn bị dữ liệu báo cáo.
              </p>
            </div>
          </div>

          <LabPreview />
        </aside>

        <div className="flex min-h-[650px] flex-col justify-center bg-white px-6 py-8 sm:px-10 lg:px-16 dark:bg-card">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-10 flex justify-center lg:hidden">
              <AppBrandMark src="/logo-lab-kit-removebg.png" compact />
            </div>

            <div className="mb-12">
              <h2
                id="login-heading"
                className="mb-3 text-[28px] font-bold leading-tight text-foreground"
              >
                Đăng nhập hệ thống
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Chào mừng bạn quay trở lại. Vui lòng nhập thông tin để tiếp tục.
              </p>
            </div>

            <LoginForm
              hasInvalidCredentials={hasInvalidCredentials}
              errorMessageId={errorMessageId}
            />

            <div className="mt-12 border-t border-border pt-6 text-center">
              <p className="text-xs font-semibold text-muted-foreground">
                © 2026 {APP_NAME}. {APP_TAGLINE}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LabPreview() {
  return (
    <div className="relative mt-10 overflow-hidden rounded-sm bg-white shadow-[0_14px_34px_rgb(15_23_42/0.14)] ring-1 ring-slate-200/80 dark:bg-background dark:ring-border">
      <Image
        src="/images/login-lab-illustration.png"
        width={1200}
        height={760}
        sizes="(min-width: 1024px) 386px, 0px"
        alt="Minh hoạ quy trình xét nghiệm với kính hiển vi, ống mẫu và bảng kết quả"
        className="h-[258px] w-full object-cover"
      />
    </div>
  );
}
