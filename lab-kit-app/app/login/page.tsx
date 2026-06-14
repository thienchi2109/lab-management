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
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f7f9fb] px-4 py-6 text-[#191c1e] sm:px-6 lg:px-8">
      <section className="grid w-full max-w-[1500px] overflow-hidden rounded-xl border border-[#c6c6cd]/40 bg-white shadow-[0_18px_45px_-24px_rgb(25_28_30/0.35)] lg:min-h-[720px] lg:grid-cols-2">
        <aside className="hidden bg-[#c3ecd7] px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="space-y-16">
            <AppBrandMark src="/logo-transparent.png" className="[&>span]:text-red-700" />

            <div className="space-y-6">
              <h1 className="max-w-[620px] text-[36px] font-bold leading-[1.18] text-[#002115]">
                Quản lý mẫu, KIT và kết quả xét nghiệm trong một giao diện nội
                bộ
              </h1>
              <p className="max-w-[620px] text-lg leading-8 text-[#294e3f]">
                Đăng nhập bằng tài khoản được cấp để theo dõi mẫu, cấu hình chỉ
                tiêu và chuẩn bị dữ liệu báo cáo.
              </p>
            </div>
          </div>

          <LabPreview />
        </aside>

        <div className="flex min-h-[680px] flex-col justify-center bg-white px-6 py-8 sm:px-10 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-12 flex justify-center lg:hidden">
              <AppBrandMark src="/logo-transparent.png" compact />
            </div>

            <div className="mb-12">
              <h2
                id="login-heading"
                className="mb-4 text-[32px] font-bold leading-tight text-[#191c1e]"
              >
                Đăng nhập hệ thống
              </h2>
              <p className="max-w-[420px] text-base leading-7 text-[#45464d]">
                Chào mừng bạn quay trở lại. Vui lòng nhập thông tin để tiếp tục.
              </p>
            </div>

            <LoginForm
              hasInvalidCredentials={hasInvalidCredentials}
              errorMessageId={errorMessageId}
            />

            <div className="mt-14 border-t border-[#c6c6cd]/50 pt-7 text-center">
              <p className="font-mono text-xs font-medium text-[#76777d]">
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
    <div className="relative mt-12 overflow-hidden rounded-lg border border-white/50 bg-white/45 p-5 shadow-[0_16px_36px_-26px_rgb(25_28_30/0.35)] backdrop-blur-sm">
      <Image
        src="/images/login-lab-stitch.png"
        width={1200}
        height={760}
        sizes="(min-width: 1024px) 386px, 0px"
        alt="Minh hoạ quy trình xét nghiệm với kính hiển vi, ống mẫu và bảng kết quả"
        className="h-[360px] w-full rounded-sm object-cover opacity-80 mix-blend-multiply"
      />
    </div>
  );
}
