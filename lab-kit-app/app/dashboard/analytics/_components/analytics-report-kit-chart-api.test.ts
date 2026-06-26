import { afterEach, describe, expect, test, vi } from "vitest";

import { saveReportKitFilterPreset } from "./analytics-report-kit-chart-api";

describe("report kit chart API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("uses a save-specific fallback when preset save fails without a message", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json({ status: "error" }, { status: 500 }))
    );

    await expect(saveReportKitFilterPreset({ charts: {} })).rejects.toThrow(
      "Không thể lưu preset bộ lọc báo cáo."
    );
  });
});
