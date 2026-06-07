import type { SampleResultEntry } from "@/lib/sample-results/operations";

import { MetricInputRenderer } from "./metric-input-renderer";
import { groupConclusionFieldName } from "./result-field-names";

type ResultGroup = SampleResultEntry["groups"][number];

type ResultGroupAccordionProps = {
  group: ResultGroup;
  results: Record<string, unknown>;
  readOnly: boolean;
};

/** Render một nhóm nhập kết quả với tiến độ và KQ_CHUNG. */
export function ResultGroupAccordion({
  group,
  results,
  readOnly,
}: ResultGroupAccordionProps) {
  const isPcr = group.metrics.some((metric) =>
    metric.inputType.startsWith("pcr_")
  );

  return (
    <details open className="rounded-lg border bg-background p-4">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold">{group.name}</h2>
            <p className="text-sm text-muted-foreground">
              {group.enteredMetrics}/{group.totalMetrics} chỉ tiêu
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-md border px-2 py-1">
              KQ_CHUNG: {group.kqChung ?? "Chưa có"}
            </span>
            <span className="rounded-md border px-2 py-1">
              {group.abnormalMetrics} bất thường
            </span>
          </div>
        </div>
      </summary>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {group.metrics.map((metric) => (
          <MetricInputRenderer
            key={metric.id}
            metric={metric}
            value={results[metric.id] ?? null}
            readOnly={readOnly}
          />
        ))}
      </div>
      {!isPcr ? (
        <label className="mt-4 grid gap-1.5 text-sm font-medium">
          Kết luận nhóm
          <textarea
            name={groupConclusionFieldName(group.id)}
            defaultValue={group.kqChung ?? ""}
            disabled={readOnly}
            className="min-h-20 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      ) : null}
    </details>
  );
}
