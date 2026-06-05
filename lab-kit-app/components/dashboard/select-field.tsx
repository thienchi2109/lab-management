import { AppSelect } from "./app-select";
import type { SelectFieldProps } from "./form-field-types";

export function SelectField({
  label,
  name,
  defaultValue,
  options,
}: SelectFieldProps) {
  return (
    <AppSelect
      label={label}
      name={name}
      defaultValue={defaultValue !== undefined ? String(defaultValue) : ""}
      options={options.map(([value, optionLabel]) => ({
        value,
        label: optionLabel,
      }))}
    />
  );
}
