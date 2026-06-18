"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
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
  const optionByLabel = useMemo(
    () => new Map(options.map((option) => [option.label, option.id])),
    [options]
  );
  const defaultLabel =
    options.find((option) => option.id === defaultIdValue)?.label ??
    defaultTextValue ??
    "";
  const [text, setText] = useState(defaultLabel);
  const selectedId = optionByLabel.get(text) ?? "";

  return (
    <label className="space-y-1.5 text-sm font-medium" htmlFor={inputId}>
      <span>{label}</span>
      <input name={idName} type="hidden" value={selectedId} />
      <Input
        id={inputId}
        list={listId}
        name={textName}
        onChange={(event) => setText(event.currentTarget.value)}
        placeholder={placeholder}
        value={text}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option
            aria-label={option.label}
            data-option-id={option.id}
            key={option.id}
            label={option.label}
            value={option.label}
          />
        ))}
      </datalist>
    </label>
  );
}
