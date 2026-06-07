import { describe, expect, test } from "vitest";

import {
  getSampleResultEntry,
  saveSampleResults,
  type SampleResultActor,
  type SampleResultsPort,
  type SampleResultTemplate,
  type SaveSampleResultsInput,
} from "./operations";

const actor: SampleResultActor = {
  profileId: "profile-1",
  organizationId: "org-1",
  canWrite: true,
};

const pcrTemplate: SampleResultTemplate = {
  sample: {
    id: "sample-1",
    sampleCode: "T6_00012",
    sampleTypeId: "type-1",
    organizationId: "org-1",
  },
  template: {
    id: "template-1",
    name: "PCR cơ bản",
  },
  groups: [
    {
      id: "group-pcr",
      code: "PCR",
      name: "PCR",
      sortOrder: 10,
      metrics: [
        {
          id: "metric-pcr-a",
          code: "WSSV",
          name: "WSSV",
          inputType: "pcr_realtime",
          unit: "Ct",
          options: [],
          metricSettings: { min: 0, max: 45 },
          sortOrder: 10,
          isRequired: true,
        },
        {
          id: "metric-pcr-b",
          code: "EHP",
          name: "EHP",
          inputType: "pcr_realtime",
          unit: "Ct",
          options: [],
          metricSettings: { min: 0, max: 45 },
          sortOrder: 20,
          isRequired: true,
        },
      ],
    },
  ],
  results: [],
  conclusions: [],
};

function createPort(
  template: SampleResultTemplate | null = pcrTemplate
): SampleResultsPort & {
  transactions: unknown[];
} {
  const transactions: unknown[] = [];

  return {
    transactions,
    async getTemplateForSample() {
      return template;
    },
    async saveResultsTransaction(input) {
      transactions.push(input);
    },
  };
}

describe("getSampleResultEntry", () => {
  test("returns group progress from template metrics and existing results", async () => {
    const port = createPort({
      ...pcrTemplate,
      results: [
        {
          metricId: "metric-pcr-a",
          value: { status: "negative", ct: null },
        },
      ],
      conclusions: [
        {
          groupId: "group-pcr",
          kqChung: "SẠCH",
        },
      ],
    });

    const entry = await getSampleResultEntry("sample-1", actor, port);

    expect(entry.groups[0]).toMatchObject({
      id: "group-pcr",
      enteredMetrics: 1,
      totalMetrics: 2,
      kqChung: "SẠCH",
      abnormalMetrics: 0,
    });
  });

  test("rejects samples outside the actor organization", async () => {
    const port = createPort(null);

    await expect(getSampleResultEntry("sample-1", actor, port)).rejects.toThrow(
      "Mẫu xét nghiệm không tồn tại hoặc không thuộc tổ chức hiện tại."
    );
  });
});

describe("saveSampleResults", () => {
  test("computes PCR conclusion as SẠCH when every PCR metric is negative", async () => {
    const port = createPort();

    await saveSampleResults(
      "sample-1",
      {
        results: [
          {
            metricId: "metric-pcr-a",
            value: { status: "negative", ct: null },
          },
          {
            metricId: "metric-pcr-b",
            value: { status: "negative", ct: 39.2 },
          },
        ],
        groupConclusions: [],
      },
      actor,
      port
    );

    expect(port.transactions[0]).toMatchObject({
      sampleId: "sample-1",
      organizationId: "org-1",
      actorId: "profile-1",
      conclusions: [
        {
          groupId: "group-pcr",
          kqChung: "SẠCH",
          calculatedFrom: {
            rule: "pcr-status",
            positiveMetricIds: [],
          },
        },
      ],
    });
  });

  test("computes PCR conclusion as NHIỄM when any PCR metric is positive", async () => {
    const port = createPort();

    await saveSampleResults(
      "sample-1",
      {
        results: [
          {
            metricId: "metric-pcr-a",
            value: { status: "negative", ct: null },
          },
          {
            metricId: "metric-pcr-b",
            value: { status: "positive", ct: 28.4 },
          },
        ],
        groupConclusions: [],
      },
      actor,
      port
    );

    expect(port.transactions[0]).toMatchObject({
      conclusions: [
        {
          groupId: "group-pcr",
          kqChung: "NHIỄM",
          calculatedFrom: {
            rule: "pcr-status",
            positiveMetricIds: ["metric-pcr-b"],
          },
        },
      ],
    });
  });

  test("stores free-text conclusions for non-PCR groups", async () => {
    const port = createPort({
      ...pcrTemplate,
      groups: [
        {
          id: "group-water",
          code: "WATER",
          name: "Chất lượng nước",
          sortOrder: 10,
          metrics: [
            {
              id: "metric-ph",
              code: "PH",
              name: "pH",
              inputType: "number",
              unit: null,
              options: [],
              metricSettings: { min: 0, max: 14 },
              sortOrder: 10,
              isRequired: true,
            },
          ],
        },
      ],
    });

    await saveSampleResults(
      "sample-1",
      {
        results: [{ metricId: "metric-ph", value: 7.8 }],
        groupConclusions: [
          { groupId: "group-water", conclusionText: "Nước đạt yêu cầu" },
        ],
      },
      actor,
      port
    );

    expect(port.transactions[0]).toMatchObject({
      conclusions: [
        {
          groupId: "group-water",
          kqChung: "Nước đạt yêu cầu",
          calculatedFrom: { rule: "manual-text" },
        },
      ],
    });
  });

  test("ignores empty free-text conclusions from untrusted payloads", async () => {
    const port = createPort({
      ...pcrTemplate,
      groups: [
        {
          id: "group-water",
          code: "WATER",
          name: "Chất lượng nước",
          sortOrder: 10,
          metrics: [
            {
              id: "metric-ph",
              code: "PH",
              name: "pH",
              inputType: "number",
              unit: null,
              options: [],
              metricSettings: { min: 0, max: 14 },
              sortOrder: 10,
              isRequired: true,
            },
          ],
        },
      ],
    });

    await saveSampleResults(
      "sample-1",
      {
        results: [{ metricId: "metric-ph", value: 7.8 }],
        groupConclusions: [
          {
            groupId: "group-water",
            conclusionText:
              null as unknown as SaveSampleResultsInput["groupConclusions"][number]["conclusionText"],
          },
        ],
      },
      actor,
      port
    );

    expect(port.transactions[0]).toMatchObject({
      conclusions: [],
    });
  });

  test("rejects metrics that are not assigned to the sample template", async () => {
    const port = createPort();

    await expect(
      saveSampleResults(
        "sample-1",
        {
          results: [
            {
              metricId: "metric-outside-template",
              value: { status: "negative", ct: null },
            },
          ],
          groupConclusions: [],
        },
        actor,
        port
      )
    ).rejects.toThrow("Chỉ tiêu không thuộc template hợp lệ của mẫu.");
    expect(port.transactions).toEqual([]);
  });

  test("rejects viewer writes before touching storage", async () => {
    const port = createPort();

    await expect(
      saveSampleResults(
        "sample-1",
        { results: [], groupConclusions: [] },
        { ...actor, canWrite: false },
        port
      )
    ).rejects.toThrow("Bạn không có quyền ghi kết quả xét nghiệm.");
    expect(port.transactions).toEqual([]);
  });
});
