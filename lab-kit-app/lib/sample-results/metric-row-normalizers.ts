import {
  isResultInputType,
  type ResultInputType,
} from "@/lib/result-configuration/configuration";

/** Normalize unknown result metric option payloads from Supabase rows. */
export function normalizeOptions(value: unknown) {
  return Array.isArray(value)
    ? value.filter((option): option is string => typeof option === "string")
    : [];
}

/** Keep only JSON-safe metric settings, preserving numeric threshold fields. */
export function normalizeMetricSettings(
  value: unknown
): Record<string, unknown> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, setting]) => {
      if (isNumericSettingKey(key)) {
        return typeof setting === "number" && Number.isFinite(setting)
          ? [[key, setting]]
          : [];
      }

      return isJsonValue(setting) ? [[key, setting]] : [];
    })
  );
}

/** Normalize stale or unknown input type values to the text renderer. */
export function normalizeInputType(value: string): ResultInputType {
  return isResultInputType(value) ? value : "text";
}

function isNumericSettingKey(key: string) {
  return key === "min" || key === "max" || key === "ct_min" || key === "ct_max";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (isRecord(value)) {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}
