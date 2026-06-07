import { describe, expect, test, vi } from "vitest";

import { saveSampleResultsRequest } from "./save-sample-results-request";

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
