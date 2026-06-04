import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  return (
    <main className="flex min-h-svh items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <section className="grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
        <div className="hidden min-w-0 space-y-5 md:block">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FlaskConical className="size-6" />
          </div>
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Quản lý mẫu, KIT và kết quả xét nghiệm trong một giao diện nội bộ.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Đăng nhập bằng tài khoản được cấp để theo dõi mẫu, cấu hình chỉ
              tiêu và chuẩn bị dữ liệu báo cáo.
            </p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Sử dụng tên đăng nhập nội bộ và mật khẩu của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/auth/login" method="post" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="username">
                  Tên đăng nhập
                </label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="admin"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {hasInvalidCredentials ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Tên đăng nhập hoặc mật khẩu không đúng.
                </p>
              ) : null}

              <Button type="submit" className="h-10 w-full">
                Đăng nhập
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
