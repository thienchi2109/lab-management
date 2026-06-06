import { describe, expect, test, vi } from "vitest";

import { mapSampleMetadataRows } from "./metadata";

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
          updated_at: "2026-06-06T09:00:00.000Z",
        },
      ],
    });

    expect(metadata.summary).toEqual({
      totalSamples: 1,
      receivedSamples: 1,
      inProgressSamples: 0,
      unpaidSamples: 1,
    });
    expect(metadata.samples[0]).toEqual(
      expect.objectContaining({
        sampleCode: "T6_00012",
        sampleTypeName: "Mẫu PCR",
        customerName: "Nguyễn Văn A",
        companyName: "Công ty Minh Phú",
        kitSummary: "PCR Realtime - LOT-01",
        note: "Ưu tiên",
      })
    );
    expect(metadata.filterOptions.sampleTypes).toEqual([["type-1", "Mẫu PCR"]]);
  });

  test("summarizes samples without repeated filter passes", () => {
    const filterSpy = vi.spyOn(Array.prototype, "filter");

    try {
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
      const filterCallsAfterMapping = filterSpy.mock.calls.length;

      expect(metadata.summary).toEqual({
        totalSamples: 2,
        receivedSamples: 1,
        inProgressSamples: 1,
        unpaidSamples: 1,
      });
      expect(filterCallsAfterMapping).toBe(0);
    } finally {
      filterSpy.mockRestore();
    }
  });
});
