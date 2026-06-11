import { describe, expect, test } from "vitest";

import {
  buildNormalizedResultsExportFile,
  type NormalizedResultsExportActor,
  type NormalizedResultsExportQuery,
} from "./results-normalized";
import { readWorksheetRows } from "./test-workbook";
import type {
  SampleGridPort,
  SampleGridRow,
} from "@/lib/sample-grid/operations";

const actor: NormalizedResultsExportActor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "editor",
};

const fields: NormalizedResultsExportQuery["fields"] = [
  "sampleCode",
  "customerName",
  "sampleType",
  "receivedAt",
  "status",
  "groupCode",
  "groupName",
  "metricCode",
  "metricName",
  "metricUnit",
  "value",
  "kqChung",
];

const baseQuery: NormalizedResultsExportQuery = {
  dataset: "results-normalized",
  fields,
  filters: { status: "received" },
  format: "csv",
  rowLimit: 100,
  search: "T6_00012",
  sort: { direction: "asc", key: "sampleCode" },
};

describe("normalized results export file builder", () => {
  test("flattens each sample group metric with stable Vietnamese headers", async () => {
    const calls: unknown[] = [];
    const file = await buildNormalizedResultsExportFile(
      baseQuery,
      actor,
      {
        async listSamples(input) {
          calls.push(input);
          return { rows: [createSampleRow()], totalCount: 1 };
        },
        async listSampleResultSummaries(input) {
          calls.push(input);
          return {
            "sample-1": {
              groups: [
                {
                  code: "PCR",
                  enteredMetrics: 1,
                  id: "group-1",
                  kqChung: "Dương tính",
                  metrics: [
                    {
                      code: "CT",
                      id: "metric-1",
                      name: "Chu kỳ ngưỡng",
                      unit: "Ct",
                      value: { status: "positive", ct: 31.2 },
                    },
                    {
                      code: "NOTE",
                      id: "metric-2",
                      name: "Ghi chú",
                      unit: null,
                      value: 'Có dấu phẩy, và "nháy"',
                    },
                  ],
                  name: "PCR",
                  totalMetrics: 2,
                },
              ],
            },
          };
        },
      },
      { generatedAt: new Date("2026-06-08T10:00:00.000Z") }
    );

    expect(calls).toEqual([
      {
        organizationId: "org-1",
        query: {
          filters: { status: "received" },
          limit: 100,
          offset: 0,
          page: 1,
          pageSize: 100,
          resultColumnKeys: [],
          search: "T6_00012",
          sort: { direction: "asc", key: "sampleCode" },
        },
      },
      { organizationId: "org-1", sampleIds: ["sample-1"] },
    ]);
    expect(file.contentType).toBe("text/csv; charset=utf-8");
    expect(file.filename).toBe("ket-qua-chuan-hoa-2026-06-08.csv");
    expect(file.body.toString("utf8")).toBe(
      [
        "Mã mẫu,Khách hàng,Loại mẫu,Ngày nhận,Trạng thái mẫu,Mã nhóm,Nhóm kết quả,Mã chỉ tiêu,Chỉ tiêu,Đơn vị,Giá trị,KQ_CHUNG",
        "T6_00012,Công ty A,Mẫu PCR,2026-06-08T08:00:00.000Z,Đã nhận,PCR,PCR,CT,Chu kỳ ngưỡng,Ct,Dương tính; Ct 31.2,Dương tính",
        'T6_00012,Công ty A,Mẫu PCR,2026-06-08T08:00:00.000Z,Đã nhận,PCR,PCR,NOTE,Ghi chú,,"Có dấu phẩy, và ""nháy""",Dương tính',
      ].join("\r\n")
    );
    expect(file.body.toString("utf8")).not.toContain('{"status"');
    expect(file.body.toString("utf8")).not.toContain("cloudinary");
    expect(file.body.toString("utf8")).not.toContain("audit");
  });

  test("preserves numeric zero and false values inside array results", async () => {
    const file = await buildNormalizedResultsExportFile(
      { ...baseQuery, fields: ["value"] },
      actor,
      createPort([createSampleRow()], [0, false, "", null])
    );

    expect(file.body.toString("utf8")).toBe(
      ["Giá trị", "0; false"].join("\r\n")
    );
  });

  test("uses fallback text for values that cannot be serialized", async () => {
    const circularValue: Record<string, unknown> = {};
    circularValue.self = circularValue;

    await expect(
      buildNormalizedResultsExportFile(
        { ...baseQuery, fields: ["value"] },
        actor,
        createPort([createSampleRow()], circularValue)
      )
    ).resolves.toMatchObject({
      body: Buffer.from(
        ["Giá trị", "[Giá trị không thể xuất]"].join("\r\n"),
        "utf8"
      ),
    });
    await expect(
      buildNormalizedResultsExportFile(
        { ...baseQuery, fields: ["value"] },
        actor,
        createPort([createSampleRow()], BigInt(12))
      )
    ).resolves.toMatchObject({
      body: Buffer.from(
        ["Giá trị", "[Giá trị không thể xuất]"].join("\r\n"),
        "utf8"
      ),
    });
  });

  test("preserves requested column order and builds readable XLSX", async () => {
    const file = await buildNormalizedResultsExportFile(
      {
        ...baseQuery,
        fields: ["metricName", "metricUnit", "value", "sampleCode"],
        format: "xlsx",
      },
      actor,
      createPort([createSampleRow()])
    );

    expect(file.contentType).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    await expect(
      readWorksheetRows(file.body, "Kết quả chuẩn hóa")
    ).resolves.toEqual([
      ["Chỉ tiêu", "Đơn vị", "Giá trị", "Mã mẫu"],
      ["pH", "", "7.8", "T6_00012"],
    ]);
  });
});

function createPort(
  rows: SampleGridRow[],
  value: unknown = 7.8
): SampleGridPort {
  return {
    async listSamples() {
      return { rows, totalCount: rows.length };
    },
    async listSampleResultSummaries() {
      return {
        "sample-1": {
          groups: [
            {
              code: "CHEM",
              enteredMetrics: 1,
              id: "group-1",
              kqChung: null,
              metrics: [
                {
                  code: "PH",
                  id: "metric-1",
                  name: "pH",
                  unit: null,
                  value,
                },
              ],
              name: "Hóa lý",
              totalMetrics: 1,
            },
          ],
        },
      };
    },
  };
}

function createSampleRow(
  overrides: Partial<SampleGridRow> = {}
): SampleGridRow {
  return {
    billingStatus: "unpaid",
    companyId: null,
    companyName: null,
    customerId: null,
    customerName: "Công ty A",
    id: "sample-1",
    kitBatchId: null,
    kitSummary: "Chưa gán KIT",
    receivedAt: "2026-06-08T08:00:00.000Z",
    resultSummary: null,
    sampleCode: "T6_00012",
    sampleTypeId: "sample-type-1",
    sampleTypeName: "Mẫu PCR",
    status: "received",
    updatedAt: "2026-06-08T09:00:00.000Z",
    ...overrides,
  };
}
