import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import type { SampleResultEntry } from "@/lib/sample-results/operations";

import { saveSampleResultsRequest } from "./save-sample-results-request";
import { SampleResultsClient } from "./sample-results-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("saveSampleResultsRequest", () => {
  test("returns a connection error state when the save request fails before a response", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      saveSampleResultsRequest(
        "sample-1",
        { results: [], groupConclusions: [] },
        fetcher
      )
    ).resolves.toEqual({
      refresh: false,
      state: {
        status: "error",
        message: "Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.",
      },
    });
  });

  test("falls back when the API error message is not a string", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 123 }),
    });

    await expect(
      saveSampleResultsRequest(
        "sample-1",
        { results: [], groupConclusions: [] },
        fetcher
      )
    ).resolves.toEqual({
      refresh: false,
      state: {
        status: "error",
        message: "Không thể lưu kết quả xét nghiệm.",
      },
    });
  });
});

describe("SampleResultsClient", () => {
  test("renders the sample image panel on the result entry surface", () => {
    const html = renderToStaticMarkup(
      <SampleResultsClient
        canWrite={true}
        entry={entry}
        initialImages={[
          {
            id: "image-1",
            contentType: "image/png",
            createdAt: "2026-06-07T00:00:00.000Z",
            publicId: "lab/org-1/sample-1/evidence-1",
            secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
            sizeBytes: 2048,
          },
        ]}
      />
    );

    expect(html).toContain("Kết quả mẫu T6_00012");
    expect(html).toContain("Ảnh minh chứng");
    expect(html).toContain("image/png");
  });

  test("renders sample summary before result details and images", () => {
    const html = renderToStaticMarkup(
      <SampleResultsClient
        canWrite={true}
        entry={detailEntry}
        initialImages={[
          {
            id: "image-1",
            contentType: "image/png",
            createdAt: "2026-06-07T00:00:00.000Z",
            publicId: "lab/org-1/sample-1/evidence-1",
            secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
            sizeBytes: 2048,
          },
        ]}
      />
    );

    expect(html).toContain("Thông tin mẫu");
    expect(html).toContain("Mã mẫu");
    expect(html).toContain("T6_00012");
    expect(html).toContain("Ngày nhận");
    expect(html).toContain("18/06/2026");
    expect(html).toContain("Loại mẫu");
    expect(html).toContain("PCR nước thải");
    expect(html).toContain("Khách hàng");
    expect(html).toContain("Khách hàng A");
    expect(html).toContain("Công ty");
    expect(html).toContain("Công ty nội bộ");
    expect(html).toContain("Trạng thái");
    expect(html).toContain("Đã nhận");
    expect(html).toContain("Nhóm chỉ tiêu");
    expect(html).toContain("Vi sinh");
    expect(html).toContain("Hóa lý");
    expect(html).toContain("Kết quả chi tiết");

    const summaryIndex = html.indexOf("Thông tin mẫu");
    const resultIndex = html.indexOf("Kết quả chi tiết");
    const imageIndex = html.indexOf("Ảnh minh chứng");

    expect(summaryIndex).toBeGreaterThanOrEqual(0);
    expect(resultIndex).toBeGreaterThan(summaryIndex);
    expect(imageIndex).toBeGreaterThan(resultIndex);
  });
});

const entry: SampleResultEntry = {
  sample: {
    id: "sample-1",
    organizationId: "org-1",
    sampleCode: "T6_00012",
    sampleTypeId: "type-1",
    sampleTypeName: "PCR cơ bản",
    receivedAt: "2026-06-07T00:00:00.000Z",
    customerName: "Khách hàng A",
    companyName: "Công ty nội bộ",
    status: "received",
  },
  template: { id: "template-1", name: "PCR cơ bản" },
  groups: [],
  results: [],
  conclusions: [],
};

const detailEntry: SampleResultEntry = {
  ...entry,
  sample: {
    ...entry.sample,
    receivedAt: "2026-06-18T08:00:00.000Z",
    sampleTypeName: "PCR nước thải",
    customerName: "Khách hàng A",
    companyName: "Công ty nội bộ",
    status: "received",
  } as SampleResultEntry["sample"],
  groups: [
    {
      id: "group-1",
      code: "VS",
      name: "Vi sinh",
      sortOrder: 1,
      enteredMetrics: 0,
      totalMetrics: 0,
      kqChung: null,
      abnormalMetrics: 0,
      metrics: [],
    },
    {
      id: "group-2",
      code: "HL",
      name: "Hóa lý",
      sortOrder: 2,
      enteredMetrics: 0,
      totalMetrics: 0,
      kqChung: null,
      abnormalMetrics: 0,
      metrics: [],
    },
  ],
};
