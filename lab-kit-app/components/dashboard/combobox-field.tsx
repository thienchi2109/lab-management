"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type ComboboxFieldOption,
  uniqueOptionIdForLabel,
} from "./combobox-field-utils";

type ComboboxFieldProps = {
  defaultIdValue?: string;
  defaultTextValue?: string;
  debounceMs?: number;
  error?: string;
  idName: string;
  inputClassName?: string;
  inputId: string;
  label: string;
  listId: string;
  options: ComboboxFieldOption[];
  placeholder: string;
  textName?: string;
  className?: string;
};

/** Render a searchable input that submits the uniquely matched option ID. */
export function ComboboxField({
  defaultIdValue,
  defaultTextValue,
  debounceMs = 0,
  error,
  idName,
  inputClassName,
  inputId,
  label,
  listId,
  options,
  placeholder,
  textName,
  className,
}: ComboboxFieldProps) {
  const defaultLabel =
    options.find((option) => option.id === defaultIdValue)?.label ??
    defaultTextValue ??
    "";
  const [draftText, setDraftText] = useState(defaultLabel);
  const [selectedText, setSelectedText] = useState(defaultLabel);
  const [hasEdited, setHasEdited] = useState(false);
  const activeText = debounceMs > 0 ? selectedText : draftText;
  const isDebouncing = debounceMs > 0 && draftText !== selectedText;
  const selectedId =
    !hasEdited && activeText === defaultLabel
      ? (defaultIdValue ?? "")
      : uniqueOptionIdForLabel(options, activeText);
  const normalizedSearch = activeText.trim().toLocaleLowerCase("vi-VN");
  const visibleOptions = normalizedSearch
    ? options.filter((option) =>
        option.label.toLocaleLowerCase("vi-VN").includes(normalizedSearch)
      )
    : options;

  useEffect(() => {
    if (debounceMs <= 0) return;

    const timer = window.setTimeout(() => {
      setSelectedText(draftText);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, draftText]);

  return (
    <label
      className={cn(
        "flex w-full flex-col gap-1.5 text-sm font-medium",
        className
      )}
      htmlFor={inputId}
    >
      <span>{label}</span>
      <input
        name={idName}
        type="hidden"
        value={isDebouncing ? "" : selectedId}
      />
      <Input
        aria-invalid={error ? true : undefined}
        id={inputId}
        list={listId}
        name={textName}
        onChange={(event) => {
          setHasEdited(true);
          setDraftText(event.currentTarget.value);
        }}
        placeholder={placeholder}
        value={draftText}
        className={inputClassName}
      />
      <datalist id={listId}>
        {visibleOptions.map((option) => (
          <option
            aria-label={option.label}
            data-option-id={option.id}
            key={`${option.id}:${option.label}`}
            label={option.label}
            value={option.label}
          />
        ))}
      </datalist>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}
