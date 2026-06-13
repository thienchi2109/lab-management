import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ResultGroupAccordion } from "./result-group-accordion";

describe("ResultGroupAccordion", () => {
  test("renders progress, group conclusion label, abnormal count, metrics and manual conclusion", () => {
    const html = renderToStaticMarkup(
      <ResultGroupAccordion
        group={{
          id: "group-1",
          code: "WATER",
          name: "Chất lượng nước",
          sortOrder: 10,
          enteredMetrics: 1,
          totalMetrics: 2,
          kqChung: "Đạt yêu cầu",
          abnormalMetrics: 1,
          metrics: [
            {
              id: "metric-ph",
              code: "PH",
              name: "pH",
              inputType: "number",
              unit: null,
              options: [],
              metricSettings: {},
              sortOrder: 10,
              isRequired: true,
            },
          ],
        }}
        results={{ "metric-ph": 7.8 }}
        readOnly={false}
      />
    );

    expect(html).toContain("Chất lượng nước");
    expect(html).toContain("1/2 chỉ tiêu");
    expect(html).toContain("Kết Quả Chung");
    expect(html).not.toContain("KQ_CHUNG");
    expect(html).toContain("Đạt yêu cầu");
    expect(html).toContain("1 bất thường");
    expect(html).toContain("[&amp;::-webkit-details-marker]:hidden");
    expect(html).toContain('name="groupConclusions[group-1]"');
  });
});
