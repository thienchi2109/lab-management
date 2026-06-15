"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

import { LoginSubmitButton } from "./login-submit-button";

type LoginFormProps = {
  hasInvalidCredentials: boolean;
  errorMessageId?: string;
};

/** Render the login form and keep controls locked after submit navigation starts. */
export function LoginForm({
  hasInvalidCredentials,
  errorMessageId,
}: LoginFormProps) {
  const [pending, setPending] = useState(false);
  const [viewerPending, setViewerPending] = useState(false);

  return (
    <>
      <form
        action="/auth/login"
        method="post"
        className="space-y-6"
        aria-busy={pending}
        aria-labelledby="login-heading"
        onSubmit={() => setPending(true)}
      >
        <div className="space-y-6">
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
              readOnly={pending}
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
              readOnly={pending}
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

          <LoginSubmitButton pending={pending} />
        </div>
      </form>
      <form
        action="/auth/viewer-login"
        method="post"
        className="mt-4"
        aria-busy={viewerPending}
        onSubmit={() => setViewerPending(true)}
      >
        <LoginSubmitButton
          label="Đăng nhập với vai trò người xem"
          pending={viewerPending}
          pendingLabel="Đang đăng nhập người xem"
        />
      </form>
    </>
  );
}
