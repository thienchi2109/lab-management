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

  function handleValueChange(nextValue: string) {
    if (value === undefined) {
      setLocalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  return (
    <div className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      <span id={labelId} className={labelClassName}>
        {label}
      </span>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger
          aria-labelledby={labelId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn("w-full", triggerClassName)}
          size={size}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
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
