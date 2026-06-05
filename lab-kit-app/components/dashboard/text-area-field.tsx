import type { FieldProps } from "./form-field-types";

export function TextAreaField({
  label,
  name,
  defaultValue,
}: Omit<FieldProps, "type" | "required">) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        className="min-h-20 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </label>
  );
}
