import "server-only";

import { randomUUID } from "node:crypto";

import {
  buildCloudinaryDeliveryUrl,
  destroyCloudinaryImage,
} from "@/lib/cloudinary/server";

export {
  createCloudinaryUploadSignature,
  getCloudinaryServerEnv,
  getCloudinaryUploadUrl,
} from "@/lib/cloudinary/server";

/** Build a unique Cloudinary public id scoped to organization report images. */
export function createReportImagePublicId(input: { organizationId: string }) {
  return `${createReportImageFolder(input)}/${randomUUID()}`;
}

/** Build the Cloudinary folder path for shared report images. */
export function createReportImageFolder(input: { organizationId: string }) {
  return `lab-management/${input.organizationId}/reports`;
}

/** Build the optimized delivery URL for a report image public id. */
export function buildReportCloudinaryDeliveryUrl(input: {
  cloudName: string;
  publicId: string;
}) {
  return buildCloudinaryDeliveryUrl(input);
}

/** Delete a stored report image from Cloudinary by public id. */
export async function destroyReportCloudinaryImage(publicId: string) {
  return destroyCloudinaryImage(publicId);
}
