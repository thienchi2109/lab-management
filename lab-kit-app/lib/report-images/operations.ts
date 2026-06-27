/** Actor đã xác thực cho thao tác ảnh báo cáo. */
export type ReportImageActor = {
  profileId: string;
  organizationId: string;
  canManage: boolean;
};

/** Ảnh báo cáo đã chuẩn hóa để hiển thị trong tab Báo cáo. */
export type ReportImage = {
  id: string;
  contentType: string;
  createdAt: string;
  publicId: string;
  secureUrl: string;
  sizeBytes: number;
};

/** Payload audit an toàn cho thao tác thêm hoặc xóa ảnh báo cáo. */
export type ReportImageAuditInput = {
  organizationId: string;
  actorId: string;
  action: "report_image.created" | "report_image.deleted";
  entityTable: "report_images";
  entityId: string;
  eventPayload: Record<string, unknown>;
};

/** Cổng hạ tầng cho metadata ảnh báo cáo, audit và Cloudinary cleanup. */
export type ReportImagesPort = {
  countReportImages(input: { organizationId: string }): Promise<number>;
  findReportImageByPublicId(input: {
    organizationId: string;
    publicId: string;
  }): Promise<{ id: string } | null>;
  findReportImageForDelete(input: {
    imageId: string;
    organizationId: string;
  }): Promise<{ publicId: string } | null>;
  insertReportImageWithAudit(input: {
    auditEventPayload: Record<string, unknown>;
    contentType: string;
    createdBy: string;
    organizationId: string;
    sizeBytes: number;
    storageBucket: string;
    storagePath: string;
  }): Promise<{ imageId: string }>;
  deleteReportImageRecordWithAudit(input: {
    actorId: string;
    eventPayload: Record<string, unknown>;
    imageId: string;
    organizationId: string;
  }): Promise<void>;
  listReportImages(input: { organizationId: string }): Promise<ReportImage[]>;
  deleteCloudinaryImage(publicId: string): Promise<void>;
};

/** Metadata file cần kiểm tra trước khi cấp chữ ký upload ảnh báo cáo. */
export type PrepareReportImageInput = {
  contentType: string;
  sizeBytes: number;
};

/** Metadata Cloudinary trả về khi trình duyệt tải ảnh báo cáo thành công. */
export type ConfirmReportImageInput = PrepareReportImageInput & {
  publicId: string;
  secureUrl: string;
};

const ACCEPTED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
/** Giới hạn số ảnh đang lưu trong gallery báo cáo của một tenant. */
export const MAX_REPORT_IMAGES_PER_ORGANIZATION = 20;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_AUDIT_POLICY = "field-names-only";

/** Kiểm tra actor trước khi cấp chữ ký tải ảnh báo cáo lên Cloudinary. */
export async function prepareReportImageUpload(
  actor: ReportImageActor,
  input: PrepareReportImageInput,
  port: ReportImagesPort
) {
  ensureCanManage(actor, "tải");
  validateImageMetadata(input);
  await ensureReportImageSlotAvailable(actor, port);
}

/** List Cloudinary-backed report images for the actor organization. */
export async function getReportImages(
  actor: ReportImageActor,
  port: ReportImagesPort
) {
  return port.listReportImages({ organizationId: actor.organizationId });
}

/** Lưu metadata ảnh báo cáo tải lên Cloudinary và ghi audit. */
export async function confirmReportImageUpload(
  actor: ReportImageActor,
  input: ConfirmReportImageInput,
  port: ReportImagesPort
) {
  ensureCanManage(actor, "tải");
  validateImageMetadata(input);
  validateCloudinaryResult(input);
  await ensureReportImageSlotAvailable(actor, port);

  const duplicate = await port.findReportImageByPublicId({
    organizationId: actor.organizationId,
    publicId: input.publicId,
  });

  if (duplicate) {
    throw new Error("Ảnh Cloudinary đã được ghi nhận trước đó.");
  }

  return port.insertReportImageWithAudit({
    auditEventPayload: {
      metadataPolicy: IMAGE_AUDIT_POLICY,
      submittedFields: ["publicId", "contentType", "sizeBytes"],
    },
    contentType: input.contentType,
    createdBy: actor.profileId,
    organizationId: actor.organizationId,
    sizeBytes: input.sizeBytes,
    storageBucket: "cloudinary",
    storagePath: input.publicId,
  });
}

/** Delete a report image record and request Cloudinary asset cleanup. */
export async function deleteReportImage(
  imageId: string,
  actor: ReportImageActor,
  port: ReportImagesPort
) {
  ensureCanManage(actor, "xóa");
  const image = await port.findReportImageForDelete({
    imageId,
    organizationId: actor.organizationId,
  });

  if (!image) {
    throw new Error("Ảnh báo cáo không tồn tại.");
  }

  await port.deleteCloudinaryImage(image.publicId);
  await port.deleteReportImageRecordWithAudit({
    actorId: actor.profileId,
    eventPayload: {
      metadataPolicy: IMAGE_AUDIT_POLICY,
      submittedFields: ["publicId"],
    },
    imageId,
    organizationId: actor.organizationId,
  });
}

function ensureCanManage(actor: ReportImageActor, action: "tải" | "xóa") {
  if (!actor.canManage) {
    throw new Error(`Bạn không có quyền ${action} ảnh báo cáo.`);
  }
}

function validateImageMetadata(input: PrepareReportImageInput) {
  if (!ACCEPTED_CONTENT_TYPES.has(input.contentType)) {
    throw new Error("Định dạng ảnh không được hỗ trợ.");
  }

  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new Error("Dung lượng ảnh không hợp lệ.");
  }

  if (input.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Ảnh báo cáo không được vượt quá 5 MB.");
  }
}

function validateCloudinaryResult(input: ConfirmReportImageInput) {
  if (!input.publicId.trim()) {
    throw new Error("Thiếu mã ảnh Cloudinary.");
  }

  try {
    const url = new URL(input.secureUrl);

    if (url.protocol === "https:" && url.hostname === "res.cloudinary.com") {
      return;
    }
  } catch {
    throw new Error("URL ảnh Cloudinary không hợp lệ.");
  }

  throw new Error("URL ảnh Cloudinary không hợp lệ.");
}

async function ensureReportImageSlotAvailable(
  actor: ReportImageActor,
  port: ReportImagesPort
) {
  const count = await port.countReportImages({
    organizationId: actor.organizationId,
  });

  if (count >= MAX_REPORT_IMAGES_PER_ORGANIZATION) {
    throw new Error(
      "Gallery đang có đủ 20 ảnh. Hãy xóa bớt ảnh trước khi tải thêm."
    );
  }
}
