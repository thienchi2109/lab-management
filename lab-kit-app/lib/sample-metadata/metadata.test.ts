import { describe, expect, test } from "vitest";

import { mapSampleMetadataRows } from "./metadata";

const EMPTY_SAMPLE_COST_GROUPS = [
  { group: "cash", label: "Tiền mặt thu được", totalAmountVnd: 0 },
  { group: "bank_transfer", label: "Nhận chuyển khoản", totalAmountVnd: 0 },
  { group: "invoice", label: "Ghi hóa đơn", totalAmountVnd: 0 },
  { group: "other", label: "Khác", totalAmountVnd: 0 },
];

describe("sample metadata mapping", () => {
  test("maps tenant rows into summary, options, and table-ready samples", () => {
    const metadata = mapSampleMetadataRows({
      companies: [
        {
          id: "company-1",
          code: "MINH-PHU",
          name: "Công ty Minh Phú",
          is_active: true,
        },
      ],
      customers: [
        {
          id: "customer-1",
          company_id: "company-1",
          code: "MP-001",
          name: "Nguyễn Văn A",
          phone: "0900000000",
          email: null,
          is_active: true,
        },
      ],
      sampleTypes: [
        {
          id: "type-1",
          code: "PCR",
          name: "Mẫu PCR",
          is_active: true,
        },
      ],
      kitBatches: [
        {
          id: "batch-1",
          kit_type_name: "PCR Realtime",
          lot_number: "LOT-01",
        },
      ],
      resultGroups: [
        {
          id: "group-1",
          name: "Sinh học phân tử",
        },
        {
          id: "group-2",
          name: "Hóa lý",
        },
      ],
      samples: [
        {
          id: "sample-1",
          sample_type_id: "type-1",
          customer_id: "customer-1",
          company_id: "company-1",
          kit_batch_id: "batch-1",
          sample_code: "T6_00012",
          customer_name: "Nguyễn Văn A",
          collected_at: null,
          received_at: "2026-06-06T08:30:00.000Z",
          status: "received",
          billing_status: "unpaid",
          metadata: { note: "Ưu tiên" },
          sample_result_groups: [{ result_group_id: "group-2" }],
          updated_at: "2026-06-06T09:00:00.000Z",
        },
      ],
    });

    expect(metadata.summary).toEqual({
      totalSamples: 1,
      receivedSamples: 1,
      inProgressSamples: 0,
      unpaidSamples: 1,
      sampleCostGroups: EMPTY_SAMPLE_COST_GROUPS,
    });
    expect(metadata.samples[0]).toEqual(
      expect.objectContaining({
        sampleCode: "T6_00012",
        sampleTypeName: "Mẫu PCR",
        customerName: "Nguyễn Văn A",
        companyName: "Công ty Minh Phú",
        kitSummary: "PCR Realtime - LOT-01",
        note: "Ưu tiên",
        resultGroupIds: ["group-2"],
      })
    );
    expect(metadata.filterOptions.sampleTypes).toEqual([["type-1", "Mẫu PCR"]]);
    expect(metadata.resultGroupOptions).toEqual([
      { id: "group-1", label: "Sinh học phân tử" },
      { id: "group-2", label: "Hóa lý" },
    ]);
  });

  test("summarizes samples in one mapped metadata view", () => {
    const metadata = mapSampleMetadataRows({
      companies: [],
      customers: [],
      sampleTypes: [
        { id: "type-1", code: "PCR", name: "Mẫu PCR", is_active: true },
      ],
      kitBatches: [],
      samples: [
        {
          id: "sample-1",
          sample_type_id: "type-1",
          customer_id: null,
          company_id: null,
          kit_batch_id: null,
          sample_code: "T6_00012",
          customer_name: null,
          collected_at: null,
          received_at: "2026-06-06T08:30:00.000Z",
          status: "received",
          billing_status: "unpaid",
          metadata: {},
          updated_at: "2026-06-06T09:00:00.000Z",
        },
        {
          id: "sample-2",
          sample_type_id: "type-1",
          customer_id: null,
          company_id: null,
          kit_batch_id: null,
          sample_code: "T6_00013",
          customer_name: null,
          collected_at: null,
          received_at: "2026-06-06T08:45:00.000Z",
          status: "in_progress",
          billing_status: "paid",
          metadata: {},
          updated_at: "2026-06-06T09:05:00.000Z",
        },
      ],
    });

    expect(metadata.summary).toEqual({
      totalSamples: 2,
      receivedSamples: 1,
      inProgressSamples: 1,
      unpaidSamples: 1,
      sampleCostGroups: EMPTY_SAMPLE_COST_GROUPS,
    });
    expect(metadata.samples).toHaveLength(2);
  });

  test("summarizes sample costs into the contracted payment groups", () => {
    const metadata = mapSampleMetadataRows({
      companies: [],
      customers: [],
      sampleTypes: [
        { id: "type-1", code: "PCR", name: "Mẫu PCR", is_active: true },
      ],
      kitBatches: [],
      samples: [
        {
          id: "sample-cash",
          sample_type_id: "type-1",
          customer_id: null,
          company_id: null,
          kit_batch_id: null,
          sample_code: "T6_00014",
          customer_name: null,
          collected_at: null,
          received_at: "2026-06-06T09:30:00.000Z",
          status: "completed",
          billing_status: "paid",
          sample_cost_amount_vnd: 150000,
          sample_cost_payment_method: "cash",
          metadata: {},
          updated_at: "2026-06-06T10:00:00.000Z",
        },
        {
          id: "sample-transfer",
          sample_type_id: "type-1",
          customer_id: null,
          company_id: null,
          kit_batch_id: null,
          sample_code: "T6_00015",
          customer_name: null,
          collected_at: null,
          received_at: "2026-06-06T09:35:00.000Z",
          status: "completed",
          billing_status: "paid",
          sample_cost_amount_vnd: 250000,
          sample_cost_payment_method: "bank_transfer",
          metadata: {},
          updated_at: "2026-06-06T10:05:00.000Z",
        },
        {
          id: "sample-invoice",
          sample_type_id: "type-1",
          customer_id: null,
          company_id: null,
          kit_batch_id: null,
          sample_code: "T6_00016",
          customer_name: null,
          collected_at: null,
          received_at: "2026-06-06T09:40:00.000Z",
          status: "completed",
          billing_status: "invoiced",
          sample_cost_amount_vnd: 300000,
          sample_cost_payment_method: "cash",
          metadata: {},
          updated_at: "2026-06-06T10:10:00.000Z",
        },
        {
          id: "sample-other",
          sample_type_id: "type-1",
          customer_id: null,
          company_id: null,
          kit_batch_id: null,
          sample_code: "T6_00017",
          customer_name: null,
          collected_at: null,
          received_at: "2026-06-06T09:45:00.000Z",
          status: "received",
          billing_status: "eom_credit",
          sample_cost_amount_vnd: 120000,
          sample_cost_payment_method: "cash",
          metadata: {},
          updated_at: "2026-06-06T10:15:00.000Z",
        },
      ],
    });

    expect(metadata.summary).toHaveProperty("sampleCostGroups", [
      { group: "cash", label: "Tiền mặt thu được", totalAmountVnd: 150000 },
      {
        group: "bank_transfer",
        label: "Nhận chuyển khoản",
        totalAmountVnd: 250000,
      },
      { group: "invoice", label: "Ghi hóa đơn", totalAmountVnd: 300000 },
      { group: "other", label: "Khác", totalAmountVnd: 120000 },
    ]);
  });

  test("normalizes malformed metadata JSON without leaking unknown fields", () => {
    const metadata = mapSampleMetadataRows({
      companies: [],
      customers: [],
      sampleTypes: [
        {
          id: "type-1",
          code: "PCR",
          name: "Mẫu PCR",
          is_active: true,
        },
      ],
      kitBatches: [],
      samples: [
        {
          id: "sample-1",
          sample_type_id: "type-1",
          customer_id: null,
          company_id: null,
          kit_batch_id: null,
          sample_code: "T6_00012",
          customer_name: null,
          collected_at: null,
          received_at: "2026-06-06T08:30:00.000Z",
          status: "received",
          billing_status: "unpaid",
          metadata: {
            note: ["không hợp lệ"],
            ocrText: "không thuộc view model metadata mẫu",
          },
          updated_at: "2026-06-06T09:00:00.000Z",
        },
      ],
    });

    expect(metadata.samples[0]).toEqual(
      expect.objectContaining({
        note: null,
      })
    );
    expect(metadata.samples[0]).not.toHaveProperty("ocrText");
  });
});
