import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { SampleResultMetric } from "@/lib/sample-results/operations";

import { MetricInputRenderer } from "./metric-input-renderer";

const source = readFileSync(
  join(
    process.cwd(),
    "app/dashboard/samples/[sampleId]/results/_components/metric-input-renderer.tsx"
  ),
  "utf8"
);

const metricBase: Omit<SampleResultMetric, "inputType"> = {
  id: "metric-1",
  code: "METRIC",
  name: "Chỉ tiêu",
  unit: null,
  options: ["Âm tính", "Dương tính"],
  metricSettings: {},
  sortOrder: 10,
  isRequired: true,
};

describe("MetricInputRenderer", () => {
  test("uses the shared Checkbox component for boolean inputs", () => {
    expect(source).toContain('from "@/components/ui/checkbox"');
    expect(source).not.toContain('type="checkbox"');
  });

  test("renders numeric, text, textarea, select, multi-select, boolean, scale, percent and PCR inputs", () => {
    const inputTypes = [
      "number",
      "text",
      "textarea",
      "select",
      "multi_select",
      "boolean",
      "scale_1_5",
      "percent",
      "pcr_qualitative",
      "pcr_realtime",
    ] as const;

    const html = renderToStaticMarkup(
      <div>
        {inputTypes.map((inputType) => (
          <MetricInputRenderer
            key={inputType}
            metric={{ ...metricBase, id: inputType, inputType }}
            value={null}
            readOnly={false}
          />
        ))}
      </div>
    );

    expect(html).toContain('name="results[number]"');
    expect(html).toContain('name="results[text]"');
    expect(html).toContain("<textarea");
    expect(html).toContain('name="results[select]"');
    expect(html).toContain('name="results[multi_select]"');
    expect(html).toContain('role="checkbox"');
    expect(html).toContain('data-slot="checkbox"');
    expect(html).toContain('min="1"');
    expect(html).toContain('max="100"');
    expect(html).toContain('name="results[pcr_qualitative][status]"');
    expect(html).toContain('name="results[pcr_realtime][ct]"');
    expect(html).toContain("grid gap-1 text-sm font-medium");
    expect(html).toContain("min-h-16");
    expect(html).toContain("h-9");
    expect(html).toContain("py-1.5");
  });

  test("keeps PCR realtime CT optional while status remains the primary result", () => {
    const html = renderToStaticMarkup(
      <MetricInputRenderer
        metric={{ ...metricBase, id: "metric-pcr", inputType: "pcr_realtime" }}
        value={{ status: "negative", ct: null }}
        readOnly={false}
      />
    );

    expect(html).toContain('name="results[metric-pcr][status]"');
    expect(html).toContain('value="negative"');
    expect(html).toContain('name="results[metric-pcr][ct]"');
    expect(html).not.toContain('name="results[metric-pcr][ct]" required');
  });
});
