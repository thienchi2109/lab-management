import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="hidden min-w-0 space-y-7 lg:block">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <FlaskConical className="size-6" />
          </div>
          <div className="max-w-xl space-y-4">
            <h1 className="text-3xl leading-tight font-semibold text-balance text-foreground">
              Quản lý mẫu, KIT và kết quả xét nghiệm trong một giao diện nội bộ
            </h1>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground">
              Đăng nhập bằng tài khoản được cấp để theo dõi mẫu, cấu hình chỉ
              tiêu và chuẩn bị dữ liệu báo cáo.
            </p>
          </div>
        </div>

        <Card className="w-full rounded-xl border border-border/70 bg-background/95 shadow-sm ring-0 dark:bg-card/95">
          <CardHeader className="gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary lg:hidden">
              <FlaskConical className="size-5" />
            </div>
            <CardTitle className="text-xl leading-tight">
              Đăng nhập hệ thống
            </CardTitle>
            <CardDescription>
              Sử dụng tên đăng nhập nội bộ và mật khẩu của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            <form action="/auth/login" method="post" className="space-y-5">
              <div className="space-y-2.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="username"
                >
                  Tên đăng nhập
                </label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  aria-invalid={hasInvalidCredentials}
                  aria-describedby={errorMessageId}
                  className="h-11 rounded-lg bg-background px-3"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={hasInvalidCredentials}
                  aria-describedby={errorMessageId}
                  className="h-11 rounded-lg bg-background px-3"
                  required
                />
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
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
