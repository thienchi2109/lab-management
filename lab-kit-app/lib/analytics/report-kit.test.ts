import { describe, expect, test, vi } from "vitest";

import type { AnalyticsActor } from "./operations";
import {
  buildReportKitAnalyticsContract,
  listReportKitAnalyticsContract,
  parseReportKitAnalyticsQuery,
  type ReportKitAnalyticsSourceRow,
} from "./report-kit";

const actor: AnalyticsActor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "viewer",
};

describe("report kit analytics contract", () => {
  test("parses chart ids and rejects unknown chart or filter fields", () => {
    expect(
      parseReportKitAnalyticsQuery({
        charts: ["kitQuantityBySampleType", "sampleCountByClassification"],
        filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
        pageSize: 50,
      }).charts
    ).toEqual(["kitQuantityBySampleType", "sampleCountByClassification"]);

    expect(() =>
      parseReportKitAnalyticsQuery({
        charts: ["rawSql"],
        filters: { rawSql: "select * from samples" },
      })
    ).toThrow("Truy vấn analytics không hợp lệ.");
  });

  test("builds the four report chart datasets from deterministic rows", () => {
    const contract = buildReportKitAnalyticsContract([
      createRow({
        customerName: "Công ty A",
        generalPcrConclusion: "Sạch",
        kitBatchId: "batch-1",
        kitTypeName: "KIT PCR A",
        sampleTypeName: "tôm PL",
      }),
      createRow({
        customerName: "",
        generalPcrConclusion: "NHIỄM",
        kitBatchId: "batch-2",
        kitTypeName: "KIT PCR B",
        sampleTypeName: "tôm PL",
      }),
      createRow({
        companyId: "company-1",
        generalPcrConclusion: "không xác định",
        kitBatchId: "batch-3",
        kitTypeName: "KIT PCR A",
        sampleTypeName: "Nước ao",
      }),
      createRow({
        customerName: null,
        generalPcrConclusion: null,
        kitBatchId: null,
        kitTypeName: null,
        sampleTypeName: null,
      }),
    ]);

    expect(contract.datasets.kitQuantityBySampleType.segments).toEqual([
      segment("tôm PL", { totalKitQuantity: 2 }),
      segment("Nước ao", { totalKitQuantity: 1 }),
      segment("Không rõ loại mẫu", { totalKitQuantity: 0 }),
    ]);
    expect(contract.datasets.kitQuantityByKitType.segments).toEqual([
      segment("KIT PCR A", { totalKitQuantity: 2 }),
      segment("KIT PCR B", { totalKitQuantity: 1 }),
    ]);
    expect(contract.datasets.sampleCountByClassification.segments).toEqual([
      segment("Mẫu khách hàng", { sampleCount: 2 }),
      segment("Mẫu nội bộ", { sampleCount: 2 }),
    ]);
    expect(
      contract.datasets.cleanShrimpPlByGeneralPcrConclusion.segments
    ).toEqual([
      segment("SẠCH", { cleanCount: 1 }),
      segment("NHIỄM", { cleanCount: 0 }),
    ]);
  });

  test("parses input and calls the read port with bounded organization scope", async () => {
    const listReportRows = vi.fn(async () => [
      createRow({
        customerName: "Công ty A",
        generalPcrConclusion: "SẠCH",
        kitBatchId: "batch-1",
        kitTypeName: "KIT PCR A",
        sampleTypeName: "tôm PL",
      }),
    ]);

    const contract = await listReportKitAnalyticsContract(
      {
        filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
        pageSize: 50,
      },
      actor,
      { listReportRows }
    );

    expect(listReportRows).toHaveBeenCalledWith({
      organizationId: "org-1",
      query: expect.objectContaining({
        filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
        limit: 50,
      }),
    });
    expect(contract.datasets.kitQuantityBySampleType.segments).toEqual([
      segment("tôm PL", { totalKitQuantity: 1 }),
    ]);
  });

  test("rejects unbounded reads before touching the report port", async () => {
    const listReportRows = vi.fn();

    await expect(
      listReportKitAnalyticsContract({}, actor, { listReportRows })
    ).rejects.toThrow("Truy vấn analytics cần ít nhất một bộ lọc.");
    expect(listReportRows).not.toHaveBeenCalled();
  });
});

function createRow(
  input: Partial<ReportKitAnalyticsSourceRow>
): ReportKitAnalyticsSourceRow {
  return {
    companyId: null,
    customerId: null,
    customerName: null,
    generalPcrConclusion: null,
    kitBatchId: null,
    kitTypeName: null,
    sampleId: crypto.randomUUID(),
    sampleTypeName: null,
    ...input,
  };
}

function segment(label: string, metrics: Record<string, number>) {
  return { key: label, label, metrics };
}
