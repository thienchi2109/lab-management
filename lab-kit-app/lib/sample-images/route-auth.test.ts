import { describe, expect, test } from "vitest";

import { jsonError, ResponseError } from "./route-auth";

describe("jsonError", () => {
  test("keeps explicit response errors", async () => {
    const response = jsonError(
      new ResponseError(403, "Bạn không có quyền tải ảnh minh chứng."),
      "Không thể xử lý ảnh minh chứng."
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "Bạn không có quyền tải ảnh minh chứng.",
      status: "error",
    });
  });

  test("does not expose internal error details for server errors", async () => {
    const response = jsonError(
      new Error("database password leaked in stack"),
      "Không thể xử lý ảnh minh chứng."
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Không thể xử lý ảnh minh chứng.",
      status: "error",
    });
  });
});
