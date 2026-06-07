import { readFile } from "node:fs/promises";

import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildCloudinaryDeliveryUrl,
  createCloudinaryUploadSignature,
  destroyCloudinaryImage,
  getCloudinaryUploadUrl,
} from "./cloudinary";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("Cloudinary sample image helpers", () => {
  test("marks the module as server-only", async () => {
    const source = await readFile(new URL("./cloudinary.ts", import.meta.url), {
      encoding: "utf8",
    });

    expect(source.startsWith('import "server-only";')).toBe(true);
  });

  test("signs upload parameters without exposing the API secret", () => {
    const result = createCloudinaryUploadSignature({
      apiKey: "api-key-1",
      apiSecret: "secret-1",
      cloudName: "lab-cloud",
      folder: "lab-management/org-1/sample-1",
      publicId: "lab-management/org-1/sample-1/evidence-1",
      timestamp: 1_720_000_000,
    });

    expect(result).toEqual({
      apiKey: "api-key-1",
      cloudName: "lab-cloud",
      folder: "lab-management/org-1/sample-1",
      publicId: "lab-management/org-1/sample-1/evidence-1",
      signature: "d968ecb85568f5060ac4577f77290e0c0c69acbf",
      timestamp: 1_720_000_000,
    });
    expect(JSON.stringify(result)).not.toContain("secret-1");
  });

  test("builds Cloudinary upload and delivery URLs", () => {
    expect(getCloudinaryUploadUrl("lab-cloud")).toBe(
      "https://api.cloudinary.com/v1_1/lab-cloud/image/upload"
    );
    expect(
      buildCloudinaryDeliveryUrl({
        cloudName: "lab-cloud",
        publicId: "lab-management/org-1/sample-1/evidence-1",
      })
    ).toBe(
      "https://res.cloudinary.com/lab-cloud/image/upload/c_limit,w_640,q_auto,f_auto/lab-management/org-1/sample-1/evidence-1"
    );
  });

  test("wraps Cloudinary destroy network failures with a domain error", async () => {
    process.env.CLOUDINARY_API_KEY = "api-key-1";
    process.env.CLOUDINARY_API_SECRET = "secret-1";
    process.env.CLOUDINARY_CLOUD_NAME = "lab-cloud";
    globalThis.fetch = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("DNS lookup failed"));

    await expect(destroyCloudinaryImage("public-id-1")).rejects.toThrow(
      "Không thể xóa ảnh trên Cloudinary."
    );
  });
});
