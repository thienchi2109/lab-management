import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { SampleResultMetric } from "@/lib/sample-results/operations";

import {
  pcrCtFieldName,
  pcrStatusFieldName,
  resultFieldName,
} from "./result-field-names";

type MetricInputRendererProps = {
  metric: SampleResultMetric;
  value: unknown;
  readOnly: boolean;
};

type MetricInputControlProps = MetricInputRendererProps & {
  inputId: string;
  name: string;
};

/** Render input động cho một chỉ tiêu kết quả theo input_type. */
export function MetricInputRenderer({
  metric,
  value,
  readOnly,
}: MetricInputRendererProps) {
  const name = resultFieldName(metric.id);
  const inputId = `metric-${metric.id}`;

  return (
    <div className="grid gap-1 text-sm font-medium">
      <label htmlFor={inputId}>
        {metric.name}
        {metric.unit ? (
          <span className="text-muted-foreground"> ({metric.unit})</span>
        ) : null}
      </label>
      <MetricInputControl
        inputId={inputId}
        metric={metric}
        name={name}
        value={value}
        readOnly={readOnly}
      />
    </div>
  );
}

function MetricInputControl({
  inputId,
  metric,
  name,
  value,
  readOnly,
}: MetricInputControlProps) {
  switch (metric.inputType) {
    case "number":
      return (
        <Input
          id={inputId}
          name={name}
          type="number"
          step="any"
          defaultValue={stringValue(value)}
          disabled={readOnly}
          required={metric.isRequired}
        />
      );
    case "percent":
      return (
        <Input
          id={inputId}
          name={name}
          type="number"
          min={0}
          max={100}
          step="any"
          defaultValue={stringValue(value)}
          disabled={readOnly}
          required={metric.isRequired}
        />
      );
    case "scale_1_5":
      return (
        <Input
          id={inputId}
          name={name}
          type="number"
          min={1}
          max={5}
          step={1}
          defaultValue={stringValue(value)}
          disabled={readOnly}
          required={metric.isRequired}
        />
      );
    case "textarea":
      return (
        <textarea
          id={inputId}
          aria-label={metric.name}
          name={name}
          defaultValue={stringValue(value)}
          disabled={readOnly}
          required={metric.isRequired}
          className="min-h-16 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      );
    case "select":
      return (
        <select
          id={inputId}
          aria-label={metric.name}
          name={name}
          defaultValue={stringValue(value)}
          disabled={readOnly}
          required={metric.isRequired}
          className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
        >
          <option value="">Chọn</option>
          {stringOptions(metric).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "multi_select":
      return (
        <select
          id={inputId}
          aria-label={metric.name}
          name={name}
          multiple
          defaultValue={arrayValue(value)}
          disabled={readOnly}
          className="min-h-20 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm"
        >
          {stringOptions(metric).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "boolean":
      return (
        <span className="flex items-center gap-1.5">
          <input type="hidden" name={name} value="false" />
          <label htmlFor={inputId} className="flex items-center gap-1.5">
            <Checkbox
              id={inputId}
              aria-label={metric.name}
              name={name}
              value="true"
              defaultChecked={value === true}
              disabled={readOnly}
            />
            Có
          </label>
        </span>
      );
    case "pcr_qualitative":
      return (
        <PcrStatusInputs
          inputId={inputId}
          metricId={metric.id}
          value={value}
          readOnly={readOnly}
        />
      );
    case "pcr_realtime":
      return (
        <div className="grid gap-1.5 sm:grid-cols-[1fr_140px]">
          <PcrStatusInputs
            inputId={inputId}
            metricId={metric.id}
            value={value}
            readOnly={readOnly}
          />
          <Input
            id={`${inputId}-ct`}
            aria-label={`${metric.name} CT`}
            name={pcrCtFieldName(metric.id)}
            type="number"
            step="any"
            placeholder="CT"
            defaultValue={pcrCtValue(value)}
            disabled={readOnly}
          />
        </div>
      );
    case "text":
      return (
        <Input
          id={inputId}
          name={name}
          defaultValue={stringValue(value)}
          disabled={readOnly}
          required={metric.isRequired}
        />
      );
  }
}

function PcrStatusInputs({
  inputId,
  metricId,
  value,
  readOnly,
}: {
  inputId: string;
  metricId: string;
  value: unknown;
  readOnly: boolean;
}) {
  const status = pcrStatusValue(value);

  return (
    <select
      id={inputId}
      name={pcrStatusFieldName(metricId)}
      defaultValue={status}
      disabled={readOnly}
      className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
    >
      <option value="negative">Âm tính</option>
      <option value="positive">Dương tính</option>
    </select>
  );
}

function stringOptions(metric: SampleResultMetric) {
  return metric.options.flatMap((option) =>
    typeof option === "string" ? [option] : []
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? value : "";
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter(isString) : [];
}

function pcrStatusValue(value: unknown) {
  return isRecord(value) && value.status === "positive"
    ? "positive"
    : "negative";
}

function pcrCtValue(value: unknown) {
  if (!isRecord(value)) return "";
  const ct = value.ct;
  return typeof ct === "number" ? ct : "";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
