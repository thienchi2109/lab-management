import { describe, expect, test } from "vitest";

import {
  groupConclusionFieldName,
  pcrCtFieldName,
  pcrStatusFieldName,
  resultFieldName,
} from "./result-field-names";

describe("dynamic result field names", () => {
  test("keeps render and form parsing field names in one contract", () => {
    expect(resultFieldName("metric-1")).toBe("results[metric-1]");
    expect(pcrStatusFieldName("metric-1")).toBe("results[metric-1][status]");
    expect(pcrCtFieldName("metric-1")).toBe("results[metric-1][ct]");
    expect(groupConclusionFieldName("group-1")).toBe(
      "groupConclusions[group-1]"
    );
  });
});
