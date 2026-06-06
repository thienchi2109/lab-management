import { useId } from "react";

import { Input } from "@/components/ui/input";

import { FieldError } from "./field-error";
import type { FieldProps } from "./form-field-types";

/** Render input dashboard có hỗ trợ lỗi field-level. */
export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  error,
}: FieldProps) {
  const errorId = useId();

  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}
