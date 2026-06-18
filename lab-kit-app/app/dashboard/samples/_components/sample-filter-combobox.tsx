import { ComboboxField } from "@/components/dashboard/combobox-field";
import type { SampleGridFilterOption } from "@/lib/sample-grid/operations";

type SampleFilterComboboxProps = {
  defaultIdValue?: string;
  defaultTextValue?: string;
  idName: string;
  inputId: string;
  label: string;
  listId: string;
  options: SampleGridFilterOption[];
  placeholder: string;
  textName: string;
};

const COMBOBOX_SEARCH_DEBOUNCE_MS = 300;

/** Render combobox lọc mẫu hỗ trợ chọn option theo ID và nhập text tự do. */
export function SampleFilterCombobox({
  defaultIdValue,
  defaultTextValue,
  idName,
  inputId,
  label,
  listId,
  options,
  placeholder,
  textName,
}: SampleFilterComboboxProps) {
  return (
    <ComboboxField
      debounceMs={COMBOBOX_SEARCH_DEBOUNCE_MS}
      defaultIdValue={defaultIdValue}
      defaultTextValue={defaultTextValue}
      idName={idName}
      inputId={inputId}
      label={label}
      listId={listId}
      options={options}
      placeholder={placeholder}
      textName={textName}
    />
  );
}
