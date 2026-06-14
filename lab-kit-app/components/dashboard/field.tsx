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
  className,
  inputClassName,
}: FieldProps) {
  const errorId = useId();

  return (
    <label
      className={className ?? "block w-full space-y-1.5 text-sm font-medium"}
    >
      <span className="text-xs font-semibold text-zinc-700">{label}</span>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={inputClassName}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}
