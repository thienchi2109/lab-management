import { describe, expect, test, vi } from "vitest";

import {
  confirmSampleImageUpload,
  deleteSampleImage,
  prepareSampleImageUpload,
  type SampleImageActor,
  type SampleImagesPort,
} from "./operations";

const actor: SampleImageActor = {
  profileId: "actor-1",
  organizationId: "org-1",
  canWrite: true,
};

function createPort(
  overrides: Partial<SampleImagesPort> = {}
): SampleImagesPort {
  return {
    countImagesForSample: vi.fn().mockResolvedValue(0),
    deleteCloudinaryImage: vi.fn().mockResolvedValue(undefined),
    deleteSampleImageRecordWithAudit: vi.fn().mockResolvedValue(undefined),
    findSampleImageByPublicId: vi.fn().mockResolvedValue(null),
    findSampleImageForDelete: vi.fn().mockResolvedValue({
      publicId: "lab/org-1/sample-1/evidence-1",
    }),
    insertSampleImageWithAudit: vi
      .fn()
      .mockResolvedValue({ imageId: "image-1" }),
    listSampleImages: vi.fn().mockResolvedValue([]),
    sampleBelongsToOrganization: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe("prepareSampleImageUpload", () => {
  test("rejects viewers before issuing a Cloudinary signature", async () => {
    await expect(
      prepareSampleImageUpload(
        "sample-1",
        { ...actor, canWrite: false },
        { contentType: "image/png", sizeBytes: 1200 },
        createPort()
      )
    ).rejects.toThrow("Bạn không có quyền tải ảnh minh chứng.");
  });

  test("rejects unsupported image content types", async () => {
    await expect(
      prepareSampleImageUpload(
        "sample-1",
        actor,
        { contentType: "image/gif", sizeBytes: 1200 },
        createPort()
      )
    ).rejects.toThrow("Định dạng ảnh không được hỗ trợ.");
  });

  test("rejects samples that already have 10 images", async () => {
    const port = createPort({
      countImagesForSample: vi.fn().mockResolvedValue(10),
    });

    await expect(
      prepareSampleImageUpload(
        "sample-1",
        actor,
        { contentType: "image/webp", sizeBytes: 1200 },
        port
      )
    ).rejects.toThrow("Mỗi mẫu chỉ được tối đa 10 ảnh minh chứng.");
  });
});

describe("confirmSampleImageUpload", () => {
  test("stores Cloudinary public_id and writes field-name-only audit", async () => {
    const port = createPort();

    await expect(
      confirmSampleImageUpload(
        "sample-1",
        actor,
        {
          contentType: "image/jpeg",
          publicId: "lab/org-1/sample-1/evidence-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
          sizeBytes: 2048,
        },
        port
      )
    ).resolves.toEqual({ imageId: "image-1" });

    expect(port.insertSampleImageWithAudit).toHaveBeenCalledWith({
      auditEventPayload: {
        metadataPolicy: "field-names-only",
        sampleId: "sample-1",
        submittedFields: ["publicId", "contentType", "sizeBytes"],
      },
      contentType: "image/jpeg",
      createdBy: "actor-1",
      organizationId: "org-1",
      sampleId: "sample-1",
      sizeBytes: 2048,
      storageBucket: "cloudinary",
      storagePath: "lab/org-1/sample-1/evidence-1",
    });
  });

  test("rejects Cloudinary lookalike hosts", async () => {
    await expect(
      confirmSampleImageUpload(
        "sample-1",
        actor,
        {
          contentType: "image/jpeg",
          publicId: "lab/org-1/sample-1/evidence-1",
          secureUrl:
            "https://res.cloudinary.com.attacker.example/lab/image/upload/evidence-1",
          sizeBytes: 2048,
        },
        createPort()
      )
    ).rejects.toThrow("URL ảnh Cloudinary không hợp lệ.");
  });
});

describe("deleteSampleImage", () => {
  test("deletes the Cloudinary asset before deleting the tenant image record", async () => {
    const port = createPort();

    await deleteSampleImage("sample-1", "image-1", actor, port);

    expect(port.findSampleImageForDelete).toHaveBeenCalledWith({
      imageId: "image-1",
      organizationId: "org-1",
      sampleId: "sample-1",
    });
    expect(port.deleteCloudinaryImage).toHaveBeenCalledWith(
      "lab/org-1/sample-1/evidence-1"
    );
    expect(port.deleteSampleImageRecordWithAudit).toHaveBeenCalledWith({
      actorId: "actor-1",
      eventPayload: {
        metadataPolicy: "field-names-only",
        sampleId: "sample-1",
        submittedFields: ["publicId"],
      },
      imageId: "image-1",
      organizationId: "org-1",
      sampleId: "sample-1",
    });

    const cleanupOrder = vi.mocked(port.deleteCloudinaryImage).mock
      .invocationCallOrder[0];
    const deleteOrder = vi.mocked(port.deleteSampleImageRecordWithAudit).mock
      .invocationCallOrder[0];
    expect(cleanupOrder).toBeLessThan(deleteOrder);
  });

  test("keeps the database record when Cloudinary cleanup fails", async () => {
    const port = createPort({
      deleteCloudinaryImage: vi
        .fn()
        .mockRejectedValue(new Error("Cloudinary timeout")),
    });

    await expect(
      deleteSampleImage("sample-1", "image-1", actor, port)
    ).rejects.toThrow("Cloudinary timeout");

    expect(port.deleteSampleImageRecordWithAudit).not.toHaveBeenCalled();
  });

  test("rejects missing tenant image records before Cloudinary cleanup", async () => {
    const port = createPort({
      findSampleImageForDelete: vi.fn().mockResolvedValue(null),
    });

    await expect(
      deleteSampleImage("sample-1", "image-1", actor, port)
    ).rejects.toThrow("Ảnh minh chứng không tồn tại.");

    expect(port.deleteCloudinaryImage).not.toHaveBeenCalled();
    expect(port.deleteSampleImageRecordWithAudit).not.toHaveBeenCalled();
  });
});

describe("SampleImagesPort contract", () => {
  test("requires a delete lookup before mutating database records", () => {
    expect(createPort()).toHaveProperty("findSampleImageForDelete");
    expect(createPort()).toHaveProperty("insertSampleImageWithAudit");
    expect(createPort()).toHaveProperty("deleteSampleImageRecordWithAudit");
  });
});
