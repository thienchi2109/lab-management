import { Input } from "@/components/ui/input";
import type { SampleResultMetric } from "@/lib/sample-results/operations";

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
  const name = `results[${metric.id}]`;
  const inputId = `metric-${metric.id}`;

  return (
    <div className="grid gap-1.5 text-sm font-medium">
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
          className="min-h-20 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          className="h-10 rounded-lg border border-input bg-background px-2.5 text-sm"
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
          className="min-h-24 rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
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
        <span className="flex items-center gap-2">
          <input type="hidden" name={name} value="false" />
          <label htmlFor={inputId} className="flex items-center gap-2">
            <input
              id={inputId}
              aria-label={metric.name}
              name={name}
              type="checkbox"
              value="true"
              defaultChecked={value === true}
              disabled={readOnly}
              className="size-4"
            />
            Có
          </label>
        </span>
      );
    case "pcr_qualitative":
      return (
        <PcrStatusInputs
          inputId={inputId}
          name={name}
          value={value}
          readOnly={readOnly}
        />
      );
    case "pcr_realtime":
      return (
        <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
          <PcrStatusInputs
            inputId={inputId}
            name={name}
            value={value}
            readOnly={readOnly}
          />
          <Input
            id={`${inputId}-ct`}
            aria-label={`${metric.name} CT`}
            name={`${name}[ct]`}
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
  name,
  value,
  readOnly,
}: {
  inputId: string;
  name: string;
  value: unknown;
  readOnly: boolean;
}) {
  const status = pcrStatusValue(value);

  return (
    <select
      id={inputId}
      name={`${name}[status]`}
      defaultValue={status}
      disabled={readOnly}
      className="h-10 rounded-lg border border-input bg-background px-2.5 text-sm"
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
