import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { mapSampleMetadataRows } from "@/lib/sample-metadata/metadata";

import { SampleMetadataPageContent } from "./sample-metadata-page-content";

vi.mock("../actions", () => ({
  createSampleMetadataAction: vi.fn(),
  updateSampleMetadataAction: vi.fn(),
}));

const metadata = mapSampleMetadataRows({
  companies: [
    { id: "company-1", code: "MP", name: "Công ty Minh Phú", is_active: true },
  ],
  customers: [
    {
      id: "customer-1",
      company_id: "company-1",
      code: "KH-001",
      name: "Nguyễn Văn A",
      phone: null,
      email: null,
      is_active: true,
    },
  ],
  sampleTypes: [
    { id: "type-1", code: "PCR", name: "Mẫu PCR", is_active: true },
  ],
  kitBatches: [
    { id: "batch-1", kit_type_name: "PCR Realtime", lot_number: "LOT-01" },
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

describe("SampleMetadataPageContent", () => {
  test("renders sample CRUD controls through shared dashboard primitives", () => {
    const html = renderToStaticMarkup(
      <SampleMetadataPageContent metadata={metadata} />
    );

    expect(html).toContain("Quản lý mẫu xét nghiệm");
    expect(html).toContain("Tạo mẫu");
    expect(html).toContain("T6_00012");
    expect(html).toContain("<table");
    expect(html).toContain("md:hidden");
    expect(html).toContain("Công ty Minh Phú");
  });

  test("reuses the sample date formatter across rendered rows", async () => {
    vi.resetModules();
    const originalFormatter = Intl.DateTimeFormat;
    let formatterConstructs = 0;

    vi.stubGlobal(
      "Intl",
      Object.create(Intl, {
        DateTimeFormat: {
          configurable: true,
          value: function DateTimeFormatSpy(
            ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
          ) {
            formatterConstructs += 1;
            return new originalFormatter(...args);
          },
        },
      })
    );

    try {
      const { SampleMetadataPageContent } =
        await import("./sample-metadata-page-content");
      const rowMetadata = {
        ...metadata,
        samples: [
          metadata.samples[0],
          { ...metadata.samples[0], id: "sample-2", sampleCode: "T6_00013" },
        ],
      };

      renderToStaticMarkup(
        <SampleMetadataPageContent metadata={rowMetadata} />
      );

      expect(formatterConstructs).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
