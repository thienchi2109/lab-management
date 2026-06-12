import { describe, expect, test } from "vitest";

import { exportDownloadResponse } from "./route-helpers";

describe("exportDownloadResponse", () => {
  test("encodes content-disposition filenames with fallback and UTF-8 parameters", () => {
    const response = exportDownloadResponse({
      body: Buffer.from([1, 2, 3]),
      contentType: "text/csv; charset=utf-8",
      filename: 'báo-cáo "T6" \\ mẫu.csv',
    });

    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="bao-cao \\"T6\\" \\\\ mau.csv"; filename*=UTF-8\'\'b%C3%A1o-c%C3%A1o%20%22T6%22%20%5C%20m%E1%BA%ABu.csv'
    );
  });
});
