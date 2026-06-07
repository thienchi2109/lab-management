import { describe, expect, test } from "vitest";

import {
  buildCloudinaryDeliveryUrl,
  createCloudinaryUploadSignature,
  getCloudinaryUploadUrl,
} from "./cloudinary";

describe("Cloudinary sample image helpers", () => {
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
});
