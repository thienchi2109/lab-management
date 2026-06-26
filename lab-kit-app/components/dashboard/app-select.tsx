"use client";

import { useId, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { FieldError } from "./field-error";

export type AppSelectOption = {
  value: string;
  label: string;
};

const emptyOptionValue = "__app_select_empty__";

type AppSelectProps = {
  label: string;
  options: AppSelectOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "default";
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  error?: string;
};

/** Render Radix select theo kiểu dashboard, có hỗ trợ lỗi field-level. */
export function AppSelect({
  label,
  options,
  name,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Chọn",
  size = "default",
  className,
  labelClassName,
  triggerClassName,
  error,
}: AppSelectProps) {
  const labelId = useId();
  const errorId = useId();
  const [localValue, setLocalValue] = useState(defaultValue);
  const selectedValue = value ?? localValue;
  const hasEmptyOption = options.some((option) => option.value === "");
  const radixValue =
    selectedValue === "" && hasEmptyOption ? emptyOptionValue : selectedValue;

  function handleValueChange(nextValue: string) {
    const formValue = nextValue === emptyOptionValue ? "" : nextValue;

    if (value === undefined) {
      setLocalValue(formValue);
    }

    onValueChange?.(formValue);
  }

  return (
    <div className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      <span id={labelId} className={labelClassName}>
        {label}
      </span>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      <Select value={radixValue} onValueChange={handleValueChange}>
        <SelectTrigger
          aria-labelledby={labelId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full rounded-md border-input bg-card px-3 text-sm shadow-xs hover:bg-accent/40",
            triggerClassName
          )}
          size={size}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          align="start"
          position="popper"
          sideOffset={6}
          className="z-[70] max-h-72 rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-primary/10 ring-1 ring-primary/10"
        >
          <SelectGroup>
            {options.map((option, index) => (
              <SelectItem
                key={`${index}:${option.value}`}
                value={option.value === "" ? emptyOptionValue : option.value}
                className="min-h-10 rounded-lg px-3 py-2 text-sm data-[state=checked]:bg-accent data-[state=checked]:font-medium data-[state=checked]:text-accent-foreground"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
