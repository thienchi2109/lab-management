/** Actor đã xác thực cho thao tác ảnh minh chứng của mẫu. */
export type SampleImageActor = {
  profileId: string;
  organizationId: string;
  canWrite: boolean;
};

/** Ảnh minh chứng đã chuẩn hóa để hiển thị trên dashboard. */
export type SampleImage = {
  id: string;
  contentType: string;
  createdAt: string;
  publicId: string;
  secureUrl: string;
  sizeBytes: number;
};

/** Payload audit an toàn cho thao tác thêm hoặc xóa ảnh minh chứng. */
export type SampleImageAuditInput = {
  organizationId: string;
  actorId: string;
  action: "sample_image.created" | "sample_image.deleted";
  entityTable: "sample_images";
  entityId: string;
  eventPayload: Record<string, unknown>;
};

/** Cổng hạ tầng cho metadata ảnh mẫu, audit và Cloudinary cleanup. */
export type SampleImagesPort = {
  sampleBelongsToOrganization(input: {
    sampleId: string;
    organizationId: string;
  }): Promise<boolean>;
  countImagesForSample(input: {
    sampleId: string;
    organizationId: string;
  }): Promise<number>;
  findSampleImageByPublicId(input: {
    publicId: string;
    organizationId: string;
  }): Promise<{ id: string } | null>;
  listSampleImages(input: {
    sampleId: string;
    organizationId: string;
  }): Promise<SampleImage[]>;
  insertSampleImage(input: {
    organizationId: string;
    sampleId: string;
    storageBucket: string;
    storagePath: string;
    contentType: string;
    sizeBytes: number;
    createdBy: string;
  }): Promise<{ imageId: string }>;
  deleteSampleImageRecord(input: {
    organizationId: string;
    sampleId: string;
    imageId: string;
  }): Promise<{ publicId: string } | null>;
  insertAuditEvent(input: SampleImageAuditInput): Promise<void>;
  deleteCloudinaryImage(publicId: string): Promise<void>;
};

/** Metadata file cần kiểm tra trước khi cấp chữ ký tải lên. */
export type PrepareSampleImageInput = {
  contentType: string;
  sizeBytes: number;
};

/** Metadata Cloudinary trả về khi trình duyệt tải lên thành công. */
export type ConfirmSampleImageInput = PrepareSampleImageInput & {
  publicId: string;
  secureUrl: string;
};

const ACCEPTED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_IMAGES_PER_SAMPLE = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_AUDIT_POLICY = "field-names-only";

/** Kiểm tra actor trước khi cấp chữ ký tải ảnh trực tiếp lên Cloudinary. */
export async function prepareSampleImageUpload(
  sampleId: string,
  actor: SampleImageActor,
  input: PrepareSampleImageInput,
  port: SampleImagesPort
) {
  ensureCanWrite(actor);
  validateImageMetadata(input);
  await ensureSampleAccess(sampleId, actor, port);
  await ensureImageSlotAvailable(sampleId, actor, port);
}

/** List Cloudinary-backed evidence images for a tenant-scoped sample. */
export async function getSampleImages(
  sampleId: string,
  actor: SampleImageActor,
  port: SampleImagesPort
) {
  await ensureSampleAccess(sampleId, actor, port);
  return port.listSampleImages({
    organizationId: actor.organizationId,
    sampleId,
  });
}

/** Lưu metadata tải lên Cloudinary trong `sample_images` và ghi audit. */
export async function confirmSampleImageUpload(
  sampleId: string,
  actor: SampleImageActor,
  input: ConfirmSampleImageInput,
  port: SampleImagesPort
) {
  ensureCanWrite(actor);
  validateImageMetadata(input);
  validateCloudinaryResult(input);
  await ensureSampleAccess(sampleId, actor, port);
  await ensureImageSlotAvailable(sampleId, actor, port);

  const duplicate = await port.findSampleImageByPublicId({
    organizationId: actor.organizationId,
    publicId: input.publicId,
  });

  if (duplicate) {
    throw new Error("Ảnh Cloudinary đã được ghi nhận trước đó.");
  }

  const result = await port.insertSampleImage({
    contentType: input.contentType,
    createdBy: actor.profileId,
    organizationId: actor.organizationId,
    sampleId,
    sizeBytes: input.sizeBytes,
    storageBucket: "cloudinary",
    storagePath: input.publicId,
  });

  await port.insertAuditEvent({
    action: "sample_image.created",
    actorId: actor.profileId,
    entityId: result.imageId,
    entityTable: "sample_images",
    eventPayload: {
      metadataPolicy: IMAGE_AUDIT_POLICY,
      sampleId,
      submittedFields: ["publicId", "contentType", "sizeBytes"],
    },
    organizationId: actor.organizationId,
  });

  return result;
}

/** Delete a sample image record and request Cloudinary asset cleanup. */
export async function deleteSampleImage(
  sampleId: string,
  imageId: string,
  actor: SampleImageActor,
  port: SampleImagesPort
) {
  ensureCanWrite(actor);
  await ensureSampleAccess(sampleId, actor, port);
  const deleted = await port.deleteSampleImageRecord({
    imageId,
    organizationId: actor.organizationId,
    sampleId,
  });

  if (!deleted) {
    throw new Error("Ảnh minh chứng không tồn tại.");
  }

  await port.deleteCloudinaryImage(deleted.publicId);
  await port.insertAuditEvent({
    action: "sample_image.deleted",
    actorId: actor.profileId,
    entityId: imageId,
    entityTable: "sample_images",
    eventPayload: {
      metadataPolicy: IMAGE_AUDIT_POLICY,
      sampleId,
      submittedFields: ["publicId"],
    },
    organizationId: actor.organizationId,
  });
}

function ensureCanWrite(actor: SampleImageActor) {
  if (!actor.canWrite) {
    throw new Error("Bạn không có quyền tải ảnh minh chứng.");
  }
}

function validateImageMetadata(input: PrepareSampleImageInput) {
  if (!ACCEPTED_CONTENT_TYPES.has(input.contentType)) {
    throw new Error("Định dạng ảnh không được hỗ trợ.");
  }

  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new Error("Dung lượng ảnh không hợp lệ.");
  }

  if (input.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Ảnh minh chứng không được vượt quá 5 MB.");
  }
}

function validateCloudinaryResult(input: ConfirmSampleImageInput) {
  if (!input.publicId.trim()) {
    throw new Error("Thiếu mã ảnh Cloudinary.");
  }

  if (!input.secureUrl.startsWith("https://res.cloudinary.com/")) {
    throw new Error("URL ảnh Cloudinary không hợp lệ.");
  }
}

async function ensureSampleAccess(
  sampleId: string,
  actor: SampleImageActor,
  port: SampleImagesPort
) {
  const exists = await port.sampleBelongsToOrganization({
    organizationId: actor.organizationId,
    sampleId,
  });

  if (!exists) {
    throw new Error(
      "Mẫu xét nghiệm không tồn tại hoặc không thuộc tổ chức hiện tại."
    );
  }
}

async function ensureImageSlotAvailable(
  sampleId: string,
  actor: SampleImageActor,
  port: SampleImagesPort
) {
  const count = await port.countImagesForSample({
    organizationId: actor.organizationId,
    sampleId,
  });

  if (count >= MAX_IMAGES_PER_SAMPLE) {
    throw new Error("Mỗi mẫu chỉ được tối đa 10 ảnh minh chứng.");
  }
}
