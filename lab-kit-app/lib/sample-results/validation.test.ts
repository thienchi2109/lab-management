import { describe, expect, test } from "vitest";

import type { SampleResultMetric } from "./operations";
import { validateMetricValue } from "./validation";

const baseMetric: SampleResultMetric = {
  id: "metric-1",
  code: "NUM",
  name: "Số lượng",
  inputType: "number",
  unit: null,
  options: [],
  metricSettings: {},
  sortOrder: 10,
  isRequired: true,
};

describe("validateMetricValue", () => {
  test("rejects non-number primitives for numeric metrics", () => {
    for (const value of [true, false, null, "7.8"]) {
      expect(() => validateMetricValue(baseMetric, value)).toThrow(
        "Số lượng phải là số hợp lệ."
      );
    }
  });

  test("uses dedicated PCR CT bounds when configured", () => {
    const metric: SampleResultMetric = {
      ...baseMetric,
      name: "WSSV",
      inputType: "pcr_realtime",
      metricSettings: {
        min: 0,
        max: 10,
        ct_min: 20,
        ct_max: 40,
      },
    };

    expect(validateMetricValue(metric, { status: "positive", ct: 30 })).toEqual(
      {
        status: "positive",
        ct: 30,
      }
    );
  });
});
