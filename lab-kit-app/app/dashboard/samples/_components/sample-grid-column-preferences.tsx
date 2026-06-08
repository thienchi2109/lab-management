"use client";

import { useMemo, useSyncExternalStore } from "react";

import { Checkbox } from "@/components/ui/checkbox";

/** Cấu hình một cột Sample Grid có thể lưu preference trong browser. */
export type SampleGridColumnPreference = Readonly<{
  key: string;
  label: string;
  locked?: boolean;
}>;

type SampleGridColumnPreferencesProps = {
  columns: readonly SampleGridColumnPreference[];
  storageKey?: string;
};

const defaultStorageKey = "lab-management.sample-grid.columns.v1";
const sampleGridColumnPreferencesEvent =
  "lab-management:sample-grid-column-preferences";

/** Lưu tùy chọn ẩn/hiện cột của sample grid trong browser hiện tại. */
export function SampleGridColumnPreferences({
  columns,
  storageKey = defaultStorageKey,
}: SampleGridColumnPreferencesProps) {
  const hiddenKeys = useSampleGridHiddenColumnKeys(columns, storageKey);
  const hiddenKeySet = useMemo(() => new Set(hiddenKeys), [hiddenKeys]);

  return (
    <fieldset className="rounded-lg border bg-background p-4">
      <legend className="px-1 text-sm font-medium">Tùy chọn cột</legend>
      <div className="mt-3 flex flex-wrap gap-3">
        {columns.map((column) => {
          const isVisible = !hiddenKeySet.has(column.key);

          return (
            <label
              key={column.key}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Checkbox
                aria-label={`Hiển thị ${column.label}`}
                checked={column.locked || isVisible}
                disabled={column.locked}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  const nextHiddenKeys = isChecked
                    ? hiddenKeys.filter((key) => key !== column.key)
                    : [...new Set([...hiddenKeys, column.key])];

                  writeHiddenKeys(storageKey, nextHiddenKeys);
                }}
              />
              <span>Hiển thị {column.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Đọc danh sách cột Sample Grid đang bị ẩn từ browser preference. */
export function useSampleGridHiddenColumnKeys(
  columns: readonly SampleGridColumnPreference[],
  storageKey = defaultStorageKey
) {
  const storedHiddenKeys = useSyncExternalStore(
    subscribeColumnPreferences,
    () => readStoredHiddenKeys(storageKey),
    () => "[]"
  );

  return useMemo(
    () => parseHiddenKeys(storedHiddenKeys, columns),
    [columns, storedHiddenKeys]
  );
}

function subscribeColumnPreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(sampleGridColumnPreferencesEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(sampleGridColumnPreferencesEvent, callback);
  };
}

function readStoredHiddenKeys(storageKey: string) {
  try {
    return localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseHiddenKeys(
  storedHiddenKeys: string,
  columns: readonly SampleGridColumnPreference[]
) {
  const allowedKeys = new Set<string>();

  for (const column of columns) {
    if (!column.locked) {
      allowedKeys.add(column.key);
    }
  }

  try {
    const parsed = JSON.parse(storedHiddenKeys);

    return Array.isArray(parsed)
      ? parsed.filter((key): key is string => allowedKeys.has(key))
      : [];
  } catch {
    return [];
  }
}

function writeHiddenKeys(storageKey: string, hiddenKeys: string[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(hiddenKeys));
    window.dispatchEvent(new Event(sampleGridColumnPreferencesEvent));
  } catch {
    return;
  }
}
