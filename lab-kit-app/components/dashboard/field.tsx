import { Input } from "@/components/ui/input";

import type { FieldProps } from "./form-field-types";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: FieldProps) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </label>
  );
}
