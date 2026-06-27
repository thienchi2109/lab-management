import { describe, expect, test, vi } from "vitest";

import {
  confirmReportImageUpload,
  deleteReportImage,
  prepareReportImageUpload,
  type ReportImageActor,
  type ReportImagesPort,
} from "./operations";

vi.mock("server-only", () => ({}));

const adminActor: ReportImageActor = {
  canManage: true,
  organizationId: "org-1",
  profileId: "admin-1",
};

const viewerActor: ReportImageActor = {
  ...adminActor,
  canManage: false,
  profileId: "viewer-1",
};

function createPort(
  overrides: Partial<ReportImagesPort> = {}
): ReportImagesPort {
  return {
    countReportImages: vi.fn().mockResolvedValue(0),
    deleteCloudinaryImage: vi.fn().mockResolvedValue(undefined),
    deleteReportImageRecordWithAudit: vi.fn().mockResolvedValue(undefined),
    findReportImageByPublicId: vi.fn().mockResolvedValue(null),
    findReportImageForDelete: vi.fn().mockResolvedValue({
      publicId: "lab/org-1/reports/report-1",
    }),
    insertReportImageWithAudit: vi
      .fn()
      .mockResolvedValue({ imageId: "report-image-1" }),
    listReportImages: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("prepareReportImageUpload", () => {
  test("rejects viewers before issuing a report image signature", async () => {
    await expect(
      prepareReportImageUpload(
        viewerActor,
        {
          contentType: "image/png",
          sizeBytes: 2048,
        },
        createPort()
      )
    ).rejects.toThrow("Bạn không có quyền tải ảnh báo cáo.");
  });

  test("enforces max 20 report images per organization", async () => {
    await expect(
      prepareReportImageUpload(
        adminActor,
        { contentType: "image/webp", sizeBytes: 2048 },
        createPort({ countReportImages: vi.fn().mockResolvedValue(20) })
      )
    ).rejects.toThrow(
      "Gallery đang có đủ 20 ảnh. Hãy xóa bớt ảnh trước khi tải thêm."
    );
  });

  test("rejects unsupported report image content types", async () => {
    await expect(
      prepareReportImageUpload(
        adminActor,
        { contentType: "image/gif", sizeBytes: 2048 },
        createPort()
      )
    ).rejects.toThrow("Định dạng ảnh không được hỗ trợ.");
  });

  test("rejects report images larger than 5 MB", async () => {
    await expect(
      prepareReportImageUpload(
        adminActor,
        { contentType: "image/png", sizeBytes: 5 * 1024 * 1024 + 1 },
        createPort()
      )
    ).rejects.toThrow("Ảnh báo cáo không được vượt quá 5 MB.");
  });
});

describe("confirmReportImageUpload", () => {
  test("stores report image metadata without sample id and writes audit", async () => {
    const port = createPort();

    await expect(
      confirmReportImageUpload(
        adminActor,
        {
          contentType: "image/jpeg",
          publicId: "lab-management/org-1/reports/report-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
          sizeBytes: 4096,
        },
        port
      )
    ).resolves.toEqual({ imageId: "report-image-1" });

    expect(port.insertReportImageWithAudit).toHaveBeenCalledWith({
      auditEventPayload: {
        metadataPolicy: "field-names-only",
        submittedFields: ["publicId", "contentType", "sizeBytes"],
      },
      contentType: "image/jpeg",
      createdBy: "admin-1",
      organizationId: "org-1",
      sizeBytes: 4096,
      storageBucket: "cloudinary",
      storagePath: "lab-management/org-1/reports/report-1",
    });
  });

  test("rejects Cloudinary public IDs outside the actor organization folder", async () => {
    await expect(
      confirmReportImageUpload(
        adminActor,
        {
          contentType: "image/png",
          publicId: "lab-management/org-2/reports/report-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
          sizeBytes: 2048,
        },
        createPort()
      )
    ).rejects.toMatchObject({
      message: "Mã ảnh Cloudinary không thuộc tổ chức hiện tại.",
      status: 400,
    });
  });

  test("cleans up a validated Cloudinary asset when metadata insert fails", async () => {
    const port = createPort({
      insertReportImageWithAudit: vi
        .fn()
        .mockRejectedValue(new Error("insert failed")),
    });

    await expect(
      confirmReportImageUpload(
        adminActor,
        {
          contentType: "image/png",
          publicId: "lab-management/org-1/reports/report-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
          sizeBytes: 2048,
        },
        port
      )
    ).rejects.toThrow("insert failed");

    expect(port.deleteCloudinaryImage).toHaveBeenCalledWith(
      "lab-management/org-1/reports/report-1"
    );
  });

  test("logs Cloudinary cleanup failures while preserving the insert error", async () => {
    const insertError = new Error("insert failed");
    const cleanupError = new Error("cleanup failed");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const port = createPort({
      deleteCloudinaryImage: vi.fn().mockRejectedValue(cleanupError),
      insertReportImageWithAudit: vi.fn().mockRejectedValue(insertError),
    });

    await expect(
      confirmReportImageUpload(
        adminActor,
        {
          contentType: "image/png",
          publicId: "lab-management/org-1/reports/report-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
          sizeBytes: 2048,
        },
        port
      )
    ).rejects.toBe(insertError);

    expect(consoleError).toHaveBeenCalledWith(
      "Không thể dọn ảnh Cloudinary sau lỗi ghi metadata ảnh báo cáo.",
      cleanupError
    );
    consoleError.mockRestore();
  });

  test("relies on the audited insert transaction for the confirm capacity guard", async () => {
    const port = createPort({
      countReportImages: vi.fn().mockResolvedValue(20),
    });

    await expect(
      confirmReportImageUpload(
        adminActor,
        {
          contentType: "image/png",
          publicId: "lab-management/org-1/reports/report-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
          sizeBytes: 2048,
        },
        port
      )
    ).resolves.toEqual({ imageId: "report-image-1" });

    expect(port.countReportImages).not.toHaveBeenCalled();
    expect(port.insertReportImageWithAudit).toHaveBeenCalled();
  });
});

describe("deleteReportImage", () => {
  test("rejects viewers before deleting report images", async () => {
    const port = createPort();

    await expect(
      deleteReportImage("report-image-1", viewerActor, port)
    ).rejects.toThrow("Bạn không có quyền xóa ảnh báo cáo.");

    expect(port.deleteCloudinaryImage).not.toHaveBeenCalled();
    expect(port.deleteReportImageRecordWithAudit).not.toHaveBeenCalled();
  });

  test("deletes the Cloudinary asset before the audited database record", async () => {
    const callOrder: string[] = [];
    const port = createPort({
      deleteCloudinaryImage: vi.fn(async () => {
        callOrder.push("cloudinary");
      }),
      deleteReportImageRecordWithAudit: vi.fn(async () => {
        callOrder.push("database");
      }),
      findReportImageForDelete: vi.fn().mockResolvedValue({
        publicId: "lab-management/org-1/reports/report-1",
      }),
    });

    await deleteReportImage("report-image-1", adminActor, port);

    expect(callOrder).toEqual(["cloudinary", "database"]);
  });

  test("surfaces audited database deletion failures after Cloudinary cleanup", async () => {
    const port = createPort({
      deleteReportImageRecordWithAudit: vi
        .fn()
        .mockRejectedValue(new Error("audit delete failed")),
      findReportImageForDelete: vi.fn().mockResolvedValue({
        publicId: "lab-management/org-1/reports/report-1",
      }),
    });

    await expect(
      deleteReportImage("report-image-1", adminActor, port)
    ).rejects.toThrow("audit delete failed");

    expect(port.deleteCloudinaryImage).toHaveBeenCalledWith(
      "lab-management/org-1/reports/report-1"
    );
  });

  test("keeps the database record when report image Cloudinary cleanup fails", async () => {
    const port = createPort({
      deleteCloudinaryImage: vi
        .fn()
        .mockRejectedValue(new Error("Cloudinary timeout")),
      findReportImageForDelete: vi.fn().mockResolvedValue({
        publicId: "lab-management/org-1/reports/report-1",
      }),
    });

    await expect(
      deleteReportImage("report-image-1", adminActor, port)
    ).rejects.toThrow("Cloudinary timeout");

    expect(port.deleteReportImageRecordWithAudit).not.toHaveBeenCalled();
  });
});
