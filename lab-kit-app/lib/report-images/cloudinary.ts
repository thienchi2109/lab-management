import "server-only";

import { randomUUID } from "node:crypto";

/** Build a unique Cloudinary public id scoped to organization report images. */
export function createReportImagePublicId(input: { organizationId: string }) {
  return `${createReportImageFolder(input)}/${randomUUID()}`;
}

/** Build the Cloudinary folder path for shared report images. */
export function createReportImageFolder(input: { organizationId: string }) {
  return `lab-management/${input.organizationId}/reports`;
}
