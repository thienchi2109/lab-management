import { describe, expect, test } from "vitest";

import type { SampleResultEntry } from "@/lib/sample-results/operations";

import { createSavePayloadFromForm } from "./form-payload";

const entry = {
  groups: [
    {
      id: "group-1",
      code: "PCR",
      name: "PCR",
      sortOrder: 10,
      enteredMetrics: 0,
      totalMetrics: 3,
      kqChung: null,
      abnormalMetrics: 0,
      metrics: [
        {
          id: "metric-number",
          code: "PH",
          name: "pH",
          inputType: "number",
          unit: null,
          options: [],
          metricSettings: {},
          sortOrder: 10,
          isRequired: true,
        },
        {
          id: "metric-bool",
          code: "VISIBLE",
          name: "Quan sát",
          inputType: "boolean",
          unit: null,
          options: [],
          metricSettings: {},
          sortOrder: 20,
          isRequired: false,
        },
        {
          id: "metric-pcr",
          code: "WSSV",
          name: "WSSV",
          inputType: "pcr_realtime",
          unit: "Ct",
          options: [],
          metricSettings: {},
          sortOrder: 30,
          isRequired: true,
        },
      ],
    },
    {
      id: "group-2",
      code: "OBS",
      name: "Quan sát",
      sortOrder: 20,
      enteredMetrics: 0,
      totalMetrics: 1,
      kqChung: null,
      abnormalMetrics: 0,
      metrics: [
        {
          id: "metric-note",
          code: "NOTE",
          name: "Ghi chú",
          inputType: "text",
          unit: null,
          options: [],
          metricSettings: {},
          sortOrder: 5,
          isRequired: false,
        },
        {
          id: "metric-multi",
          code: "TAGS",
          name: "Dấu hiệu",
          inputType: "multi_select",
          unit: null,
          options: ["Đục", "Mùi lạ"],
          metricSettings: {},
          sortOrder: 10,
          isRequired: false,
        },
        {
          id: "metric-select",
          code: "LEVEL",
          name: "Mức độ",
          inputType: "select",
          unit: null,
          options: ["Thấp", "Cao"],
          metricSettings: {},
          sortOrder: 20,
          isRequired: false,
        },
      ],
    },
  ],
} as SampleResultEntry;

describe("createSavePayloadFromForm", () => {
  test("maps dynamic form fields into the sample results PUT payload", () => {
    const formData = new FormData();
    formData.set("results[metric-number]", "7.8");
    formData.append("results[metric-bool]", "false");
    formData.append("results[metric-bool]", "true");
    formData.set("results[metric-pcr][status]", "negative");
    formData.set("results[metric-pcr][ct]", "");
    formData.set("results[metric-note]", "Có mùi lạ");
    formData.append("results[metric-multi]", "Đục");
    formData.append("results[metric-multi]", "Mùi lạ");
    formData.set("results[metric-select]", "Cao");
    formData.set("groupConclusions[group-2]", "Cần theo dõi");

    expect(createSavePayloadFromForm(entry, formData)).toEqual({
      results: [
        { metricId: "metric-number", value: 7.8 },
        { metricId: "metric-bool", value: true },
        { metricId: "metric-pcr", value: { status: "negative", ct: null } },
        { metricId: "metric-note", value: "Có mùi lạ" },
        { metricId: "metric-multi", value: ["Đục", "Mùi lạ"] },
        { metricId: "metric-select", value: "Cao" },
      ],
      groupConclusions: [
        { groupId: "group-2", conclusionText: "Cần theo dõi" },
      ],
    });
  });

  test("omits PCR results when the status control is missing or invalid", () => {
    const missingStatus = new FormData();
    missingStatus.set("results[metric-number]", "7.8");
    missingStatus.set("results[metric-pcr][ct]", "31.2");

    expect(createSavePayloadFromForm(entry, missingStatus).results).toEqual([
      { metricId: "metric-number", value: 7.8 },
      { metricId: "metric-bool", value: false },
      { metricId: "metric-multi", value: [] },
    ]);

    const invalidStatus = new FormData();
    invalidStatus.set("results[metric-pcr][status]", "unknown");
    invalidStatus.set("results[metric-pcr][ct]", "31.2");

    expect(createSavePayloadFromForm(entry, invalidStatus).results).toEqual([
      { metricId: "metric-bool", value: false },
      { metricId: "metric-multi", value: [] },
    ]);
  });

  test("keeps blank text values so existing text results can be cleared", () => {
    const formData = new FormData();
    formData.set("results[metric-note]", "   ");
    formData.set("results[metric-select]", "");

    expect(createSavePayloadFromForm(entry, formData).results).toEqual([
      { metricId: "metric-bool", value: false },
      { metricId: "metric-note", value: "" },
      { metricId: "metric-multi", value: [] },
    ]);
  });
});
