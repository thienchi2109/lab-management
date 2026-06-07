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
});

const entry: SampleResultEntry = {
  sample: {
    id: "sample-1",
    organizationId: "org-1",
    sampleCode: "T6_00012",
    sampleTypeId: "type-1",
  },
  template: { id: "template-1", name: "PCR cơ bản" },
  groups: [],
  results: [],
  conclusions: [],
};
