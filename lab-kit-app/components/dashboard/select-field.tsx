import { AppSelect } from "./app-select";
import type { SelectFieldProps } from "./form-field-types";

/** Render select dashboard tương thích FormData và lỗi field-level. */
export function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
}: SelectFieldProps) {
  return (
    <AppSelect
      label={label}
      name={name}
      defaultValue={defaultValue !== undefined ? String(defaultValue) : ""}
      error={error}
      options={options.map(([value, optionLabel]) => ({
        value,
        label: optionLabel,
      }))}
    />
  );
}
