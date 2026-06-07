import type { SampleResultMetric } from "./operations";

/** Validate and normalize a submitted value according to metric input type. */
export function validateMetricValue(
  metric: SampleResultMetric,
  value: unknown
) {
  switch (metric.inputType) {
    case "number":
    case "percent":
    case "scale_1_5":
      return validateNumber(metric, value);
    case "text":
    case "textarea":
      return validateText(value);
    case "select":
      return validateOption(metric, value);
    case "multi_select":
      return validateMultiOption(metric, value);
    case "boolean":
      return validateBoolean(value);
    case "pcr_qualitative":
    case "pcr_realtime":
      return validatePcr(metric, value);
  }
}

/** Return true when a PCR value has the positive primary status. */
export function isPositivePcrValue(value: unknown) {
  return isRecord(value) && value.status === "positive";
}

/** Return true when a value should count as abnormal for group progress. */
export function isAbnormalMetricValue(
  metric: SampleResultMetric,
  value: unknown
) {
  if (metric.inputType.startsWith("pcr_")) {
    return isPositivePcrValue(value);
  }

  if (typeof value !== "number") {
    return false;
  }

  const min = getNumberSetting(metric, "min");
  const max = getNumberSetting(metric, "max");
  return (min !== null && value < min) || (max !== null && value > max);
}

function validateNumber(metric: SampleResultMetric, value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`${metric.name} phải là số hợp lệ.`);
  }

  const min = getNumberSetting(metric, "min");
  const max = getNumberSetting(metric, "max");

  if (min !== null && numberValue < min) {
    throw new Error(`${metric.name} nhỏ hơn ngưỡng tối thiểu.`);
  }

  if (max !== null && numberValue > max) {
    throw new Error(`${metric.name} vượt ngưỡng tối đa.`);
  }

  if (
    metric.inputType === "percent" &&
    (numberValue < 0 || numberValue > 100)
  ) {
    throw new Error(`${metric.name} phải nằm trong khoảng 0-100%.`);
  }

  if (
    metric.inputType === "scale_1_5" &&
    (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 5)
  ) {
    throw new Error(`${metric.name} phải nằm trong thang 1-5.`);
  }

  return numberValue;
}

function validateText(value: unknown) {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function validateOption(metric: SampleResultMetric, value: unknown) {
  if (typeof value !== "string" || !optionSet(metric).has(value)) {
    throw new Error(`${metric.name} có lựa chọn không hợp lệ.`);
  }

  return value;
}

function validateMultiOption(metric: SampleResultMetric, value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error(`${metric.name} có lựa chọn không hợp lệ.`);
  }

  const options = optionSet(metric);

  if (value.some((item) => typeof item !== "string" || !options.has(item))) {
    throw new Error(`${metric.name} có lựa chọn không hợp lệ.`);
  }

  return value;
}

function validateBoolean(value: unknown) {
  if (typeof value !== "boolean") {
    throw new Error("Giá trị boolean không hợp lệ.");
  }

  return value;
}

function validatePcr(metric: SampleResultMetric, value: unknown) {
  if (!isRecord(value)) {
    throw new Error(`${metric.name} có kết quả PCR không hợp lệ.`);
  }

  const status = value.status;

  if (status !== "negative" && status !== "positive") {
    throw new Error(`${metric.name} có trạng thái PCR không hợp lệ.`);
  }

  const ct = value.ct ?? null;

  if (ct !== null) {
    validateNumber(metric, ct);
  }

  return { status, ct };
}

function getNumberSetting(metric: SampleResultMetric, key: "min" | "max") {
  const value = metric.metricSettings[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionSet(metric: SampleResultMetric) {
  return new Set(
    metric.options.flatMap((option) =>
      typeof option === "string" ? [option] : []
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
