"use client";

import { useEffect, useState } from "react";

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
  const defaultLabel =
    options.find((option) => option.id === defaultIdValue)?.label ??
    defaultTextValue ??
    "";
  const [draftText, setDraftText] = useState(defaultLabel);
  const [debouncedText, setDebouncedText] = useState(defaultLabel);
  const isDebouncing = draftText !== debouncedText;
  const selectedId = isDebouncing
    ? ""
    : uniqueOptionIdForLabel(options, debouncedText);
  const normalizedSearch = debouncedText.trim().toLocaleLowerCase("vi-VN");
  const visibleOptions = normalizedSearch
    ? options.filter((option) =>
        option.label.toLocaleLowerCase("vi-VN").includes(normalizedSearch)
      )
    : options;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedText(draftText);
    }, COMBOBOX_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [draftText]);

  return (
    <label className="space-y-1.5 text-sm font-medium" htmlFor={inputId}>
      <span>{label}</span>
      <input name={idName} type="hidden" value={selectedId} />
      <Input
        id={inputId}
        list={listId}
        name={textName}
        onChange={(event) => setDraftText(event.currentTarget.value)}
        placeholder={placeholder}
        value={draftText}
      />
      <datalist id={listId}>
        {visibleOptions.map((option) => (
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

function uniqueOptionIdForLabel(
  options: SampleGridFilterOption[],
  label: string
) {
  let matchedId = "";
  let matchCount = 0;

  for (const option of options) {
    if (option.label === label) {
      matchedId = option.id;
      matchCount += 1;
    }
  }

  return matchCount === 1 ? matchedId : "";
}
