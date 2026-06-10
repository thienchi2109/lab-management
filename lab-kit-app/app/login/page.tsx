import type { Metadata } from "next";
import { FlaskConical, Microscope } from "lucide-react";

import { Input } from "@/components/ui/input";
import { LoginSubmitButton } from "./login-submit-button";

export const metadata: Metadata = {
  title: "Đăng nhập | Lab Management",
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f8f9ff] px-4 py-6 text-[#0d1c2d] sm:px-6 lg:px-8 dark:bg-background dark:text-foreground">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-[0_22px_60px_rgb(15_23_42/0.16)] ring-1 ring-slate-200/70 lg:min-h-[698px] lg:grid-cols-2 dark:bg-card dark:ring-border">
        <aside className="hidden bg-[#d9e8fc] px-16 py-12 lg:flex lg:flex-col lg:justify-between dark:bg-slate-900">
          <div className="space-y-12">
            <BrandMark />

            <div className="space-y-5">
              <h1 className="max-w-[470px] text-[32px] font-bold leading-[1.28] tracking-[-0.01em] text-[#091426] dark:text-foreground">
                Quản lý mẫu, KIT và kết quả xét nghiệm trong một giao diện nội
                bộ
              </h1>
              <p className="max-w-[430px] text-base leading-7 text-[#1f2937] dark:text-muted-foreground">
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
              <BrandMark />
            </div>

            <div className="mb-12">
              <h2 className="mb-3 text-[28px] font-bold leading-tight tracking-[-0.01em] text-[#091426] dark:text-foreground">
                Đăng nhập hệ thống
              </h2>
              <p className="text-sm leading-6 text-[#334155] dark:text-muted-foreground">
                Chào mừng bạn quay trở lại. Vui lòng nhập thông tin để tiếp tục.
              </p>
            </div>

            <form action="/auth/login" method="post" className="space-y-6">
              <div className="space-y-3">
                <label
                  className="text-xs font-bold tracking-[0.02em] text-[#091426] dark:text-foreground"
                  htmlFor="username"
                >
                  Tên đăng nhập
                </label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập"
                  aria-invalid={hasInvalidCredentials}
                  aria-describedby={errorMessageId}
                  className="h-[50px] rounded-lg border-[#b7bfcc] bg-white px-4 text-base text-[#091426] shadow-none placeholder:text-[#8b95a5] focus-visible:border-[#0060ac] focus-visible:ring-[#0060ac]/15 dark:bg-background dark:text-foreground"
                  required
                />
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs font-bold tracking-[0.02em] text-[#091426] dark:text-foreground"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  aria-invalid={hasInvalidCredentials}
                  aria-describedby={errorMessageId}
                  className="h-[50px] rounded-lg border-[#b7bfcc] bg-white px-4 text-base text-[#091426] shadow-none placeholder:text-[#8b95a5] focus-visible:border-[#0060ac] focus-visible:ring-[#0060ac]/15 dark:bg-background dark:text-foreground"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <label
                  className="flex min-w-0 items-center gap-2 text-sm text-[#334155] dark:text-muted-foreground"
                  htmlFor="remember-session"
                >
                  <input
                    id="remember-session"
                    type="checkbox"
                    className="size-4 rounded border-[#b7bfcc] bg-white text-[#091426] focus:ring-2 focus:ring-[#0060ac]/20"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a
                  className="shrink-0 text-sm font-bold text-[#0060ac] underline-offset-4 hover:underline"
                  href="mailto:admin@lab-management.local"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {hasInvalidCredentials ? (
                <p
                  id="login-error"
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
                >
                  Tên đăng nhập hoặc mật khẩu không đúng.
                </p>
              ) : null}

              <LoginSubmitButton />
            </form>

            <div className="mt-12 border-t border-[#d9dee7] pt-6 text-center dark:border-border">
              <p className="text-xs font-semibold tracking-[0.04em] text-[#334155] dark:text-muted-foreground">
                © 2026 Lab Management. Đảm bảo độ chính xác lâm sàng.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-[#091426] text-white shadow-sm">
        <FlaskConical className="size-5" aria-hidden="true" />
      </div>
      <span className="text-2xl font-bold tracking-[-0.02em] text-[#091426] dark:text-foreground">
        LabFlow Precision
      </span>
    </div>
  );
}

function LabPreview() {
  return (
    <div className="relative mt-10 h-[258px] rounded-sm bg-white shadow-[0_14px_34px_rgb(15_23_42/0.14)] ring-1 ring-slate-200/80 dark:bg-background dark:ring-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgb(219_234_254/0.65),transparent_34%),linear-gradient(135deg,rgb(255_255_255),rgb(241_248_255))] dark:from-slate-950" />
      <div className="relative grid h-full grid-cols-[1fr_150px] items-center gap-8 px-10">
        <div className="relative h-36">
          <div className="absolute left-6 top-16 size-20 rounded-[18px] bg-[#d7e7fb] shadow-sm ring-1 ring-blue-100" />
          <div className="absolute left-24 top-7 size-16 rounded-[16px] bg-[#eff6ff] shadow-sm ring-1 ring-blue-100" />
          <div className="absolute left-32 top-20 size-24 rounded-[22px] bg-[#e4effd] shadow-sm ring-1 ring-blue-100" />
          <div className="absolute left-32 top-0 flex size-12 items-center justify-center rounded-full bg-[#c7ddf7] text-[#0f2744] shadow-sm">
            <Microscope className="size-6" aria-hidden="true" />
          </div>
          <div className="absolute left-10 top-6 h-12 w-5 rounded-full bg-[#bdd7f3]" />
          <div className="absolute left-16 top-2 h-16 w-5 rounded-full bg-[#dbeafe]" />
          <div className="absolute bottom-2 left-4 h-1 w-56 rounded-full bg-[#cfe0f5]" />
        </div>
        <div className="space-y-4 pl-3 text-[#7d8796]">
          <p className="text-sm font-semibold tracking-[0.08em]">
            LABLINK LOGIN
          </p>
          <div className="space-y-3">
            <div className="h-1.5 w-24 rounded-full bg-[#c8d2df]" />
            <div className="h-1.5 w-32 rounded-full bg-[#d6dee9]" />
          </div>
        </div>
      </div>
    </div>
  );
}
