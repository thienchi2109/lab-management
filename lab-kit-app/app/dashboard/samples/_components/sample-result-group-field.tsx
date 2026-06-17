"use client";

import { useId } from "react";

import { FieldError } from "@/components/dashboard/field-error";
import type { ResultGroupOption } from "@/lib/sample-metadata/metadata";

type SampleResultGroupFieldProps = {
  className?: string;
  error?: string;
  options: ResultGroupOption[];
  selectedIds: string[];
};

/** Render nhóm checkbox để chọn nhiều nhóm chỉ tiêu cho form metadata mẫu. */
export function SampleResultGroupField({
  className,
  error,
  options,
  selectedIds,
}: SampleResultGroupFieldProps) {
  const errorId = useId();
  const selected = new Set(selectedIds);

  return (
    <fieldset
      className={className}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="text-xs font-semibold text-foreground">
        Nhóm chỉ tiêu
      </legend>
      {options.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex min-h-9 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
            >
              <input
                className="size-4 accent-primary"
                defaultChecked={selected.has(option.id)}
                name="resultGroupIds"
                type="checkbox"
                value={option.id}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-2 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Chưa có nhóm chỉ tiêu active.
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
