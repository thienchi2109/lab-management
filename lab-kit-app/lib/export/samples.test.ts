import { describe, expect, test } from "vitest";

import { buildSampleExportFile, type SampleExportActor } from "./samples";
import type { ExportQuery } from "./query";
import type {
  SampleGridPort,
  SampleGridRow,
} from "@/lib/sample-grid/operations";

const actor: SampleExportActor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "editor",
};

const baseQuery: ExportQuery = {
  dataset: "samples",
  fields: ["sampleCode", "customerName", "sampleType", "status", "updatedAt"],
  filters: { status: "received" },
  format: "csv",
  rowLimit: 100,
  search: "T6_00012",
  sort: { direction: "asc", key: "sampleCode" },
};

describe("sample export file builder", () => {
  test("builds stable Vietnamese headers and strips internal fields", async () => {
    const calls: unknown[] = [];
    const file = await buildSampleExportFile(
      baseQuery,
      actor,
      {
        async listSamples(input) {
          calls.push(input);
          return {
            rows: [
              createSampleRow({
                customerName: "Công ty A",
                sampleCode: "T6_00012",
                status: "received",
              }),
            ],
            totalCount: 1,
          };
        },
      },
      {
        generatedAt: new Date("2026-06-08T10:00:00.000Z"),
      }
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
    ]);
    expect(file.contentType).toBe("text/csv; charset=utf-8");
    expect(file.filename).toBe("mau-xet-nghiem-2026-06-08.csv");
    expect(file.body.toString("utf8")).toBe(
      [
        "Mã mẫu,Khách hàng,Loại mẫu,Trạng thái,Cập nhật lúc",
        "T6_00012,Công ty A,Mẫu PCR,Đã nhận,2026-06-08T09:00:00.000Z",
      ].join("\r\n")
    );
  });

  test("escapes CSV values and preserves requested column order", async () => {
    const file = await buildSampleExportFile(
      {
        ...baseQuery,
        fields: ["customerName", "sampleCode", "kitBatch", "billingStatus"],
      },
      actor,
      createPort([
        createSampleRow({
          billingStatus: "paid",
          customerName: 'Khách "A", miền Bắc',
          kitSummary: "KIT A\nLô 01",
          sampleCode: "T6_00013",
        }),
      ])
    );

    expect(file.body.toString("utf8")).toBe(
      [
        "Khách hàng,Mã mẫu,KIT,Thanh toán",
        '"Khách ""A"", miền Bắc",T6_00013,"KIT A\nLô 01",Đã thanh toán',
      ].join("\r\n")
    );
  });

  test("builds an XLSX workbook with stable headers and requested columns", async () => {
    const { read, utils } = await import("xlsx");
    const file = await buildSampleExportFile(
      {
        ...baseQuery,
        fields: ["sampleCode", "customerName", "status"],
        format: "xlsx",
      },
      actor,
      createPort([
        createSampleRow({
          customerName: "Công ty A",
          sampleCode: "T6_00014",
          status: "completed",
        }),
      ]),
      {
        generatedAt: new Date("2026-06-08T10:00:00.000Z"),
      }
    );

    const workbook = read(file.body, { type: "buffer" });
    const sheet = workbook.Sheets["Mẫu xét nghiệm"];

    expect(file.contentType).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(file.filename).toBe("mau-xet-nghiem-2026-06-08.xlsx");
    expect(utils.sheet_to_json(sheet, { header: 1 })).toEqual([
      ["Mã mẫu", "Khách hàng", "Trạng thái"],
      ["T6_00014", "Công ty A", "Hoàn tất"],
    ]);
  });
});

function createPort(rows: SampleGridRow[]): SampleGridPort {
  return {
    async listSamples() {
      return { rows, totalCount: rows.length };
    },
  };
}

function createSampleRow(
  overrides: Partial<SampleGridRow> = {}
): SampleGridRow {
  return {
    billingStatus: "unpaid",
    companyId: "company-1",
    companyName: "Công ty nội bộ",
    customerId: "customer-1",
    customerName: "Khách hàng A",
    id: "sample-1",
    kitBatchId: "kit-batch-1",
    kitSummary: "KIT PCR - Lô 01",
    receivedAt: "2026-06-08T08:00:00.000Z",
    resultSummary: {
      groups: [
        {
          code: "PCR",
          enteredMetrics: 1,
          id: "group-1",
          kqChung: "SẠCH",
          metrics: [
            {
              code: "WSSV",
              id: "metric-1",
              name: "WSSV",
              value: "secret raw payload",
            },
          ],
          name: "PCR",
          totalMetrics: 1,
        },
      ],
    },
    sampleCode: "T6_00012",
    sampleTypeId: "sample-type-1",
    sampleTypeName: "Mẫu PCR",
    status: "received",
    updatedAt: "2026-06-08T09:00:00.000Z",
    ...overrides,
  };
}
