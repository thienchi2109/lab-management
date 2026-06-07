import { describe, expect, test, vi } from "vitest";

import {
  deleteSampleImageRequest,
  uploadSampleImageRequest,
} from "./sample-image-requests";

describe("uploadSampleImageRequest", () => {
  test("requests a signature, uploads to Cloudinary, and confirms metadata", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          apiKey: "api-key-1",
          folder: "lab-management/org-1/sample-1",
          publicId: "lab-management/org-1/sample-1/evidence-1",
          signature: "signature-1",
          timestamp: 1_720_000_000,
          uploadUrl: "https://api.cloudinary.com/v1_1/lab/image/upload",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          bytes: 2048,
          public_id: "lab-management/org-1/sample-1/evidence-1",
          secure_url: "https://res.cloudinary.com/lab/image/upload/evidence-1",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ imageId: "image-1" }),
      });
    const file = new File(["image"], "evidence.png", { type: "image/png" });

    const result = await uploadSampleImageRequest("sample-1", file, fetcher);

    expect(result).toEqual({
      refresh: true,
      state: {
        status: "success",
        message: "Đã tải ảnh minh chứng.",
      },
    });
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "/api/uploads/cloudinary/signature",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "https://api.cloudinary.com/v1_1/lab/image/upload",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      "/api/samples/sample-1/images",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("rejects unsupported files before any network request", async () => {
    const fetcher = vi.fn();
    const file = new File(["gif"], "evidence.gif", { type: "image/gif" });

    await expect(
      uploadSampleImageRequest("sample-1", file, fetcher)
    ).resolves.toEqual({
      refresh: false,
      state: {
        status: "error",
        message: "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WEBP.",
      },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("deleteSampleImageRequest", () => {
  test("returns refresh state after a successful delete", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: "success" }),
    });

    await expect(
      deleteSampleImageRequest("sample-1", "image-1", fetcher)
    ).resolves.toEqual({
      refresh: true,
      state: {
        status: "success",
        message: "Đã xóa ảnh minh chứng.",
      },
    });
    expect(fetcher).toHaveBeenCalledWith(
      "/api/samples/sample-1/images/image-1",
      { method: "DELETE" }
    );
  });
});
