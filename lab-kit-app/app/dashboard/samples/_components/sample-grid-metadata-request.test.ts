import { describe, expect, test } from "vitest";

import type { SampleGridRow } from "@/lib/sample-grid/operations";

import { toMetadataRequestSample } from "./sample-grid-metadata-request";

describe("toMetadataRequestSample", () => {
  test("preserves result group ids from the grid row summary", () => {
    const sample = createSampleGridRow();

    expect(toMetadataRequestSample(sample).resultGroupIds).toEqual([
      "group-1",
      "group-2",
    ]);
  });
});

function createSampleGridRow(): SampleGridRow {
  return {
    billingStatus: "unpaid",
    companyId: null,
    companyName: null,
    customerId: null,
    customerName: "Nguyễn Văn A",
    id: "sample-1",
    kitBatchId: null,
    kitSummary: "Chưa gán KIT",
    receivedAt: "2026-06-16",
    resultSummary: {
      groups: [
        {
          id: "group-1",
          code: "PCR",
          name: "Sinh học phân tử",
          kqChung: null,
          enteredMetrics: 0,
          totalMetrics: 2,
          metrics: [],
        },
        {
          id: "group-2",
          code: "CHEM",
          name: "Hóa lý",
          kqChung: null,
          enteredMetrics: 0,
          totalMetrics: 1,
          metrics: [],
        },
      ],
    },
    sampleCode: "HP-260616-ABCDEF1",
    sampleTypeId: "type-1",
    sampleTypeName: "Mẫu PCR",
    status: "received",
    updatedAt: "2026-06-16T01:00:00.000Z",
  };
}
