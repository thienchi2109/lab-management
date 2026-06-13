"use client";

import { useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

type LoginSubmitButtonProps = {
  pending?: boolean;
};

/** Submit button that reflects the pending state of the login form. */
export function LoginSubmitButton({
  pending: pendingProp,
}: LoginSubmitButtonProps) {
  const formStatus = useFormStatus();
  const pending = pendingProp ?? formStatus.pending;

  return (
    <Button
      type="submit"
      className="h-[50px] w-full rounded-lg bg-[#091426] text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#1e293b] active:scale-[0.99] dark:bg-primary dark:text-primary-foreground"
      disabled={pending}
      aria-live="polite"
    >
      {pending ? "Đang đăng nhập" : "Đăng nhập"}
      <LogIn className="ml-2 size-4" aria-hidden="true" />
    </Button>
  );
}
