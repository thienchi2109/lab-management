import "server-only";

import { randomUUID } from "node:crypto";

export {
  buildCloudinaryDeliveryUrl,
  createCloudinaryUploadSignature,
  destroyCloudinaryImage,
  getCloudinaryDestroyUrl,
  getCloudinaryServerEnv,
  getCloudinaryUploadUrl,
  parseCloudinaryServerEnv,
  type CloudinaryServerEnv,
  type CloudinaryUploadSignature,
  type CloudinaryUploadSignatureInput,
} from "@/lib/cloudinary/server";

/** Build a unique Cloudinary public id scoped by organization and sample. */
export function createSampleImagePublicId(input: {
  organizationId: string;
  sampleId: string;
}) {
  return `${createSampleImageFolder(input)}/${randomUUID()}`;
}

/** Build the Cloudinary folder path for a sample's evidence images. */
export function createSampleImageFolder(input: {
  organizationId: string;
  sampleId: string;
}) {
  return `lab-management/${input.organizationId}/${input.sampleId}`;
}
