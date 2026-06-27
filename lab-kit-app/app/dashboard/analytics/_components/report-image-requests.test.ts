// @vitest-environment jsdom

import { describe, expect, test, vi } from "vitest";

import { uploadReportImageRequest } from "./report-image-requests";

function createReportFile() {
  return new File(["report"], "report.webp", { type: "image/webp" });
}

describe("uploadReportImageRequest", () => {
  test("rejects malformed successful signature responses", async () => {
    const fetcher = vi.fn(async (url: RequestInfo | URL) => {
      expect(url).toBe("/api/reports/images/signature");
      return Response.json({ apiKey: "api-key-1" });
    });

    await expect(
      uploadReportImageRequest(createReportFile(), fetcher)
    ).resolves.toEqual({
      state: {
        message: "Phản hồi upload ảnh báo cáo không hợp lệ.",
        status: "error",
      },
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
