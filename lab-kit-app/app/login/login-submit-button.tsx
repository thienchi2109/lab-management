"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

/** Submit button that reflects the pending state of the login form. */
export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="h-11 w-full rounded-lg text-sm font-semibold"
      disabled={pending}
      aria-live="polite"
    >
      {pending ? "Đang đăng nhập" : "Đăng nhập"}
    </Button>
  );
}
